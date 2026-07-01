/** Link WhatsApp para re-cotação quando a proposta expirou. */
export function buildConsultorWhatsAppUrl(titulo: string, token: string): string {
  const texto = `Olá! Minha proposta "${titulo}" (${token}) expirou. Gostaria de atualizar as tarifas.`;
  return `https://wa.me/5564999999999?text=${encodeURIComponent(texto)}`;
}
