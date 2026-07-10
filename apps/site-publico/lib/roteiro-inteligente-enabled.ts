/** Client flag — estrito === 'true' (espelha server). */
export function isRoteiroInteligenteClientEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ROTEIRO_INTELIGENTE_ENABLED === 'true';
}
