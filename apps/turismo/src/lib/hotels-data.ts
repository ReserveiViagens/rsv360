export interface Hotel {
  id: string;
  name: string;
  city: string;
  state: string;
}

export interface City {
  name: string;
  state: string;
  hotels: Hotel[];
}

export interface State {
  name: string;
  code: string;
  cities: City[];
}

export const caldasNovasHotels: Hotel[] = [
  { id: "aguas-da-fonte", name: "AGUAS DA FONTE", city: "Caldas Novas", state: "Goiás" },
  { id: "atrium-thermas", name: "Atrium Thermas", city: "Caldas Novas", state: "Goiás" },
  { id: "aldeia-do-lago", name: "ALDEIA DO LAGO", city: "Caldas Novas", state: "Goiás" },
  { id: "alta-vista-thermas", name: "Alta Vista Thermas", city: "Caldas Novas", state: "Goiás" },
  { id: "aquarius-residence", name: "Aquarius Residence", city: "Caldas Novas", state: "Goiás" },
  { id: "araras-apart-service", name: "ARARAS Apart Service", city: "Caldas Novas", state: "Goiás" },
  { id: "boulevard-prive", name: "Boulevard Prive Suite Hotel", city: "Caldas Novas", state: "Goiás" },
  { id: "casa-da-madeira", name: "casa da madeira", city: "Caldas Novas", state: "Goiás" },
  { id: "diroma-exclusive", name: "Diroma Exclusive", city: "Caldas Novas", state: "Goiás" },
  { id: "ecologic-park", name: "Ecologic Park", city: "Caldas Novas", state: "Goiás" },
  { id: "ecologic-ville", name: "Ecologic Ville Resort", city: "Caldas Novas", state: "Goiás" },
  { id: "eldorado-flat", name: "Eldorado Flat", city: "Caldas Novas", state: "Goiás" },
  { id: "everest-flat", name: "Everest Flat Service", city: "Caldas Novas", state: "Goiás" },
  { id: "fiore-prime", name: "Fiore Prime Flat", city: "Caldas Novas", state: "Goiás" },
  { id: "fiori-diroma", name: "Fiori DiRoma", city: "Caldas Novas", state: "Goiás" },
  { id: "golden-dolphin-gran", name: "Golden Dolphin Caldas Novas Gran Hotel", city: "Caldas Novas", state: "Goiás" },
  { id: "golden-dolphin-express", name: "Golden Dolphin Express", city: "Caldas Novas", state: "Goiás" },
  { id: "hotel-marina", name: "Hotel Marina Flat", city: "Caldas Novas", state: "Goiás" },
  { id: "hotel-parque-primaveras", name: "Hotel Parque Das Primaveras", city: "Caldas Novas", state: "Goiás" },
  { id: "hotsprings-b3", name: "HotSprings B3 Hotéis", city: "Caldas Novas", state: "Goiás" },
  { id: "ilhas-do-lago", name: "ilhas do lago", city: "Caldas Novas", state: "Goiás" },
  { id: "imperio-romano", name: "Império Romano", city: "Caldas Novas", state: "Goiás" },
  { id: "lacqua-di-roma", name: "Lacqua Di Roma", city: "Caldas Novas", state: "Goiás" },
  { id: "lagoa-eco-towers", name: "Lagoa Eco Towers reservei", city: "Caldas Novas", state: "Goiás" },
  { id: "lagoa-quente", name: "LAGOA QUENTE Hotel", city: "Caldas Novas", state: "Goiás" },
  { id: "le-jardin", name: "Le Jardin Suítes", city: "Caldas Novas", state: "Goiás" },
  { id: "paradise-flat", name: "Paradise Flat Residence", city: "Caldas Novas", state: "Goiás" },
  { id: "parque-veredas", name: "parque veredas", city: "Caldas Novas", state: "Goiás" },
  { id: "piazza-diroma", name: "Piazza DiRoma Caldas Novas", city: "Caldas Novas", state: "Goiás" },
  { id: "praias-do-lago", name: "Praias do Lago Eco Resort", city: "Caldas Novas", state: "Goiás" },
  { id: "prive-das-thermas", name: "Prive das Thermas", city: "Caldas Novas", state: "Goiás" },
  { id: "recanto-do-bosque", name: "recanto do bosque", city: "Caldas Novas", state: "Goiás" },
  { id: "recanto-do-bosque-flat", name: "Recanto do Bosque - Flat Service", city: "Caldas Novas", state: "Goiás" },
  { id: "resort-do-lago", name: "Resort do lago Reservei Viagens", city: "Caldas Novas", state: "Goiás" },
  { id: "rio-das-pedras", name: "Rio das Pedras Thermas Hotel", city: "Caldas Novas", state: "Goiás" },
  { id: "riviera", name: "riviera", city: "Caldas Novas", state: "Goiás" },
  { id: "spazzio-diroma", name: "Spazzio diRoma", city: "Caldas Novas", state: "Goiás" },
  { id: "t-bandeirantes", name: "T. BANDEIRANTES 1003A-001", city: "Caldas Novas", state: "Goiás" },
  { id: "the-villeneuve", name: "The Villeneuve Residence", city: "Caldas Novas", state: "Goiás" },
  { id: "thermas-bandeirante", name: "Thermas do Bandeirante", city: "Caldas Novas", state: "Goiás" },
  { id: "thermas-place", name: "Thermas Place", city: "Caldas Novas", state: "Goiás" },
  { id: "hotel-santa-clara", name: "Hotel Santa Clara", city: "Caldas Novas", state: "Goiás" },
  { id: "villas-diroma", name: "Villas diRoma", city: "Caldas Novas", state: "Goiás" },
  { id: "morada-das-aguas", name: "Hotel Morada das Águas", city: "Caldas Novas", state: "Goiás" },
];

