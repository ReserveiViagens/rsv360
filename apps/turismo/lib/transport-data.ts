// Dados de transportes para Caldas Novas, Goiás

export interface Transport {
  id: string
  name: string
  city: string
  state: string
  type: 'aereo' | 'terrestre' | 'maritimo' | 'ferroviario'
  category: 'publico' | 'privado' | 'executivo' | 'turistico'
  description?: string
  website?: string
  imageUrl?: string
  origin: string
  destination: string
  duration: string
  price: number
  capacity?: number
  frequency?: string
  amenities?: string[]
  contact?: string
  rating?: number
}

export interface City {
  name: string
  state: string
  transports: Transport[]
}

export interface State {
  name: string
  code: string
  cities: City[]
}

// Transportes para Caldas Novas (Goiás)
export const caldasNovasTransports: Transport[] = [
  // Transporte Aéreo
  {
    id: 'voo-goiania-caldas',
    name: 'Voo Goiânia - Caldas Novas',
    city: 'Caldas Novas',
    state: 'Goiás',
    type: 'aereo',
    category: 'publico',
    description: 'Voos regulares entre Goiânia e Caldas Novas. Conexão rápida e confortável.',
    origin: 'Goiânia (GOI)',
    destination: 'Caldas Novas',
    duration: '45 minutos',
    price: 350.00,
    capacity: 50,
    frequency: 'Diário',
    amenities: ['Ar condicionado', 'Bagagem incluída', 'Wi-Fi'],
    contact: '(64) 3451-0000',
    rating: 4.5,
  },
  {
    id: 'voo-brasilia-caldas',
    name: 'Voo Brasília - Caldas Novas',
    city: 'Caldas Novas',
    state: 'Goiás',
    type: 'aereo',
    category: 'publico',
    description: 'Voos diretos de Brasília para Caldas Novas. Ideal para turistas da capital.',
    origin: 'Brasília (BSB)',
    destination: 'Caldas Novas',
    duration: '1h 15min',
    price: 450.00,
    capacity: 50,
    frequency: '3x por semana',
    amenities: ['Ar condicionado', 'Bagagem incluída', 'Wi-Fi', 'Lanche'],
    contact: '(64) 3451-0000',
    rating: 4.6,
  },
  {
    id: 'voo-executivo-caldas',
    name: 'Voo Executivo Charter',
    city: 'Caldas Novas',
    state: 'Goiás',
    type: 'aereo',
    category: 'executivo',
    description: 'Voos executivos charter para grupos. Flexibilidade de horários e rota personalizada.',
    origin: 'Aeroporto de origem',
    destination: 'Caldas Novas',
    duration: 'Variável',
    price: 2500.00,
    capacity: 8,
    frequency: 'Sob demanda',
    amenities: ['Conforto premium', 'Wi-Fi', 'Refeição', 'Atendimento personalizado'],
    contact: '(64) 99999-9999',
    rating: 4.9,
  },
  // Transporte Terrestre - Ônibus
  {
    id: 'onibus-goiania-caldas',
    name: 'Ônibus Goiânia - Caldas Novas',
    city: 'Caldas Novas',
    state: 'Goiás',
    type: 'terrestre',
    category: 'publico',
    description: 'Linha regular de ônibus entre Goiânia e Caldas Novas. Conforto e economia.',
    origin: 'Terminal Rodoviário de Goiânia',
    destination: 'Terminal Rodoviário de Caldas Novas',
    duration: '2h 30min',
    price: 45.00,
    capacity: 44,
    frequency: 'A cada 2 horas',
    amenities: ['Ar condicionado', 'Poltronas reclináveis', 'Wi-Fi', 'Banheiro'],
    contact: '(62) 3224-0000',
    rating: 4.3,
  },
  {
    id: 'onibus-brasilia-caldas',
    name: 'Ônibus Brasília - Caldas Novas',
    city: 'Caldas Novas',
    state: 'Goiás',
    type: 'terrestre',
    category: 'publico',
    description: 'Linha direta de ônibus de Brasília para Caldas Novas. Viagem confortável.',
    origin: 'Terminal Rodoviário de Brasília',
    destination: 'Terminal Rodoviário de Caldas Novas',
    duration: '4h',
    price: 85.00,
    capacity: 44,
    frequency: '3x ao dia',
    amenities: ['Ar condicionado', 'Poltronas reclináveis', 'Wi-Fi', 'Banheiro', 'Lanche'],
    contact: '(61) 3327-0000',
    rating: 4.4,
  },
  {
    id: 'onibus-executivo-caldas',
    name: 'Ônibus Executivo',
    city: 'Caldas Novas',
    state: 'Goiás',
    type: 'terrestre',
    category: 'executivo',
    description: 'Ônibus executivo com poltronas leito, ar condicionado e serviço de bordo.',
    origin: 'Goiânia',
    destination: 'Caldas Novas',
    duration: '2h',
    price: 120.00,
    capacity: 30,
    frequency: 'Diário',
    amenities: ['Poltronas leito', 'Ar condicionado', 'Wi-Fi', 'Banheiro', 'Lanche', 'TV'],
    contact: '(64) 3451-0000',
    rating: 4.7,
  },
  // Transporte Terrestre - Van/Turismo
  {
    id: 'van-turistica-caldas',
    name: 'Van Turística',
    city: 'Caldas Novas',
    state: 'Goiás',
    type: 'terrestre',
    category: 'turistico',
    description: 'Van turística com guia. Ideal para grupos pequenos com roteiro personalizado.',
    origin: 'Goiânia',
    destination: 'Caldas Novas',
    duration: '2h 30min',
    price: 80.00,
    capacity: 15,
    frequency: 'Sob demanda',
    amenities: ['Ar condicionado', 'Guia turístico', 'Paradas para fotos', 'Wi-Fi'],
    contact: '(64) 99999-9999',
    rating: 4.6,
  },
  {
    id: 'van-executiva-caldas',
    name: 'Van Executiva',
    city: 'Caldas Novas',
    state: 'Goiás',
    type: 'terrestre',
    category: 'executivo',
    description: 'Van executiva com máximo conforto. Ideal para executivos e grupos pequenos.',
    origin: 'Aeroporto/Goiânia',
    destination: 'Caldas Novas',
    duration: '2h',
    price: 150.00,
    capacity: 8,
    frequency: 'Sob demanda',
    amenities: ['Ar condicionado', 'Wi-Fi', 'Água e lanche', 'Atendimento personalizado'],
    contact: '(64) 99999-9999',
    rating: 4.8,
  },
  // Transporte Terrestre - Aluguel de Carro
  {
    id: 'aluguel-carro-economico',
    name: 'Aluguel de Carro - Econômico',
    city: 'Caldas Novas',
    state: 'Goiás',
    type: 'terrestre',
    category: 'privado',
    description: 'Aluguel de carro econômico. Liberdade para explorar Caldas Novas e região.',
    origin: 'Caldas Novas',
    destination: 'Livre',
    duration: 'Diária',
    price: 120.00,
    capacity: 5,
    frequency: 'Disponível',
    amenities: ['Ar condicionado', 'Seguro básico', 'Quilometragem livre'],
    contact: '(64) 3451-0000',
    rating: 4.4,
  },
  {
    id: 'aluguel-carro-suv',
    name: 'Aluguel de Carro - SUV',
    city: 'Caldas Novas',
    state: 'Goiás',
    type: 'terrestre',
    category: 'privado',
    description: 'Aluguel de SUV. Ideal para famílias e grupos maiores. Conforto e espaço.',
    origin: 'Caldas Novas',
    destination: 'Livre',
    duration: 'Diária',
    price: 200.00,
    capacity: 7,
    frequency: 'Disponível',
    amenities: ['Ar condicionado', 'Seguro completo', 'Quilometragem livre', 'GPS'],
    contact: '(64) 3451-0000',
    rating: 4.6,
  },
  {
    id: 'aluguel-carro-executivo',
    name: 'Aluguel de Carro - Executivo',
    city: 'Caldas Novas',
    state: 'Goiás',
    type: 'terrestre',
    category: 'executivo',
    description: 'Aluguel de carro executivo. Conforto e elegância para sua viagem.',
    origin: 'Caldas Novas',
    destination: 'Livre',
    duration: 'Diária',
    price: 350.00,
    capacity: 4,
    frequency: 'Disponível',
    amenities: ['Ar condicionado', 'Seguro premium', 'Quilometragem livre', 'GPS', 'Motorista opcional'],
    contact: '(64) 3451-0000',
    rating: 4.8,
  },
  // Transporte Terrestre - Transfer
  {
    id: 'transfer-aeroporto',
    name: 'Transfer Aeroporto - Hotel',
    city: 'Caldas Novas',
    state: 'Goiás',
    type: 'terrestre',
    category: 'turistico',
    description: 'Transfer privativo do aeroporto para o hotel em Caldas Novas. Conforto e pontualidade.',
    origin: 'Aeroporto de Goiânia',
    destination: 'Hotéis em Caldas Novas',
    duration: '2h 30min',
    price: 180.00,
    capacity: 4,
    frequency: 'Sob demanda',
    amenities: ['Ar condicionado', 'Wi-Fi', 'Água', 'Atendimento personalizado'],
    contact: '(64) 99999-9999',
    rating: 4.7,
  },
  {
    id: 'transfer-rodoviaria',
    name: 'Transfer Rodoviária - Hotel',
    city: 'Caldas Novas',
    state: 'Goiás',
    type: 'terrestre',
    category: 'turistico',
    description: 'Transfer da rodoviária para o hotel. Serviço rápido e eficiente.',
    origin: 'Terminal Rodoviário',
    destination: 'Hotéis em Caldas Novas',
    duration: '15 minutos',
    price: 40.00,
    capacity: 4,
    frequency: 'Sob demanda',
    amenities: ['Ar condicionado', 'Atendimento personalizado'],
    contact: '(64) 99999-9999',
    rating: 4.5,
  },
]

