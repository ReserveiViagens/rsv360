export function formatAcomodacaoConfigLabel(
  configSala: string,
  configBanheiro: string,
  quartos: number,
  capacidadeMax: number,
): string {
  const sala =
    configSala === 'sofa_cama' ? 'sofá-cama' : configSala === 'cama_na_sala' ? 'cama na sala' : '';
  const banheiro =
    configBanheiro === 'so_suite'
      ? 'suíte'
      : configBanheiro === 'suite_wc_social'
        ? 'suíte + WC social'
        : 'WC social';
  const quartosLabel = quartos > 0 ? `${quartos} qt` : 'Studio';
  return `${quartosLabel} · ${banheiro}${sala ? ` · ${sala}` : ''} · até ${capacidadeMax} pessoa(s)`;
}
