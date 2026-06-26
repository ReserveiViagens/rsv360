export function montarUrlIndicacao(
  siteUrl: string,
  tokenProposta: string,
  indicadorId: number,
  canal?: string,
): string {
  const params = new URLSearchParams({ ref: String(indicadorId) });
  if (canal) params.set('canal', canal);
  const base = siteUrl.replace(/\/$/, '');
  return `${base}/proposta/${encodeURIComponent(tokenProposta)}?${params.toString()}`;
}