// Estados do Brasil com transportes
export const brazilStatesWithTransports: State[] = [
  {
    name: 'Goiás',
    code: 'GO',
    cities: [
      {
        name: 'Caldas Novas',
        state: 'Goiás',
        transports: caldasNovasTransports,
      },
    ],
  },
]

// Funções utilitárias
export function getAllTransports(): Transport[] {
  return brazilStatesWithTransports.flatMap((state) =>
    state.cities.flatMap((city) => city.transports)
  )
}

export function getTransportsByCity(cityName: string): Transport[] {
  for (const state of brazilStatesWithTransports) {
    const city = state.cities.find((c) => c.name === cityName)
    if (city) return city.transports
  }
  return []
}

export function getTransportsByState(stateName: string): Transport[] {
  const state = brazilStatesWithTransports.find((s) => s.name === stateName)
  return state ? state.cities.flatMap((city) => city.transports) : []
}

export function getTransportsByType(type: Transport['type']): Transport[] {
  return getAllTransports().filter((transport) => transport.type === type)
}

export function getTransportsByCategory(category: Transport['category']): Transport[] {
  return getAllTransports().filter((transport) => transport.category === category)
}

export function searchTransports(query: string): Transport[] {
  const lowerCaseQuery = query.toLowerCase()
  return getAllTransports().filter(
    (transport) =>
      transport.name.toLowerCase().includes(lowerCaseQuery) ||
      transport.city.toLowerCase().includes(lowerCaseQuery) ||
      transport.state.toLowerCase().includes(lowerCaseQuery) ||
      transport.description?.toLowerCase().includes(lowerCaseQuery) ||
      transport.origin.toLowerCase().includes(lowerCaseQuery) ||
      transport.destination.toLowerCase().includes(lowerCaseQuery)
  )
}

export function getTransportById(id: string): Transport | undefined {
  return getAllTransports().find((transport) => transport.id === id)
}

// Tipos de transportes para filtros
export const transportTypes = [
  { value: 'aereo', label: '✈️ Aéreo', description: 'Voos e aviões' },
  { value: 'terrestre', label: '🚌 Terrestre', description: 'Ônibus, vans e carros' },
  { value: 'maritimo', label: '🚢 Marítimo', description: 'Barcos e navios' },
  { value: 'ferroviario', label: '🚂 Ferroviário', description: 'Trens e metrôs' },
] as const

// Categorias de transportes
export const transportCategories = [
  { value: 'publico', label: 'Público', description: 'Transporte público regular' },
  { value: 'privado', label: 'Privado', description: 'Transporte privado' },
  { value: 'executivo', label: 'Executivo', description: 'Serviço executivo premium' },
  { value: 'turistico', label: 'Turístico', description: 'Transporte com guia turístico' },
] as const
