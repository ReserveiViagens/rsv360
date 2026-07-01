import { propostasService } from '../../propostas/services/propostas.service';

export interface HotLeadInput {
  propostaId: number;
  clienteNome: string;
  clienteTelefone: string;
  hotel: string;
  datas: string;
  valor: number;
  urlPublica: string;
  profile: string;
}

export async function notifyHotLead(input: HotLeadInput): Promise<{ sent: boolean; error?: string }> {
  const dest = process.env.COTACAO_HOT_LEAD_WHATSAPP;
  const message = [
    '🔥 Hot Lead — Nova proposta gerada',
    `Cliente: ${input.clienteNome} | ${input.clienteTelefone}`,
    `Destino: ${input.hotel} | ${input.datas}`,
    `Total: R$ ${input.valor.toFixed(2)}`,
    `Ver roteiro: ${input.urlPublica}`,
    `Perfil: ${input.profile}`,
  ].join('\n');

  if (!process.env.EVOLUTION_API_KEY || !dest) {
    console.info('[hot-lead] Demo mode — mensagem não enviada:', message);
    await propostasService.logEvent(input.propostaId, 'hot_lead_skipped', 'Evolution API ou destino ausente', {
      demo: true,
    });
    return { sent: false, error: 'demo_mode' };
  }

  try {
    const { EvolutionAPIWhatsAppProvider } = await import(
      '../../communication/providers/whatsapp/evolution-api.provider'
    );
    const provider = new EvolutionAPIWhatsAppProvider();
    const result = await provider.sendMessage(dest, message);
    if (result.success) {
      await propostasService.logEvent(input.propostaId, 'hot_lead_sent', 'Alerta comercial enviado', {
        messageId: result.messageId,
      });
      return { sent: true };
    }
    await propostasService.logEvent(input.propostaId, 'hot_lead_failed', result.error ?? 'Falha', {});
    return { sent: false, error: result.error };
  } catch (err) {
    const msg = (err as Error).message;
    console.warn('[hot-lead] Erro:', msg);
    await propostasService.logEvent(input.propostaId, 'hot_lead_failed', msg, {});
    return { sent: false, error: msg };
  }
}

export function fireHotLeadNotify(input: HotLeadInput): void {
  void notifyHotLead(input).catch((err) => {
    console.warn('[hot-lead] async error:', err);
  });
}

module.exports = { notifyHotLead, fireHotLeadNotify };
