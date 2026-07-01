/** URL pública oficial para verificação de autenticidade do roteiro. */
export function buildRoteiroAutenticidadeUrl(token: string): string {
  const base =
    process.env.NEXT_PUBLIC_PUBLIC_BASE_URL ||
    process.env.PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://www.reserveiviagens.com.br';

  return `${base.replace(/\/$/, '')}/roteiro/verificar/${encodeURIComponent(token)}`;
}
