import {
  getAccommodationItemsByIds,
  getBreakfastById,
  type AccommodationItem,
  type AccommodationKit,
  type BreakfastOption,
} from '@/lib/cotacao-catalog';
import {
  COTACAO_FALLBACK_HOTEL,
  normalizeImageList,
} from '@/lib/cotacao-image-utils';
import type { AvailabilityItem, WizardState } from './wizard-types';

export const RSV_SUPPORT_PHONE = '6499319-7555';
export const RSV_SUPPORT_EMAIL = 'contato@reserveiviagens.com.br';

const FALLBACK_POOL =
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&h=400&fit=crop';
const FALLBACK_BREAKFAST =
  'https://images.unsplash.com/photo-1525351484163-752d94143d4f?w=600&h=400&fit=crop';
const FALLBACK_TICKET =
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&h=400&fit=crop';
const FALLBACK_KIT =
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop';
const FALLBACK_NATURE =
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop';
const FALLBACK_INSURANCE =
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop';

export type VoucherSection = {
  title: string;
  thumbnail?: string;
  bullets?: string[];
  paragraphs?: string[];
  footnote?: string;
};

export type SelectionVoucherDetails = {
  title: string;
  location: string;
  /** Banner horizontal no topo do modal */
  heroImage?: string;
  /** Até 3 miniaturas abaixo do hero (galeria rápida) */
  galleryImages?: string[];
  sections: VoucherSection[];
};

function imagesFromCatalogItem(item: AvailabilityItem): string[] {
  const fromMeta = normalizeImageList(item.metadata?.images);
  const merged = [...item.images, ...fromMeta].filter(Boolean);
  return [...new Set(merged)];
}

function heroFromItem(item: AvailabilityItem, fallback = COTACAO_FALLBACK_HOTEL): string {
  return imagesFromCatalogItem(item)[0] ?? fallback;
}

function galleryFromItem(item: AvailabilityItem, max = 3): string[] {
  const imgs = imagesFromCatalogItem(item);
  const unique = [...new Set(imgs)];
  return unique.length > 1 ? unique.slice(0, max) : [];
}

function heroFromBreakfast(breakfast: BreakfastOption): string {
  return breakfast.images[0] ?? FALLBACK_BREAKFAST;
}

function galleryFromBreakfast(breakfast: BreakfastOption): string[] {
  const unique = [...new Set(breakfast.images.filter(Boolean))];
  return unique.length > 1 ? unique.slice(0, 3) : [];
}

function heroFromKit(kit: AccommodationKit): string {
  return kit.images[0] ?? FALLBACK_KIT;
}

function galleryFromKit(kit: AccommodationKit): string[] {
  const unique = [...new Set(kit.images.filter(Boolean))];
  return unique.length > 1 ? unique.slice(0, 3) : [];
}

