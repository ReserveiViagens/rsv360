import { eq } from 'drizzle-orm';
import { db } from '../../../lib/db';
import { propostas } from '../../../../backend/src/db/schema/propostas';
import { propostasService } from './propostas.service';
import { EvolutionAPIWhatsAppProvider } from '../../communication/providers/whatsapp/evolution-api.provider';
import { CommunicationProviderFactory } from '../../communication/providers/factory';

function buildRoteiroUrl(token: string): string {
  const base =
    process.env.COTACAO_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'http://localhost:3000';
  return `${base.replace(/\/$/, '')}/roteiro/${encodeURIComponent(token)}`;
}

function extractDestino(conteudo: unknown): string {
  if (!conteudo || typeof conteudo !== 'object') return 'sua viagem';
  const inc = (conteudo as { inclusions?: { destination?: string } }).inclusions;
  return inc?.destination ?? 'sua viagem';
}

function parseMetadata(raw: unknown): Record<string, unknown> {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  return {};
}

/** LGPD: WhatsApp só com telefone e consentimento registrado (ou aceite implícito pós-compra). */
export function temConsentimentoWhatsApp(row: {
  clienteTelefone?: string | null;
  metadata?: unknown;
  status: string;
}): boolean {
  if (!row.clienteTelefone?.trim()) return false;
  const meta = parseMetadata(row.metadata);
  if (meta.consentimentoLgpd === false) return false;
  if (meta.consentimentoLgpd === true) return true;
  return ['accepted', 'paid'].includes(row.status);
}

async function enviarWhatsApp(telefone: string, message: string): Promise<{ ok: boolean; error?: string }> {
  if (!process.env.EVOLUTION_API_KEY) {
    return { ok: false, error: 'evolution_api_ausente' };
  }
  try {
    const provider = new EvolutionAPIWhatsAppProvider();
    const result = await provider.sendMessage(telefone, message);
    return { ok: result.success, error: result.error };
  } catch (err) {
    const msg = (err as Error).message;
    console.warn('[propostas] roteiro-entrega WhatsApp erro:', msg);
    return { ok: false, error: msg };
  }
}

async function enviarEmail(email: string, subject: string, message: string): Promise<{ ok: boolean; error?: string }> {
  if (!process.env.SENDGRID_API_KEY && !(process.env.SMTP_HOST && process.env.SMTP_PASS)) {
    return { ok: false, error: 'email_provider_ausente' };
  }
  try {
    const provider = CommunicationProviderFactory.getProvider('default', 'email');
    if (!provider?.email) return { ok: false, error: 'email_provider_ausente' };
    const result = await provider.email.sendEmail(email, subject, message);
    return { ok: result.success, error: result.error };
  } catch (err) {
    const msg = (err as Error).message;
    console.warn('[propostas] roteiro-entrega e-mail erro:', msg);
    return { ok: false, error: msg };
  }
}

function hasOutboundChannelsConfigured(): boolean {
  const whatsapp = Boolean(process.env.EVOLUTION_API_KEY);
  const email = Boolean(
    process.env.SENDGRID_API_KEY || (process.env.SMTP_HOST && process.env.SMTP_PASS),
  );
  return whatsapp || email;
}

async function marcarRoteiroEntregue(propostaId: number): Promise<void> {
  await db
    .update(propostas)
    .set({ roteiroEntregue: true, updatedAt: new Date() })
    .where(eq(propostas.id, propostaId));
}

/** Envia link do roteiro premium ao cliente após aceite da proposta (idempotente). */
export async function entregarLinkRoteiroPosCompra(propostaId: number) {
  const [row] = await db.select().from(propostas).where(eq(propostas.id, propostaId));
  if (!row) {
    return { skipped: true, reason: 'not_found' as const };
  }
  if (!row.isPublica || !row.tokenPublico) {
    return { skipped: true, reason: 'not_public' as const };
  }
  if (!['accepted', 'paid'].includes(row.status)) {
    return { skipped: true, reason: 'status_invalido' as const, status: row.status };
  }
  if (row.roteiroEntregue) {
    return { skipped: true, reason: 'ja_entregue' as const, propostaId };
  }

  const destino = extractDestino(row.conteudo);
  const link = buildRoteiroUrl(row.tokenPublico);
  const nome = row.clienteNome ?? 'viajante';
  const message = [
    `Olá, ${nome}! Sua proposta foi confirmada.`,
    `Acesse seu roteiro premium exclusivo para ${destino}:`,
    link,
    'Reservei Viagens — RSV360',
  ].join('\n');

  let whatsappOk = false;
  let emailOk = false;
  const errors: string[] = [];

  if (temConsentimentoWhatsApp(row)) {
    const wa = await enviarWhatsApp(row.clienteTelefone!, message);
    whatsappOk = wa.ok;
    if (!wa.ok && wa.error) errors.push(`whatsapp:${wa.error}`);
  } else if (row.clienteTelefone) {
    errors.push('whatsapp:sem_consentimento_lgpd');
  }

  if (row.clienteEmail) {
    const em = await enviarEmail(
      row.clienteEmail,
      `Seu roteiro premium — ${destino}`,
      message,
    );
    emailOk = em.ok;
    if (!em.ok && em.error) errors.push(`email:${em.error}`);
  }

  if (!whatsappOk && !emailOk) {
    if (!hasOutboundChannelsConfigured()) {
      console.info('[propostas] roteiro-entrega demo mode ✓', { propostaId, message });
      await propostasService.logEvent(propostaId, 'roteiro_link_demo', 'Link do roteiro simulado (demo)', {
        link,
        demo: true,
      });
      await marcarRoteiroEntregue(propostaId);
      return { sent: true, demo: true, propostaId, link };
    }

    await propostasService.logEvent(
      propostaId,
      'roteiro_link_failed',
      errors.join('; ') || 'Falha no envio',
      { link, errors },
    );
    return { sent: false, error: errors.join('; ') || 'send_failed', propostaId };
  }

  await propostasService.logEvent(propostaId, 'roteiro_link_sent', 'Link do roteiro enviado ao cliente', {
    link,
    whatsapp: whatsappOk,
    email: emailOk,
  });
  await marcarRoteiroEntregue(propostaId);
  console.log('[propostas] roteiro-entrega enviado ✓', { propostaId, whatsappOk, emailOk });

  return { sent: true, whatsappOk, emailOk, propostaId, link };
}

export function fireEntregaLinkRoteiro(propostaId: number): void {
  void entregarLinkRoteiroPosCompra(propostaId).catch((err) => {
    console.warn('[propostas] roteiro-entrega async error:', err);
  });
}

module.exports = {
  entregarLinkRoteiroPosCompra,
  fireEntregaLinkRoteiro,
  temConsentimentoWhatsApp,
};
