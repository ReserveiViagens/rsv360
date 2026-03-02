/**
 * Coordenadas dos hotéis de Caldas Novas (45 hotéis da documentação).
 * Usado para lookup quando auction/hotel não possui lat/lng.
 * Fonte: hotels-data.ts + documentação dos 45 hotéis.
 */

export interface HotelCoords {
  lat: number;
  lng: number;
  name: string;
}

/** Centro de Caldas Novas, GO */
export const CALDAS_NOVAS_CENTER = { lat: -17.7444, lng: -48.6278 };

/** Mapeamento: id ou nome normalizado → coordenadas */
const COORDS_BY_ID: Record<string, HotelCoords> = {
  'aguas-da-fonte': { lat: -17.768916, lng: -48.62444, name: 'Águas da Fonte' },
  'atrium-thermas': { lat: -17.745, lng: -48.62, name: 'Atrium Thermas' },
  'aldeia-do-lago': { lat: -17.766997, lng: -48.638742, name: 'Aldeia do Lago' },
  'alta-vista-thermas': { lat: -17.749051, lng: -48.640722, name: 'Alta Vista Thermas' },
  'aquarius-residence': { lat: -17.740197, lng: -48.633557, name: 'Aquarius Residence' },
  'araras-apart-service': { lat: -17.757685, lng: -48.617001, name: 'ARARAS Apart Service' },
  'boulevard-prive': { lat: -17.733899, lng: -48.621996, name: 'Boulevard Prive Suite Hotel' },
  'boulevard-prive-suite': { lat: -17.733899, lng: -48.621996, name: 'Boulevard Prive Suite Hotel' },
  'casa-da-madeira': { lat: -17.734268, lng: -48.621407, name: 'Casa da Madeira' },
  'diroma-exclusive': { lat: -17.746285, lng: -48.607189, name: 'DiRoma Exclusive' },
  'ecologic-park': { lat: -17.738551, lng: -48.609805, name: 'Ecologic Park' },
  'ecologic-ville': { lat: -17.757281, lng: -48.64205, name: 'Ecologic Ville Resort' },
  'ecologic-ville-resort': { lat: -17.757281, lng: -48.64205, name: 'Ecologic Ville Resort' },
  'eldorado-flat': { lat: -17.757575, lng: -48.632082, name: 'Eldorado Flat' },
  'everest-flat': { lat: -17.740672, lng: -48.61248, name: 'Everest Flat Service' },
  'everest-flat-service': { lat: -17.740672, lng: -48.61248, name: 'Everest Flat Service' },
  'fiore-prime': { lat: -17.731706, lng: -48.611318, name: 'Fiore Prime Flat' },
  'fiore-prime-flat': { lat: -17.731706, lng: -48.611318, name: 'Fiore Prime Flat' },
  'fiori-diroma': { lat: -17.759496, lng: -48.62467, name: 'DiRoma Fiori' },
  'diroma-fiori': { lat: -17.759496, lng: -48.62467, name: 'DiRoma Fiori' },
  'golden-dolphin-gran': { lat: -17.739327, lng: -48.61231, name: 'Golden Dolphin Gran Hotel' },
  'golden-dolphin-gran-hotel': { lat: -17.739327, lng: -48.61231, name: 'Golden Dolphin Caldas Novas Gran Hotel' },
  'golden-dolphin-express': { lat: -17.741915, lng: -48.644597, name: 'Golden Dolphin Express' },
  'hotel-marina': { lat: -17.74803, lng: -48.628708, name: 'Hotel Marina Flat' },
  'hotel-marina-flat': { lat: -17.74803, lng: -48.628708, name: 'Hotel Marina Flat' },
  'hotel-parque-primaveras': { lat: -17.744872, lng: -48.641904, name: 'Hotel Parque das Primaveras' },
  'hotel-parque-das-primaveras': { lat: -17.744872, lng: -48.641904, name: 'Hotel Parque das Primaveras' },
  'hotel-ctc': { lat: -17.72725, lng: -48.639652, name: 'Hotel CTC' },
  'hotsprings-b3': { lat: -17.724755, lng: -48.624708, name: 'HotSprings B3 Hotéis' },
  'hotsprings-b3-hoteis': { lat: -17.724755, lng: -48.624708, name: 'HotSprings B3 Hotéis' },
  'ilhas-do-lago': { lat: -17.756886, lng: -48.613801, name: 'Ilhas do Lago' },
  'imperio-romano': { lat: -17.768591, lng: -48.650523, name: 'Império Romano' },
  'lacqua-di-roma': { lat: -17.72876, lng: -48.62984, name: 'Lacqua DiRoma' },
  'lacqua-diroma': { lat: -17.72876, lng: -48.62984, name: 'Lacqua DiRoma' },
  'lagoa-eco-towers': { lat: -17.7444, lng: -48.6278, name: 'Lagoa Eco Towers' },
  'lagoa-quente': { lat: -17.721206, lng: -48.644051, name: 'Lagoa Quente Hotel' },
  'lagoa-quente-hotel': { lat: -17.721206, lng: -48.644051, name: 'Lagoa Quente Hotel' },
  'le-jardin': { lat: -17.722904, lng: -48.614629, name: 'Le Jardin Suítes' },
  'le-jardin-suites': { lat: -17.722904, lng: -48.614629, name: 'Le Jardin Suítes' },
  'paradise-flat': { lat: -17.743776, lng: -48.612124, name: 'Paradise Flat Residence' },
  'paradise-flat-residence': { lat: -17.743776, lng: -48.612124, name: 'Paradise Flat Residence' },
  'parque-veredas': { lat: -17.73072, lng: -48.628413, name: 'Parque Veredas' },
  'piazza-diroma': { lat: -17.7444, lng: -48.6278, name: 'Piazza DiRoma' },
  'praias-do-lago': { lat: -17.731076, lng: -48.619533, name: 'Praias do Lago Eco Resort' },
  'praias-do-lago-eco-resort': { lat: -17.731076, lng: -48.619533, name: 'Praias do Lago Eco Resort' },
  'prive-das-thermas': { lat: -17.748509, lng: -48.651739, name: 'Prive das Thermas' },
  'recanto-do-bosque': { lat: -17.746176, lng: -48.624994, name: 'Recanto do Bosque' },
  'recanto-do-bosque-flat': { lat: -17.74444, lng: -48.628767, name: 'Recanto do Bosque Flat Service' },
  'resort-do-lago': { lat: -17.764485, lng: -48.641918, name: 'Resort do Lago' },
  'rio-das-pedras': { lat: -17.738003, lng: -48.632629, name: 'Rio das Pedras Thermas' },
  'rio-das-pedras-thermas': { lat: -17.738003, lng: -48.632629, name: 'Rio das Pedras Thermas Hotel' },
  'riviera': { lat: -17.75306, lng: -48.638046, name: 'Riviera sem Ruídos' },
  'riviera-sem-ruidos': { lat: -17.75306, lng: -48.638046, name: 'Riviera sem Ruídos' },
  'spazzio-diroma': { lat: -17.7444, lng: -48.6278, name: 'Spazzio DiRoma' },
  't-bandeirantes': { lat: -17.759018, lng: -48.618962, name: 'T. Bandeirantes' },
  'the-villeneuve': { lat: -17.743734, lng: -48.634181, name: 'The Villeneuve Residence' },
  'the-villeneuve-residence': { lat: -17.743734, lng: -48.634181, name: 'The Villeneuve Residence' },
  'thermas-bandeirante': { lat: -17.735383, lng: -48.609742, name: 'Thermas do Bandeirante' },
  'thermas-do-bandeirante': { lat: -17.735383, lng: -48.609742, name: 'Thermas do Bandeirante' },
  'thermas-place': { lat: -17.761908, lng: -48.63129, name: 'Thermas Place' },
  'hotel-santa-clara': { lat: -17.74, lng: -48.63, name: 'Hotel Santa Clara' },
  'villas-diroma': { lat: -17.745, lng: -48.625, name: 'Villas DiRoma' },
  'morada-das-aguas': { lat: -17.742, lng: -48.628, name: 'Hotel Morada das Águas' },
};

/** Normaliza string para lookup (lowercase, remove acentos e espaços extras) */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Busca coordenadas por nome ou id do hotel.
 * Retorna Caldas Novas center se não encontrar.
 */
export function getCoordinatesByHotelName(nameOrId: string): { lat: number; lng: number } {
  if (!nameOrId || typeof nameOrId !== 'string') return CALDAS_NOVAS_CENTER;

  const n = normalize(nameOrId);

  // Busca direta por id
  if (COORDS_BY_ID[n]) {
    return { lat: COORDS_BY_ID[n].lat, lng: COORDS_BY_ID[n].lng };
  }

  // Busca por match parcial nos nomes
  for (const [key, val] of Object.entries(COORDS_BY_ID)) {
    if (n.includes(key) || key.includes(n)) return { lat: val.lat, lng: val.lng };
    const nameNorm = normalize(val.name);
    if (nameNorm.includes(n) || n.includes(nameNorm)) return { lat: val.lat, lng: val.lng };
  }

  return CALDAS_NOVAS_CENTER;
}
