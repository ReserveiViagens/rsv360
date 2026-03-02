/**
 * Dados de exemplos reais de leilões para a página /leiloes.
 * Usa hotéis de Caldas Novas com coordenadas e imagens otimizadas.
 */
import { hotelsData, type Hotel } from './hotels-data';
import { getCoordinatesByHotelName } from './caldas-novas-coordinates';

export interface AuctionExample {
  id: string;
  hotelId: string;
  title: string;
  location: string;
  rating: number;
  reviewCount: number;
  pricePerNight: number;
  originalPrice?: number;
  images: string[];
  coordinates: { lat: number; lng: number };
  amenities?: string[];
}

/** Hotéis com imagens otimizadas em /images/hotels/{id}/ */
const HOTELS_WITH_OPTIMIZED_IMAGES = new Set([
  'lagoa-eco-towers', 'piazza-diroma', 'spazzio-diroma', 'lacqua-diroma',
  'praias-do-lago-eco-resort', 'resort-do-lago', 'diroma-fiori',
  'hotel-parque-das-primaveras', 'hotel-ctc', 'hotel-marina-flat',
  'golden-dolphin-express', 'hotsprings-b3-hoteis', 'imperio-romano',
  'lagoa-quente-hotel', 'rio-das-pedras-thermas', 'thermas-do-bandeirante',
  'thermas-place', 'aquarius-residence', 'araras-apart-service',
  'boulevard-prive-suite', 'casa-da-madeira', 'diroma-exclusive',
  'eldorado-flat', 'everest-flat-service', 'fiore-prime-flat',
  'le-jardin-suites', 'paradise-flat-residence', 'recanto-do-bosque-flat',
  'the-villeneuve-residence', 'aldeia-do-lago', 'alta-vista-thermas',
  'ecologic-park', 'ecologic-ville-resort', 'ilhas-do-lago',
  'parque-veredas', 'prive-das-thermas', 'recanto-do-bosque',
  'riviera-sem-ruidos', 'thermas-place', 'aguas-da-fonte',
]);

function getImagesForHotel(hotel: Hotel): string[] {
  if (HOTELS_WITH_OPTIMIZED_IMAGES.has(hotel.id)) {
    return [
      `/images/hotels/${hotel.id}/1.webp`,
      `/images/hotels/${hotel.id}/2.webp`,
      `/images/hotels/${hotel.id}/3.webp`,
      `/images/hotels/${hotel.id}/4.webp`,
    ];
  }
  return hotel.images.filter((src) => src.startsWith('/'));
}

/**
 * Retorna exemplos reais de leilões baseados nos hotéis de Caldas Novas.
 * Cada item tem coordenadas do mapa e imagens otimizadas quando disponíveis.
 */
export function getAuctionExamples(): AuctionExample[] {
  return hotelsData.map((hotel) => {
    const coords = getCoordinatesByHotelName(hotel.id);
    const images = getImagesForHotel(hotel);
    const pricePerNight = hotel.price;
    const originalPrice = hotel.originalPrice;
    return {
      id: `example-${hotel.id}`,
      hotelId: hotel.id,
      title: hotel.name,
      location: `Caldas Novas, GO`,
      rating: hotel.rating,
      reviewCount: hotel.reviewCount,
      pricePerNight,
      originalPrice,
      images,
      coordinates: coords,
      amenities: hotel.amenities,
    };
  });
}

/** Retorna exemplos para o mapa (formato AuctionMapItem - id numérico fictício 9xxx) */
export function getAuctionExamplesForMap() {
  return getAuctionExamples().map((ex, i) => ({
    id: 9000 + i,
    title: ex.title,
    lat: ex.coordinates.lat,
    lng: ex.coordinates.lng,
    status: 'active' as const,
  }));
}
