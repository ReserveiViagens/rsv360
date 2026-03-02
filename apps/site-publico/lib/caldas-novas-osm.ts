/**
 * Dados OSM para mapa Caldas Novas + Rio Quente.
 * Preços atualizados diretamente do site público (hotelsData).
 * 45 hotéis Caldas Novas + 15 atrações Rio Quente.
 */
import { hotelsData } from './hotels-data';
import { getCoordinatesByHotelName } from './caldas-novas-coordinates';

export interface CaldasNovasOSMItem {
  id: string;
  name: string;
  lat: number;
  lng: number;
  tourism: 'hotel' | 'theme_park' | 'attraction' | 'resort';
  price: string;
  image: string;
  phone?: string;
  rsv360Verified: boolean;
  brand?: string;
  website?: string;
  whatsapp?: string;
  slug?: string;
}

/** Imagem principal do hotel (otimizada ou fallback) */
function getMainImage(hotelId: string, fallbackImages: string[]): string {
  const opt = `/images/hotels/${hotelId}/1.webp`;
  if (fallbackImages?.[0]?.startsWith('/')) return fallbackImages[0];
  return opt;
}

/** 45 hotéis de Caldas Novas - preços do site público */
function getCaldasNovasHotels(): CaldasNovasOSMItem[] {
  return hotelsData.map((h) => {
    const coords = getCoordinatesByHotelName(h.id);
    const priceStr = h.originalPrice
      ? `R$ ${h.price.toLocaleString('pt-BR')} - R$ ${h.originalPrice.toLocaleString('pt-BR')}`
      : `R$ ${h.price.toLocaleString('pt-BR')}`;
    const slug = h.id;
    return {
      id: h.id,
      name: h.name,
      lat: coords.lat,
      lng: coords.lng,
      tourism: 'hotel' as const,
      price: priceStr,
      image: getMainImage(h.id, h.images),
      rsv360Verified: true,
      brand: 'RSV360 Verified',
      website: `/hotel/${slug}`,
      slug,
    };
  });
}

