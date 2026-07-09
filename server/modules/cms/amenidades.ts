/** Whitelist de amenidades da vitrine (códigos estáveis para filtro). */
export const AMENIDADE_CODES = [
  'piscina_termal',
  'parque_aquatico',
  'sauna',
  'academia',
  'pet_friendly',
  'wifi',
  'estacionamento',
  'restaurante',
  'bar_molhado',
  'piscina_infantil',
  'area_kids',
  'upgrade_varanda',
  'premium',
  'acesso_parque',
] as const;

export type AmenidadeCode = (typeof AMENIDADE_CODES)[number];

export const AMENIDADE_LABELS: Record<AmenidadeCode, string> = {
  piscina_termal: 'Piscina termal',
  parque_aquatico: 'Parque aquático',
  sauna: 'Sauna',
  academia: 'Academia',
  pet_friendly: 'Pet friendly',
  wifi: 'Wi-Fi',
  estacionamento: 'Estacionamento',
  restaurante: 'Restaurante',
  bar_molhado: 'Bar molhado',
  piscina_infantil: 'Piscina infantil',
  area_kids: 'Área kids',
  upgrade_varanda: 'Upgrade varanda',
  premium: 'Premium',
  acesso_parque: 'Acesso parque',
};

const CODE_SET = new Set<string>(AMENIDADE_CODES);

export function isAmenidadeCode(value: string): value is AmenidadeCode {
  return CODE_SET.has(value);
}

export function sanitizeAmenidades(input: unknown): AmenidadeCode[] {
  if (!Array.isArray(input)) return [];
  const out: AmenidadeCode[] = [];
  for (const item of input) {
    const code = String(item ?? '').trim();
    if (isAmenidadeCode(code) && !out.includes(code)) out.push(code);
  }
  return out;
}

/** Heurística: texto livre de features → códigos (fallback até CMS preencher). */
export function inferAmenidadesFromFeatures(features: unknown): AmenidadeCode[] {
  if (!Array.isArray(features)) return [];
  const text = features.map((f) => String(f).toLowerCase()).join(' | ');
  const found: AmenidadeCode[] = [];
  const rules: Array<[RegExp, AmenidadeCode]> = [
    [/term(al|as)|águas termais|aguas termais/, 'piscina_termal'],
    [/parque aqu|acqua park|water park/, 'parque_aquatico'],
    [/sauna/, 'sauna'],
    [/academia|fitness|gym/, 'academia'],
    [/pet/, 'pet_friendly'],
    [/wi-?fi|wifi/, 'wifi'],
    [/estacionamento|parking/, 'estacionamento'],
    [/restaurante/, 'restaurante'],
    [/bar molhado|swim-?up/, 'bar_molhado'],
    [/piscina infantil|kids pool/, 'piscina_infantil'],
    [/área kids|area kids|kids club/, 'area_kids'],
    [/varanda|upgrade varanda/, 'upgrade_varanda'],
    [/premium|supreme|âncora|ancora/, 'premium'],
    [/acesso (ao )?parque|ingresso parque/, 'acesso_parque'],
  ];
  for (const [re, code] of rules) {
    if (re.test(text) && !found.includes(code)) found.push(code);
  }
  return found;
}

/** content_ids Etapa A — hard delete bloqueado. */
export const ETAPA_A_CONTENT_IDS = [
  'atrium-thermas',
  'lacqua-diroma',
  'a-guas-da-fonte',
  'aldeia-do-lago',
  'alta-vista-thermas',
  'aquarius-residence',
  'priva-das-thermas-i',
  'diroma-fiori',
  'sol-das-caldas',
  'diroma-acqua-park',
  'golden-dolphin-supreme',
] as const;

export const DEMO_CONTENT_IDS = ['hotel-demo-1', 'hotel-demo-2'] as const;