// Hotéis do Rio de Janeiro
export const rioDeJaneiroHotels: Hotel[] = [
  { id: "copacabana-palace", name: "Copacabana Palace", city: "Rio de Janeiro", state: "Rio de Janeiro" },
  { id: "hilton-copacabana", name: "Hilton Copacabana", city: "Rio de Janeiro", state: "Rio de Janeiro" },
  { id: "marriott-copacabana", name: "JW Marriott Copacabana", city: "Rio de Janeiro", state: "Rio de Janeiro" },
  { id: "sheraton-grand", name: "Sheraton Grand Rio Hotel & Resort", city: "Rio de Janeiro", state: "Rio de Janeiro" },
  { id: "windsor-atlantica", name: "Windsor Atlântica", city: "Rio de Janeiro", state: "Rio de Janeiro" },
  { id: "pestana-rio", name: "Pestana Rio Atlântica", city: "Rio de Janeiro", state: "Rio de Janeiro" },
  { id: "arena-copacabana", name: "Arena Copacabana Hotel", city: "Rio de Janeiro", state: "Rio de Janeiro" },
  { id: "porto-bay-rio", name: "PortoBay Rio Internacional", city: "Rio de Janeiro", state: "Rio de Janeiro" },
];

// Hotéis de São Paulo
export const saoPauloHotels: Hotel[] = [
  { id: "grand-hyatt-sao-paulo", name: "Grand Hyatt São Paulo", city: "São Paulo", state: "São Paulo" },
  { id: "renaissance-sao-paulo", name: "Renaissance São Paulo Hotel", city: "São Paulo", state: "São Paulo" },
  { id: "maksoud-plaza", name: "Maksoud Plaza", city: "São Paulo", state: "São Paulo" },
  { id: "copacabana-hotel-sp", name: "Copacabana Hotel & Suites", city: "São Paulo", state: "São Paulo" },
  { id: "intercity-premium", name: "Intercity Premium Ibirapuera", city: "São Paulo", state: "São Paulo" },
  { id: "blue-tree-premium", name: "Blue Tree Premium Paulista", city: "São Paulo", state: "São Paulo" },
  { id: "hotel-unique", name: "Hotel Unique", city: "São Paulo", state: "São Paulo" },
];

// Hotéis de Florianópolis
export const florianopolisHotels: Hotel[] = [
  { id: "costao-do-santinho", name: "Costão do Santinho Resort", city: "Florianópolis", state: "Santa Catarina" },
  { id: "jurere-beach-village", name: "Jurerê Beach Village", city: "Florianópolis", state: "Santa Catarina" },
  { id: "pousada-dos-chás", name: "Pousada dos Chás", city: "Florianópolis", state: "Santa Catarina" },
  { id: "hotel-boutique-quinta", name: "Hotel Boutique Quinta das Videiras", city: "Florianópolis", state: "Santa Catarina" },
  { id: "intercity-premium-floripa", name: "Intercity Premium Florianópolis", city: "Florianópolis", state: "Santa Catarina" },
];

export const brazilStates: State[] = [
  {
    name: "Goiás",
    code: "GO",
    cities: [
      {
        name: "Caldas Novas",
        state: "Goiás",
        hotels: caldasNovasHotels,
      },
      {
        name: "Rio Quente",
        state: "Goiás",
        hotels: [
          { id: "hot-park-resort", name: "Hot Park Resort", city: "Rio Quente", state: "Goiás" },
          { id: "rio-quente-resorts", name: "Rio Quente Resorts", city: "Rio Quente", state: "Goiás" },
        ],
      },
    ],
  },
  {
    name: "Rio de Janeiro",
    code: "RJ",
    cities: [
      {
        name: "Rio de Janeiro",
        state: "Rio de Janeiro",
        hotels: rioDeJaneiroHotels,
      },
    ],
  },
  {
    name: "São Paulo",
    code: "SP",
    cities: [
      {
        name: "São Paulo",
        state: "São Paulo",
        hotels: saoPauloHotels,
      },
    ],
  },
  {
    name: "Santa Catarina",
    code: "SC",
    cities: [
      {
        name: "Florianópolis",
        state: "Santa Catarina",
        hotels: florianopolisHotels,
      },
    ],
  },
];

export function getAllHotels(): Hotel[] {
  return brazilStates.flatMap((state) => state.cities.flatMap((city) => city.hotels));
}

export function getHotelsByCity(cityName: string): Hotel[] {
  for (const state of brazilStates) {
    const city = state.cities.find((c) => c.name === cityName);
    if (city) return city.hotels;
  }
  return [];
}

export function getHotelsByState(stateName: string): Hotel[] {
  const state = brazilStates.find((s) => s.name === stateName);
  return state ? state.cities.flatMap((city) => city.hotels) : [];
}

export function searchHotels(query: string): Hotel[] {
  const lowerQuery = query.toLowerCase();
  return getAllHotels().filter(
    (hotel) =>
      hotel.name.toLowerCase().includes(lowerQuery) ||
      hotel.city.toLowerCase().includes(lowerQuery) ||
      hotel.state.toLowerCase().includes(lowerQuery)
  );
}

export function getHotelById(id: string): Hotel | undefined {
  return getAllHotels().find((hotel) => hotel.id === id);
}