/** 15 atrações de Rio Quente (CSV fornecido) */
const RIO_QUENTE_ATTRACTIONS: Omit<CaldasNovasOSMItem, 'id'>[] = [
  { name: 'Hotel Taiyo Premium', lat: -17.4852, lng: -48.6241, tourism: 'hotel', price: '250-450 BRL', image: 'https://imgur.com/taiyo.jpg', phone: '+556436232121', rsv360Verified: true, brand: 'RSV360 Verified', website: 'www.taiyo.com.br', whatsapp: '+5564999999999' },
  { name: 'Prive Lago dos Cisnes', lat: -17.4848, lng: -48.6235, tourism: 'hotel', price: '300-550 BRL', image: 'https://imgur.com/lago-cisnes.jpg', phone: '+556436232300', rsv360Verified: true, brand: 'RSV360 Verified', website: 'www.privelago.com.br', whatsapp: '+5564999999901' },
  { name: 'Hotel Inacai Business', lat: -17.4861, lng: -48.6229, tourism: 'hotel', price: '180-350 BRL', image: 'https://imgur.com/inacai.jpg', phone: '+556436231234', rsv360Verified: true, brand: 'RSV360 Verified', website: 'www.inacai.com.br', whatsapp: '+5564999999902' },
  { name: 'Hotel Pousada Vitória', lat: -17.487, lng: -48.6238, tourism: 'hotel', price: '150-280 BRL', image: 'https://imgur.com/vitoria.jpg', phone: '+556436232456', rsv360Verified: true, brand: 'RSV360 Verified', website: 'www.pousadavitoria.com.br', whatsapp: '+5564999999903' },
  { name: 'Hotel Águas Quentes', lat: -17.4839, lng: -48.6251, tourism: 'hotel', price: '220-400 BRL', image: 'https://imgur.com/aguas-quentes.jpg', phone: '+556436231100', rsv360Verified: true, brand: 'RSV360 Verified', website: 'www.hotelaguasquentes.com.br', whatsapp: '+5564999999904' },
  { name: 'Óleo e Uvas Eco Hotel', lat: -17.4885, lng: -48.6212, tourism: 'hotel', price: '280-500 BRL', image: 'https://imgur.com/oleouvas.jpg', phone: '+556436233333', rsv360Verified: true, brand: 'RSV360 Verified', website: 'www.oleouvas.com.br', whatsapp: '+5564999999905' },
  { name: 'Hotel Fazenda Taiyo', lat: -17.4892, lng: -48.6205, tourism: 'hotel', price: '320-580 BRL', image: 'https://imgur.com/fazenda-taiyo.jpg', phone: '+556436234567', rsv360Verified: true, brand: 'RSV360 Verified', website: 'www.fazendataiyo.com.br', whatsapp: '+5564999999906' },
  { name: 'Park Lago Club Hotel', lat: -17.4821, lng: -48.6263, tourism: 'hotel', price: '200-380 BRL', image: 'https://imgur.com/parklago.jpg', phone: '+556436235678', rsv360Verified: true, brand: 'RSV360 Verified', website: 'www.parklago.com.br', whatsapp: '+5564999999907' },
  { name: 'Hotel Panorama', lat: -17.4878, lng: -48.6247, tourism: 'hotel', price: '160-300 BRL', image: 'https://imgur.com/panorama.jpg', phone: '+556436236789', rsv360Verified: true, brand: 'RSV360 Verified', website: 'www.hotelpanorama.com.br', whatsapp: '+5564999999908' },
  { name: 'Hotel Morada dos Pássaros', lat: -17.4815, lng: -48.6271, tourism: 'hotel', price: '260-480 BRL', image: 'https://imgur.com/moradapassaros.jpg', phone: '+556436237890', rsv360Verified: true, brand: 'RSV360 Verified', website: 'www.moradapassaros.com.br', whatsapp: '+5564999999909' },
  { name: 'Water Park Lagoa Quente', lat: -17.4845, lng: -48.6248, tourism: 'theme_park', price: '80-120 BRL', image: 'https://imgur.com/lagoaquente.jpg', phone: '+556436238901', rsv360Verified: true, brand: 'RSV360 Attractions', website: 'www.lagoaquente.com.br', whatsapp: '+5564999999910' },
  { name: 'Otium Hot Park', lat: -17.4942, lng: -48.6198, tourism: 'theme_park', price: '120-200 BRL', image: 'https://imgur.com/otium.jpg', phone: '+556433632525', rsv360Verified: true, brand: 'RSV360 Attractions', website: 'www.otiumhotpark.com.br', whatsapp: '+5564999999911' },
  { name: 'Japanese Park Taiyo', lat: -17.4858, lng: -48.6232, tourism: 'attraction', price: '60-100 BRL', image: 'https://imgur.com/parquejapones.jpg', phone: '+556436239012', rsv360Verified: true, brand: 'RSV360 Attractions', website: 'www.parquetaiyo.com.br', whatsapp: '+5564999999912' },
  { name: 'Lago Corumbá IV', lat: -17.4829, lng: -48.6256, tourism: 'attraction', price: 'Grátis', image: 'https://imgur.com/lagocorumba.jpg', phone: '+556436240123', rsv360Verified: true, brand: 'RSV360 Attractions', website: 'www.caldasnovas.go.gov.br', whatsapp: '+5564999999913' },
  { name: 'Vila Abaeté', lat: -17.4867, lng: -48.6224, tourism: 'resort', price: '350-650 BRL', image: 'https://imgur.com/vilaabaete.jpg', phone: '+556436241234', rsv360Verified: true, brand: 'RSV360 Premium', website: 'www.vilaabaete.com.br', whatsapp: '+5564999999914' },
];

/** Todos os pontos para o mapa (45 hotéis Caldas Novas + 15 Rio Quente) */
export function getCaldasNovasOSMData(): CaldasNovasOSMItem[] {
  const hotels = getCaldasNovasHotels();
  const attractions = RIO_QUENTE_ATTRACTIONS.map((a, i) => ({
    ...a,
    id: `rio-quente-${i}`,
    slug: a.name.toLowerCase().replace(/\s+/g, '-').normalize('NFD').replace(/\p{Diacritic}/gu, ''),
  }));
  return [...hotels, ...attractions];
}
