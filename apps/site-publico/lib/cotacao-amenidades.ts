/** Whitelist espelhada do backend (client-safe). */
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

export const AMENIDADE_ICONS: Record<AmenidadeCode, string> = {
  piscina_termal: '♨️',
  parque_aquatico: '🎢',
  sauna: '🧖',
  academia: '🏋️',
  pet_friendly: '🐾',
  wifi: '📶',
  estacionamento: '🅿️',
  restaurante: '🍽️',
  bar_molhado: '🍹',
  piscina_infantil: '🧒',
  area_kids: '🧸',
  upgrade_varanda: '🌅',
  premium: '⭐',
  acesso_parque: '🎫',
};

const CODE_SET = new Set<string>(AMENIDADE_CODES);

export function resolveHotelAmenidades(meta: Record<string, unknown> | undefined): AmenidadeCode[] {
  if (!meta) return [];
  const raw = meta.amenidades;
  if (Array.isArray(raw)) {
    return raw.map(String).filter((c): c is AmenidadeCode => CODE_SET.has(c));
  }
  const features = Array.isArray(meta.features) ? meta.features.map((f) => String(f).toLowerCase()).join(' | ') : '';
  if (!features) return [];
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
    if (re.test(features) && !found.includes(code)) found.push(code);
  }
  return found;
}
