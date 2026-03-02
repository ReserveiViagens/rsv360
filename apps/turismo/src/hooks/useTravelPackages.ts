// ===================================================================
// HOOK PARA COMPARTILHAR PACOTES DE VIAGEM
// ===================================================================

import { useState, useEffect } from 'react';

export interface TravelPackage {
  id: string;
  title: string;
  destination: string;
  location: string;
  description: string;
  shortDescription: string;
  price: number;
  originalPrice?: number;
  duration: number;
  maxGuests: number;
  rating: number;
  reviewCount: number;
  images: string[];
  amenities: string[];
  category: 'beach' | 'mountain' | 'city' | 'adventure' | 'romantic' | 'family';
  season: 'summer' | 'winter' | 'spring' | 'autumn' | 'all';
  difficulty: 'easy' | 'medium' | 'hard';
  highlights: string[];
  itinerary: any[];
  inclusions: string[];
  exclusions: string[];
  cancellationPolicy: string;
  isPopular: boolean;
  isFeatured: boolean;
  discount?: number;
  availableDates: Date[];
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
  };
}

const mockPackages: TravelPackage[] = [
  {
    id: '1',
    title: 'Caldas Novas - Águas Termais',
    destination: 'Caldas Novas',
    location: 'Goiás, Brasil',
    description: 'Desfrute das famosas águas termais de Caldas Novas em um pacote completo com hospedagem, passeios e muito relaxamento.',
    shortDescription: 'Águas termais famosas em Goiás com hospedagem completa.',
    price: 1200,
    originalPrice: 1500,
    duration: 3,
    maxGuests: 4,
    rating: 4.8,
    reviewCount: 1247,
    images: ['/caldas-novas-1.jpg', '/caldas-novas-2.jpg', '/caldas-novas-3.jpg'],
    amenities: ['wifi', 'piscina', 'spa', 'restaurante', 'estacionamento'],
    category: 'beach',
    season: 'all',
    difficulty: 'easy',
    highlights: ['Águas termais', 'Parques aquáticos', 'Relaxamento total'],
    itinerary: [
      {
        day: 1,
        title: 'Chegada e Relaxamento',
        description: 'Check-in no hotel e primeiro contato com as águas termais.',
        activities: ['Check-in', 'Tour pelo hotel', 'Primeira sessão de águas termais'],
        meals: ['Jantar']
      }
    ],
    inclusions: ['Hospedagem', 'Café da manhã', 'Acesso às águas termais'],
    exclusions: ['Passagens aéreas', 'Almoço e jantar', 'Passeios extras'],
    cancellationPolicy: 'Cancelamento gratuito até 7 dias antes da viagem.',
    isPopular: true,
    isFeatured: true,
    discount: 20,
    availableDates: [new Date('2024-02-15'), new Date('2024-02-22')],
    contactInfo: {
      phone: '(64) 99319-7555',
      email: 'reservas@reserveiviagens.com.br'
    }
  },
  {
    id: '2',
    title: 'Fernando de Noronha - Paraíso Natural',
    destination: 'Fernando de Noronha',
    location: 'Pernambuco, Brasil',
    description: 'Explore o arquipélago mais preservado do Brasil com suas praias paradisíacas e vida marinha única.',
    shortDescription: 'Arquipélago preservado com praias paradisíacas e mergulho.',
    price: 3500,
    duration: 5,
    maxGuests: 2,
    rating: 4.9,
    reviewCount: 892,
    images: ['/noronha-1.jpg', '/noronha-2.jpg'],
    amenities: ['wifi', 'restaurante', 'mergulho', 'snorkel'],
    category: 'beach',
    season: 'summer',
    difficulty: 'medium',
    highlights: ['Mergulho', 'Praias paradisíacas', 'Vida marinha'],
    itinerary: [],
    inclusions: ['Hospedagem', 'Café da manhã', 'Mergulho'],
    exclusions: ['Passagens aéreas', 'Taxa ambiental'],
    cancellationPolicy: 'Cancelamento com 30 dias de antecedência.',
    isPopular: true,
    isFeatured: false,
    availableDates: [new Date('2024-03-01'), new Date('2024-03-10')],
    contactInfo: {
      phone: '(81) 99999-9999',
      email: 'reservas@reserveiviagens.com.br'
    }
  },
  {
    id: '3',
    title: 'Gramado - Serra Gaúcha',
    destination: 'Gramado',
    location: 'Rio Grande do Sul, Brasil',
    description: 'Conheça a charmosa cidade de Gramado com seus chocolates, vinícolas e paisagens serranas.',
    shortDescription: 'Cidade charmosa com chocolates e vinícolas na serra gaúcha.',
    price: 1800,
    originalPrice: 2200,
    duration: 4,
    maxGuests: 4,
    rating: 4.7,
    reviewCount: 1563,
    images: ['/gramado-1.jpg', '/gramado-2.jpg'],
    amenities: ['wifi', 'restaurante', 'estacionamento', 'aquecimento'],
    category: 'mountain',
    season: 'winter',
    difficulty: 'easy',
    highlights: ['Chocolates', 'Vinícolas', 'Paisagens serranas'],
    itinerary: [],
    inclusions: ['Hospedagem', 'Café da manhã', 'Tour pelas vinícolas'],
    exclusions: ['Passagens aéreas', 'Almoço e jantar'],
    cancellationPolicy: 'Cancelamento gratuito até 14 dias antes.',
    isPopular: true,
    isFeatured: true,
    discount: 18,
    availableDates: [new Date('2024-06-01'), new Date('2024-08-31')],
    contactInfo: {
      phone: '(54) 99999-9999',
      email: 'reservas@reserveiviagens.com.br'
    }
  }
];

export const useTravelPackages = () => {
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento
    setTimeout(() => {
      setPackages(mockPackages);
      setLoading(false);
    }, 500);
  }, []);

  return { packages, loading, setPackages };
};
