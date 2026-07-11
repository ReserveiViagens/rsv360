import { eq } from 'drizzle-orm';
import { db } from '../../../lib/db';
import { cotacaoLeads } from '../../../../backend/src/db/schema/cotacao-leads';
import { EvolutionAPIWhatsAppProvider } from '../../communication/providers/whatsapp/evolution-api.provider';

export interface LeadAbandonoInput {
  passo: number;
  passoNome?: string;
  whatsapp?: string | null;
  nome?: string | null;
  hotelId?: string | null;
  checkin?: string | null;
  checkout?: string | null;
  adults?: number | null;
  children?: number | null;
  ref?: string | null;
  canal?: string | null;
  consentimentoLgpd: boolean;
  sessaoId?: string | null;
  variant?: string;
  payload?: Record<string, unknown>;
}

export interface LeadAbandonoResult {
  id: number;
  enviadoWhatsapp: boolean;
  analyticsOnly: boolean;
  error?: string;
}

async function enviarWhatsAppAbandono(input: LeadAbandonoInput): Promise<{ sent: boolean; error?: string }> {
  const dest = input.whatsapp?.replace(/\D/g, '');
  if (!dest) return { sent: false, error: 'whatsapp_ausente' };

  const destinoComercial = process.env.COTACAO_ABANDONO_WHATSAPP ?? process.env.COTACAO_HOT_LEAD_WHATSAPP;
  const message = [
    '📋 Lead de abandono — wizard /cotacao',
    input.nome ? `Nome: ${input.nome}` : null,
    `WhatsApp: ${input.whatsapp}`,
    `Passo: ${(input.passo ?? 0) + 1}${input.passoNome ? ` (${input.passoNome})` : ''}`,
    input.hotelId ? `Hotel: ${input.hotelId}` : null,
    input.checkin && input.checkout ? `Datas: ${input.checkin} → ${input.checkout}` : null,
    input.ref ? `Ref MGM: ${input.ref}` : null,
    input.canal ? `Canal: ${input.canal}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  if (!process.env.EVOLUTION_API_KEY || !destinoComercial) {
    console.info('[lead-abandono] Demo mode — mensagem não enviada:', message);
    return { sent: false, error: 'demo_mode' };
  }

  try {
    const provider = new EvolutionAPIWhatsAppProvider();
    const result = await provider.sendMessage(destinoComercial, message);
    if (result.success) return { sent: true };
    return { sent: false, error: result.error ?? 'falha_evolution' };
  } catch (err) {
    return { sent: false, error: (err as Error).message };
  }
}

export async function registrarLeadAbandono(input: LeadAbandonoInput): Promise<LeadAbandonoResult> {
  const consentimento = Boolean(input.consentimentoLgpd);
  const whatsapp = input.whatsapp?.trim() || null;

  const [row] = await db
    .insert(cotacaoLeads)
    .values({
      whatsapp,
      nome: input.nome?.trim() || null,
      passoAbandonado: input.passo,
      hotelId: input.hotelId ?? null,
      checkin: input.checkin ?? null,
      checkout: input.checkout ?? null,
      adults: input.adults ?? null,
      children: input.children ?? null,
      refIndicacao: input.ref ?? null,
      canal: input.canal ?? null,
      payload: input.payload ?? null,
      consentimentoLgpd: consentimento,
      enviadoWhatsapp: false,
      sessaoId: input.sessaoId ?? null,
    })
    .returning();

  let enviadoWhatsapp = false;
  let whatsappErro: string | undefined;

  if (whatsapp && consentimento) {
    const send = await enviarWhatsAppAbandono(input);
    enviadoWhatsapp = send.sent;
    whatsappErro = send.error;
    await db
      .update(cotacaoLeads)
      .set({ enviadoWhatsapp, whatsappErro: whatsappErro ?? null })
      .where(eq(cotacaoLeads.id, row.id));
  }

  return {
    id: row.id,
    enviadoWhatsapp,
    analyticsOnly: !whatsapp || !consentimento,
    error: whatsappErro,
  };
}

export function fireLeadAbandono(input: LeadAbandonoInput): void {
  void registrarLeadAbandono(input).catch((err) => {
    console.warn('[lead-abandono] async error:', err);
  });
}
