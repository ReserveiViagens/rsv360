import crypto from 'node:crypto';
import QRCode from 'qrcode';
import { and, eq } from 'drizzle-orm';
import { db } from '../../../lib/db';
import { propostas } from '../../../../backend/src/db/schema/propostas';
import {
  propostaVouchers,
  VOUCHER_SLUGS,
  type VoucherSlug,
} from '../../../../backend/src/db/schema/proposta-vouchers';

export class QrVoucherError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 403) {
    super(message);
    this.name = 'QrVoucherError';
    this.statusCode = statusCode;
  }
}

function getQrSecret(): string {
  const secret = process.env.QR_SECRET;
  if (secret?.trim()) return secret.trim();
  if (process.env.NODE_ENV === 'production') {
    throw new QrVoucherError('QR_SECRET não configurado', 500);
  }
  return 'dev-qr-secret-rsv360';
}

function publicBaseUrl(): string {
  return (
    process.env.COTACAO_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'http://localhost:3000'
  ).replace(/\/$/, '');
}

function parseMetadata(raw: unknown): Record<string, unknown> {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  return {};
}

function parseConteudo(raw: unknown): Record<string, unknown> {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  return {};
}

function timingSafeEqualStr(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

export function assinarQrToken(propostaId: number, voucherSlug: string, exp: number): string {
  const payload = Buffer.from(JSON.stringify({ p: propostaId, v: voucherSlug, e: exp })).toString(
    'base64url',
  );
  const sig = crypto.createHmac('sha256', getQrSecret()).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verificarAssinaturaQrToken(
  qrToken: string,
): { propostaId: number; voucherSlug: string; exp: number } | null {
  const dot = qrToken.lastIndexOf('.');
  if (dot <= 0) return null;
  const payload = qrToken.slice(0, dot);
  const sig = qrToken.slice(dot + 1);
  const expected = crypto.createHmac('sha256', getQrSecret()).update(payload).digest('base64url');
  if (!timingSafeEqualStr(sig, expected)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      p?: number;
      v?: string;
      e?: number;
    };
    if (
      typeof parsed.p !== 'number' ||
      typeof parsed.v !== 'string' ||
      typeof parsed.e !== 'number'
    ) {
      return null;
    }
    return { propostaId: parsed.p, voucherSlug: parsed.v, exp: parsed.e };
  } catch {
    return null;
  }
}

export function buildVerificarUrl(qrToken: string): string {
  return `${publicBaseUrl()}/verificar/${encodeURIComponent(qrToken)}`;
}

function calcExpMs(checkOut?: string | null): number {
  if (checkOut && /^\d{4}-\d{2}-\d{2}$/.test(checkOut)) {
    return new Date(`${checkOut}T23:59:59.000Z`).getTime() + 24 * 60 * 60 * 1000;
  }
  return Date.now() + 90 * 24 * 60 * 60 * 1000;
}

function isVoucherSlug(slug: string): slug is VoucherSlug {
  return (VOUCHER_SLUGS as readonly string[]).includes(slug);
}

function definicoesVoucher(
  slug: VoucherSlug,
  proposta: typeof propostas.$inferSelect,
): {
  titulo: string;
  hospede: string;
  unidade: string | null;
  checkIn: string | null;
  checkOut: string | null;
} {
  const meta = parseMetadata(proposta.metadata);
  const conteudo = parseConteudo(proposta.conteudo);
  const inclusions = (conteudo.inclusions ?? {}) as Record<string, unknown>;
  const checkIn = typeof meta.checkIn === 'string' ? meta.checkIn : null;
  const checkOut = typeof meta.checkOut === 'string' ? meta.checkOut : null;
  const hotel =
    typeof inclusions.hotel === 'string'
      ? inclusions.hotel
      : typeof meta.hotelId === 'string'
        ? meta.hotelId
        : null;

  const base = {
    hospede: proposta.clienteNome,
    unidade: hotel,
    checkIn,
    checkOut,
  };

  if (slug === 'hotel') {
    return { ...base, titulo: 'Voucher de Hospedagem', unidade: hotel ?? 'Hospedagem' };
  }
  if (slug === 'ingressos') {
    return { ...base, titulo: 'Ingressos & Atrações', unidade: 'Pacote de ingressos' };
  }
  return { ...base, titulo: 'QR Code de Check-in', unidade: hotel ?? 'Check-in' };
}

async function assertPropostaQrElegivel(tokenPublico: string) {
  const [row] = await db.select().from(propostas).where(eq(propostas.tokenPublico, tokenPublico));
  if (!row || !row.isPublica) {
    throw new QrVoucherError('Proposta não encontrada', 404);
  }
  if (!['accepted', 'paid'].includes(row.status)) {
    throw new QrVoucherError('QR disponível apenas após confirmação da proposta', 403);
  }
  return row;
}

export async function materializarVouchersProposta(proposta: typeof propostas.$inferSelect) {
  for (const slug of VOUCHER_SLUGS) {
    const def = definicoesVoucher(slug, proposta);
    const [existing] = await db
      .select()
      .from(propostaVouchers)
      .where(
        and(
          eq(propostaVouchers.propostaId, proposta.id),
          eq(propostaVouchers.voucherSlug, slug),
        ),
      )
      .limit(1);

    if (existing) continue;

    await db.insert(propostaVouchers).values({
      propostaId: proposta.id,
      voucherSlug: slug,
      titulo: def.titulo,
      hospede: def.hospede,
      unidade: def.unidade,
      checkIn: def.checkIn,
      checkOut: def.checkOut,
    });
  }
}

/** Gera PNG do QR assinado (payload → /verificar/:qrToken). */
export async function gerarQrVoucherPng(tokenPublico: string, voucherSlugRaw: string): Promise<Buffer> {
  if (!isVoucherSlug(voucherSlugRaw)) {
    throw new QrVoucherError('Voucher inválido', 400);
  }

  const proposta = await assertPropostaQrElegivel(tokenPublico);
  await materializarVouchersProposta(proposta);

  const meta = parseMetadata(proposta.metadata);
  const checkOut = typeof meta.checkOut === 'string' ? meta.checkOut : null;
  const exp = calcExpMs(checkOut);
  const qrToken = assinarQrToken(proposta.id, voucherSlugRaw, exp);
  const verifyUrl = buildVerificarUrl(qrToken);

  return QRCode.toBuffer(verifyUrl, {
    type: 'png',
    margin: 1,
    width: 280,
    errorCorrectionLevel: 'M',
  });
}

export async function verificarVoucherPorQrToken(qrToken: string) {
  const parsed = verificarAssinaturaQrToken(qrToken);
  if (!parsed) {
    throw new QrVoucherError('Token QR inválido ou adulterado', 403);
  }
  if (Date.now() > parsed.exp) {
    throw new QrVoucherError('Token QR expirado', 403);
  }

  const [proposta] = await db
    .select()
    .from(propostas)
    .where(eq(propostas.id, parsed.propostaId));
  if (!proposta || !proposta.isPublica) {
    throw new QrVoucherError('Proposta não encontrada', 404);
  }
  if (!['accepted', 'paid'].includes(proposta.status)) {
    throw new QrVoucherError('Voucher indisponível para esta proposta', 403);
  }

  await materializarVouchersProposta(proposta);

  const [voucher] = await db
    .select()
    .from(propostaVouchers)
    .where(
      and(
        eq(propostaVouchers.propostaId, parsed.propostaId),
        eq(propostaVouchers.voucherSlug, parsed.voucherSlug),
      ),
    )
    .limit(1);

  if (!voucher) {
    throw new QrVoucherError('Voucher não encontrado', 404);
  }

  if (!voucher.voucherValidadoEm) {
    await db
      .update(propostaVouchers)
      .set({ voucherValidadoEm: new Date(), updatedAt: new Date() })
      .where(eq(propostaVouchers.id, voucher.id));
  }

  return {
    valido: true,
    hospede: voucher.hospede ?? proposta.clienteNome,
    unidade: voucher.unidade,
    checkIn: voucher.checkIn,
    checkOut: voucher.checkOut,
    status: proposta.status,
    titulo: voucher.titulo,
    voucherSlug: voucher.voucherSlug,
    validadoEm: voucher.voucherValidadoEm?.toISOString() ?? new Date().toISOString(),
  };
}

export function isQrVoucherError(error: unknown): boolean {
  return (
    error instanceof QrVoucherError ||
    (typeof error === 'object' &&
      error !== null &&
      (error as { name?: string }).name === 'QrVoucherError')
  );
}

module.exports = {
  QrVoucherError,
  assinarQrToken,
  verificarAssinaturaQrToken,
  buildVerificarUrl,
  gerarQrVoucherPng,
  verificarVoucherPorQrToken,
  materializarVouchersProposta,
  isQrVoucherError,
};