function formatDayLabel(iso: string): string {
  if (!iso) return '—';
  const d = new Date(`${iso}T12:00:00`);
  return `Dia ${d.getDate()}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function guestLabel(adults: number, children: number): string {
  const parts: string[] = [];
  if (adults) parts.push(`${adults} adulto${adults !== 1 ? 's' : ''}`);
  if (children) parts.push(`${children} criança${children !== 1 ? 's' : ''}`);
  return parts.join(' · ') || 'Conforme reserva';
}

function supportSection(): VoucherSection {
  return {
    title: 'SUPORTE RESERVEI VIAGENS',
    bullets: [
      `WhatsApp: ${RSV_SUPPORT_PHONE}`,
      `E-mail: ${RSV_SUPPORT_EMAIL}`,
      'Atendimento em horário comercial — Caldas Novas, GO',
    ],
  };
}

function policiesSection(): VoucherSection {
  return {
    title: 'POLÍTICAS IMPORTANTES',
    bullets: [
      'Valores sujeitos à confirmação de disponibilidade no ato da reserva.',
      'Cancelamento e alterações conforme regras do fornecedor parceiro.',
      'Documento com foto obrigatório no check-in para todos os hóspedes.',
    ],
    footnote:
      'Ao confirmar a proposta, você declara ter lido e concordado com as regras e inclusões deste item.',
  };
}

export function buildHotelVoucher(
  hotel: AvailabilityItem,
  state: WizardState,
  nights: number,
  guests: number,
): SelectionVoucherDetails {
  const titleParts = [hotel.title];
  if (state.suiteUpgrade) titleParts.push('Suíte Master');
  if (state.upgradeVaranda) titleParts.push('Varanda/vista');
  const title = titleParts.join(' + ');
  const breakfast = getBreakfastById(state.breakfastId);
  const hotelImgs = imagesFromCatalogItem(hotel);

  const regimeBullets = [
    breakfast
      ? `Café da manhã: ${breakfast.title} (${breakfast.description})`
      : 'Regime de hospedagem conforme tarifa selecionada',
    'Roupa de cama completa fornecida pelo hotel',
    state.suiteUpgrade
      ? 'Upgrade Suíte Master: quarto ampliado, amenidades premium e vista privilegiada (sujeito a disponibilidade)'
      : state.upgradeVaranda
        ? 'Upgrade varanda/vista selecionado (sujeito a disponibilidade da unidade)'
        : 'Apartamento padrão conforme capacidade contratada',
  ];

  return {
    title,
    location: hotel.location ?? 'Caldas Novas, GO',
    heroImage: heroFromItem(hotel),
    galleryImages: galleryFromItem(hotel),
    sections: [
      {
        title: 'DETALHES DA ESTADIA',
        bullets: [
          `Check-in: ${formatDayLabel(state.checkIn)} a partir das 14:00`,
          `Check-out: ${formatDayLabel(state.checkOut)} até as 12:00`,
          `Total de noites: ${nights}`,
          `Hóspedes: ${guestLabel(state.adults, state.children)} (${guests} pessoa${guests !== 1 ? 's' : ''})`,
          'Configuração do apartamento sujeita à disponibilidade',
        ],
      },
      {
        title: 'REGIME DE ALIMENTAÇÃO E SERVIÇOS',
        thumbnail: breakfast?.images[0] ?? FALLBACK_BREAKFAST,
        bullets: regimeBullets,
      },
      {
        title: 'ACESSO A ÁREAS DE LAZER',
        thumbnail: hotelImgs[1] ?? FALLBACK_POOL,
        paragraphs: ['O valor da hospedagem inclui acesso livre a:'],
        bullets: [
          'Piscinas (adulto, infantil e aquecida)',
          'Wi-Fi em áreas comuns e apartamentos',
          'Estacionamento (1 veículo por apartamento, conforme hotel)',
          'Transporte interno quando disponível no empreendimento',
        ],
        footnote:
          'Observação: uso de toalhas de piscina pode exigir depósito caução no hotel.',
      },
      ...(hotel.description
        ? [{ title: 'SOBRE O HOTEL', paragraphs: [hotel.description] }]
        : []),
      supportSection(),
      policiesSection(),
    ],
  };
}

export function buildTicketVoucher(
  ticket: AvailabilityItem,
  state: WizardState,
  guests: number,
): SelectionVoucherDetails {
  return {
    title: ticket.title,
    location: ticket.location ?? 'Caldas Novas, GO',
    heroImage: heroFromItem(ticket, FALLBACK_TICKET),
    galleryImages: galleryFromItem(ticket),
    sections: [
      {
        title: 'DETALHES DO INGRESSO',
        thumbnail: imagesFromCatalogItem(ticket)[0] ?? FALLBACK_TICKET,
        bullets: [
          `Quantidade: ${guests} ingresso${guests !== 1 ? 's' : ''}`,
          `Validade: ${formatDayLabel(state.checkIn)} a ${formatDayLabel(state.checkOut)}`,
          'Entrada conforme horário de funcionamento do parque',
          'Uso pessoal e intransferível',
        ],
      },
      {
        title: 'REGRAS DE UTILIZAÇÃO',
        bullets: [
          'Apresentar documento com foto na entrada',
          'Crianças seguem política de idade do parque aquático',
          'Proibido entrada com alimentos e bebidas externas (salvo exceções do parque)',
          'Pulseira ou voucher digital será enviado após confirmação da proposta',
        ],
        ...(ticket.description ? { paragraphs: [ticket.description] } : {}),
      },
      supportSection(),
      policiesSection(),
    ],
  };
}

export function buildAttractionVoucher(
  attr: AvailabilityItem,
  guests: number,
): SelectionVoucherDetails {
  return {
    title: attr.title,
    location: attr.location ?? 'Caldas Novas, GO',
    heroImage: heroFromItem(attr, FALLBACK_NATURE),
    galleryImages: galleryFromItem(attr),
    sections: [
      {
        title: 'DETALHES DA ATRAÇÃO',
        thumbnail: imagesFromCatalogItem(attr)[0] ?? FALLBACK_NATURE,
        bullets: [
          `Participantes: ${guests} pessoa${guests !== 1 ? 's' : ''}`,
          'Entrada gratuita ou conforme tarifa informada no parque',
          'Horários sujeitos à temporada e condições climáticas',
        ],
        ...(attr.description ? { paragraphs: [attr.description] } : {}),
      },
      {
        title: 'RECOMENDAÇÕES',
        bullets: [
          'Use calçado confortável e protetor solar',
          'Leve água e documento de identificação',
          'Consulte nossa equipe para roteiro otimizado no dia',
        ],
      },
      supportSection(),
      policiesSection(),
    ],
  };
}

export function buildBreakfastVoucher(
  breakfast: BreakfastOption,
  state: WizardState,
  nights: number,
  guests: number,
): SelectionVoucherDetails {
  return {
    title: breakfast.title,
    location: 'Caldas Novas, GO',
    heroImage: heroFromBreakfast(breakfast),
    galleryImages: galleryFromBreakfast(breakfast),
    sections: [
      {
        title: 'REGIME DE CAFÉ DA MANHÃ',
        thumbnail: breakfast.images[0] ?? FALLBACK_BREAKFAST,
        bullets: [
          `Servido diariamente das 06h às 10h — Restaurante Principal`,
          `Período: ${nights} dia${nights !== 1 ? 's' : ''} (${formatDayLabel(state.checkIn)} a ${formatDayLabel(state.checkOut)})`,
          `Cobertura: ${guests} hóspede${guests !== 1 ? 's' : ''} por dia`,
          breakfast.description,
        ],
      },
      {
        title: 'O QUE ESTÁ INCLUSO',
        bullets: [
          'Buffet conforme categoria selecionada',
          'Bebidas quentes e sucos naturais',
          'Opções para restrições alimentares mediante aviso prévio',
        ],
      },
      supportSection(),
      policiesSection(),
    ],
  };
}

export function buildKitVoucher(kit: AccommodationKit, guests: number): SelectionVoucherDetails {
  const itemLabels = getAccommodationItemsByIds([...new Set(kit.items)]);
  const counts = kit.items.reduce<Record<string, number>>((acc, id) => {
    acc[id] = (acc[id] ?? 0) + 1;
    return acc;
  }, {});
  const inventoryLines = itemLabels.map((item) => {
    const qty = counts[item.id] ?? 1;
    return `${qty}× ${item.title}`;
  });

  return {
    title: kit.title,
    location: 'Caldas Novas, GO',
    heroImage: heroFromKit(kit),
    galleryImages: galleryFromKit(kit),
    sections: [
      {
        title: 'KIT DE ACOMODAÇÃO',
        thumbnail: kit.images[0] ?? FALLBACK_KIT,
        bullets: [
          kit.description,
          `Tarifa fixa por estadia — referência para ${guests} hóspede${guests !== 1 ? 's' : ''}`,
          'Entrega e troca conforme política do hotel parceiro',
        ],
      },
      {
        title: 'ITENS INCLUSOS NO KIT',
        bullets: inventoryLines.length ? inventoryLines : kit.items,
      },
      supportSection(),
      policiesSection(),
    ],
  };
}

export function buildItemsVoucher(items: AccommodationItem[]): SelectionVoucherDetails {
  return {
    title: 'Itens avulsos de acomodação',
    location: 'Caldas Novas, GO',
    heroImage: FALLBACK_KIT,
    sections: [
      {
        title: 'ITENS CONTRATADOS',
        thumbnail: FALLBACK_KIT,
        bullets: items.map((i) => `${i.title} — R$ ${i.price.toFixed(2)}/un (por estadia)`),
      },
      {
        title: 'OBSERVAÇÕES',
        bullets: [
          'Quantidade conforme seleção no passo de acomodação',
          'Disponibilidade sujeita ao estoque do hotel',
        ],
      },
      supportSection(),
      policiesSection(),
    ],
  };
}

export function buildInsuranceVoucher(guests: number): SelectionVoucherDetails {
  return {
    title: 'Seguro Assistência Local',
    location: 'Caldas Novas, GO',
    heroImage: FALLBACK_INSURANCE,
    sections: [
      {
        title: 'COBERTURA',
        thumbnail: FALLBACK_INSURANCE,
        bullets: [
          `Proteção para ${guests} pessoa${guests !== 1 ? 's' : ''}`,
          'Emergências médicas leves em parques aquáticos',
          'Orientação telefônica 24h durante a estadia',
          'Não substitui seguro viagem nacional/internacional completo',
        ],
      },
      {
        title: 'COMO ACIONAR',
        bullets: [
          `Contato: ${RSV_SUPPORT_PHONE}`,
          'Tenha em mãos documento e comprovante da proposta',
        ],
      },
      supportSection(),
      policiesSection(),
    ],
  };
}
