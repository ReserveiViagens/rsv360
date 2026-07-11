import { eq } from 'drizzle-orm';
import { db } from '../../../lib/db';
import { propostas } from '../../../../backend/src/db/schema/propostas';
import { ConfigService } from '../../configuracoes/config.service';
import { PROPOSTA_STATUS_FECHADO } from '../proposta-validade';
import { propostasService } from './propostas.service';
import {
  logPropostaAlert,
  recordAvisoRecuperacao,
} from '../metrics';
import { EvolutionAPIWhatsAppProvider } from '../../communication/providers/whatsapp/evolution-api.provider';
import { CommunicationProviderFactory } from '../../communication/providers/factory';

const AVISO_SKIP_STATUS = [...PROPOSTA_STATUS_FECHADO, 'expired', 'rejected'] as const;

function extractDestino(conteudo: unknown): string {
  if (!conteudo || typeof conteudo !== 'object') return 'sua viagem';
  const inc = (conteudo as { inclusions?: { destination?: string } }).inclusions;
  return inc?.destination ?? 'sua viagem';
}

function buildPropostaUrl(token: string): string {
  const base =
    process.env.COTACAO_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'http://localhost:3000';
  return `${base.replace(/\/$/, '')}/proposta/${token}`;
}

function horasRestantes(validoAte: Date): number {
  return Math.max(1, Math.ceil((validoAte.getTime() - Date.now()) / (60 * 60 * 1000)));
}

function hasOutboundChannelsConfigured(): boolean {
  const whatsapp = Boolean(process.env.EVOLUTION_API_KEY);
  const email = Boolean(
    process.env.SENDGRID_API_KEY || (process.env.SMTP_HOST && process.env.SMTP_PASS),
  );
  return whatsapp || email;
}

async function marcarAvisoEnviado(propostaId: number): Promise<void> {
  await db
    .update(propostas)
    .set({ avisoExpiracaoEnviado: true, updatedAt: new Date() })
    .where(eq(propostas.id, propostaId));
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
    console.warn('[propostas] aviso-expiracao WhatsApp erro:', msg);
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
    console.warn('[propostas] aviso-expiracao e-mail erro:', msg);
    return { ok: false, error: msg };
  }
}

/** Dispara aviso de expiração se a proposta ainda estiver aberta (revalida status no momento da execução). */
export async function enviarAvisoExpiracaoSeNecessario(propostaId: number) {
  const [row] = await db.select().from(propostas).where(eq(propostas.id, propostaId));
  if (!row) {
    return { skipped: true, reason: 'not_found' as const };
  }
  if (!row.isPublica) {
    return { skipped: true, reason: 'not_public' as const };
  }
  if ((AVISO_SKIP_STATUS as readonly string[]).includes(row.status)) {
    console.log('[propostas] aviso-expiracao ignorado (status fechado)', {
      propostaId,
      status: row.status,
    });
    return { skipped: true, reason: 'status_fechado' as const, status: row.status };
  }
  if (row.avisoExpiracaoEnviado) {
    return { skipped: true, reason: 'already_sent' as const };
  }
  if (!row.validoAte) {
    return { skipped: true, reason: 'no_valido_ate' as const };
  }

  const config = await ConfigService.obterRegrasCotacao();
  const avisoHoras = config.avisoExpiracaoHoras ?? 2;
  const validoAte = new Date(row.validoAte);
  const janelaInicio = validoAte.getTime() - avisoHoras * 60 * 60 * 1000;
  const agora = Date.now();

  if (agora < janelaInicio) {
    return { skipped: true, reason: 'too_early' as const };
  }
  if (agora >= validoAte.getTime()) {
    return { skipped: true, reason: 'already_expired' as const };
  }

  const destino = extractDestino(row.conteudo);
  const horas = horasRestantes(validoAte);
  const token = row.tokenPublico ?? String(propostaId);
  const link = buildPropostaUrl(token);
  const message = `Faltam ${horas} horas para garantirmos suas tarifas para ${destino}. Finalize agora: ${link}`;

  let whatsappOk = false;
  let emailOk = false;
  const errors: string[] = [];

  if (row.clienteTelefone) {
    const wa = await enviarWhatsApp(row.clienteTelefone, message);
    whatsappOk = wa.ok;
    if (!wa.ok && wa.error) errors.push(`whatsapp:${wa.error}`);
  }

  if (row.clienteEmail) {
    const em = await enviarEmail(row.clienteEmail, `Últimas horas — ${destino}`, message);
    emailOk = em.ok;
    if (!em.ok && em.error) errors.push(`email:${em.error}`);
  }

  if (!whatsappOk && !emailOk) {
    if (!hasOutboundChannelsConfigured()) {
      console.info('[propostas] aviso-expiracao demo mode ✓', { propostaId, message });
      await marcarAvisoEnviado(propostaId);
      recordAvisoRecuperacao('demo', 'demo');
      await propostasService.logEvent(propostaId, 'aviso_expiracao_demo', 'Aviso simulado (demo)', {
        message,
        horasRestantes: horas,
      });
      return { sent: true, demo: true, propostaId };
    }

    if (errors.some((e) => e.startsWith('whatsapp:'))) {
      recordAvisoRecuperacao('failed', 'whatsapp');
    }
    if (errors.some((e) => e.startsWith('email:'))) {
      recordAvisoRecuperacao('failed', 'email');
    }
    if (errors.length === 0) {
      recordAvisoRecuperacao('failed', 'unknown');
    }
    logPropostaAlert(
      'aviso_expiracao_failed',
      { propostaId, errors: errors.join('; ') || 'send_failed', horasRestantes: horas },
      `[AvisoExpiracao] Falha ao enviar notificação para a proposta ${propostaId}`,
    );
    await propostasService.logEvent(
      propostaId,
      'aviso_expiracao_failed',
      errors.join('; ') || 'Falha no envio',
      { horasRestantes: horas },
    );
    return { sent: false, error: errors.join('; ') || 'send_failed', propostaId };
  }

  await marcarAvisoEnviado(propostaId);
  if (whatsappOk) recordAvisoRecuperacao('sent', 'whatsapp');
  if (emailOk) recordAvisoRecuperacao('sent', 'email');
  await propostasService.logEvent(propostaId, 'aviso_expiracao_sent', 'Aviso de expiração enviado', {
    whatsapp: whatsappOk,
    email: emailOk,
    horasRestantes: horas,
    link,
  });
  console.log('[propostas] aviso-expiracao enviado ✓', { propostaId, whatsappOk, emailOk });

  return { sent: true, whatsappOk, emailOk, propostaId };
}

module.exports = { enviarAvisoExpiracaoSeNecessario };
