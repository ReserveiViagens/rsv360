// ===================================================================
// TRAVEL CATALOG - CATÁLOGO DE VIAGENS COM FILTROS AVANÇADOS
// ===================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  MapPin,
  Star,
  Calendar,
  Users,
  DollarSign,
  Heart,
  Share2,
  Eye,
  Clock,
  Wifi,
  Car,
  Utensils,
  Waves,
  Mountain,
  Sun,
  Snowflake,
  Leaf,
  Camera,
  Navigation,
  Phone,
  Mail,
  ExternalLink
} from 'lucide-react';

// ===================================================================
// TIPOS E INTERFACES
// ===================================================================

interface TravelPackage {
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
  itinerary: ItineraryDay[];
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

interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
  meals: string[];
  accommodation?: string;
}

interface FilterOptions {
  priceRange: [number, number];
  duration: number[];
  category: string[];
  season: string[];
  difficulty: string[];
  amenities: string[];
  rating: number;
  maxGuests: number;
}

// ===================================================================
// COMPONENTE DE CARD DE VIAGEM
// ===================================================================

interface TravelCardProps {
  package: TravelPackage;
  onView: (pkg: TravelPackage) => void;
  onBook: (pkg: TravelPackage) => void;
  onFavorite: (pkg: TravelPackage) => void;
  onShare: (pkg: TravelPackage) => void;
}

const TravelCard: React.FC<TravelCardProps> = ({
  package: pkg,
  onView,
  onBook,
  onFavorite,
  onShare
}) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'beach': return <Waves className="w-4 h-4" />;
      case 'mountain': return <Mountain className="w-4 h-4" />;
      case 'city': return <Navigation className="w-4 h-4" />;
      case 'adventure': return <Camera className="w-4 h-4" />;
      case 'romantic': return <Heart className="w-4 h-4" />;
      case 'family': return <Users className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const getSeasonIcon = (season: string) => {
    switch (season) {
      case 'summer': return <Sun className="w-4 h-4" />;
      case 'winter': return <Snowflake className="w-4 h-4" />;
      case 'spring': return <Leaf className="w-4 h-4" />;
      case 'autumn': return <Leaf className="w-4 h-4" />;
      default: return <Sun className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorited(!isFavorited);
    onFavorite(pkg);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare(pkg);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Imagem Principal */}
      <div className="relative h-48 bg-gray-200">
        <img
          src={pkg.images[currentImageIndex] || '/placeholder-travel.jpg'}
          alt={pkg.title}
          className="w-full h-full object-cover"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-2">
          {pkg.isPopular && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              Popular
            </span>
          )}
          {pkg.isFeatured && (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              Destaque
            </span>
          )}
          {pkg.discount && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              -{pkg.discount}%
            </span>
          )}
        </div>

        {/* Ações */}
        <div className="absolute top-3 right-3 flex flex-col space-y-2">
          <button
            onClick={handleFavorite}
            className={`p-2 rounded-full ${
              isFavorited ? 'bg-red-500 text-white' : 'bg-white text-gray-600'
            } hover:bg-red-500 hover:text-white transition-colors`}
            title="Favoritar"
            aria-label="Favoritar pacote de viagem"
          >
            <Heart className="w-4 h-4" />
          </button>
          <button
            onClick={handleShare}
            className="p-2 bg-white text-gray-600 rounded-full hover:bg-blue-500 hover:text-white transition-colors"
            title="Compartilhar"
            aria-label="Compartilhar pacote de viagem"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Navegação de Imagens */}
        {pkg.images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {pkg.images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-4">
        {/* Cabeçalho */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-1">
              {pkg.title}
            </h3>
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{pkg.destination}</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium text-gray-900">{pkg.rating}</span>
            <span className="text-sm text-gray-500">({pkg.reviewCount})</span>
          </div>
        </div>

        {/* Descrição */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {pkg.shortDescription}
        </p>

        {/* Categorias e Tags */}
        <div className="flex items-center space-x-2 mb-3">
          <div className="flex items-center text-xs text-gray-600">
            {getCategoryIcon(pkg.category)}
            <span className="ml-1 capitalize">{pkg.category}</span>
          </div>
          <div className="flex items-center text-xs text-gray-600">
            {getSeasonIcon(pkg.season)}
            <span className="ml-1 capitalize">{pkg.season}</span>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(pkg.difficulty)}`}>
            {pkg.difficulty === 'easy' ? 'Fácil' : 
             pkg.difficulty === 'medium' ? 'Médio' : 'Difícil'}
          </span>
        </div>

        {/* Informações */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              <span>{pkg.duration} dias</span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              <span>Até {pkg.maxGuests} pessoas</span>
            </div>
          </div>
        </div>

        {/* Preço e Ações */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-gray-900">
                R$ {pkg.price.toLocaleString()}
              </span>
              {pkg.originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  R$ {pkg.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500">por pessoa</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onView(pkg)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => onBook(pkg)}
              className="px-4 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600"
            >
              Reservar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===================================================================
// COMPONENTE PRINCIPAL
// ===================================================================

const TravelCatalog: React.FC = () => {
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'duration' | 'popularity'>('popularity');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: [0, 10000],
    duration: [],
    category: [],
    season: [],
    difficulty: [],
    amenities: [],
    rating: 0,
    maxGuests: 0
  });

  // ===================================================================
  // DADOS MOCK
  // ===================================================================

  useEffect(() => {
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
        availableDates: [new Date('2024-03-10')],
        contactInfo: {
          phone: '(64) 99319-7555',
          email: 'reservas@reserveiviagens.com.br'
        }
      },
      {
        id: '3',
        title: 'Gramado - Serra Gaúcha',
        destination: 'Gramado',
        location: 'Rio Grande do Sul, Brasil',
        description: 'Conheça a charmosa cidade de Gramado com sua arquitetura alemã, chocolate artesanal e paisagens serranas.',
        shortDescription: 'Cidade charmosa com arquitetura alemã e chocolate artesanal.',
        price: 1800,
        duration: 4,
        maxGuests: 6,
        rating: 4.7,
        reviewCount: 2156,
        images: ['/gramado-1.jpg', '/gramado-2.jpg'],
        amenities: ['wifi', 'estacionamento', 'restaurante', 'aquecimento'],
        category: 'city',
        season: 'winter',
        difficulty: 'easy',
        highlights: ['Chocolate artesanal', 'Arquitetura alemã', 'Paisagens serranas'],
        itinerary: [],
        inclusions: ['Hospedagem', 'Café da manhã', 'City tour'],
        exclusions: ['Passagens aéreas', 'Almoço e jantar'],
        cancellationPolicy: 'Cancelamento gratuito até 15 dias antes.',
        isPopular: false,
        isFeatured: true,
        availableDates: [new Date('2024-06-15')],
        contactInfo: {
          phone: '(64) 99319-7555',
          email: 'reservas@reserveiviagens.com.br'
        }
      }
    ];

    setTimeout(() => {
      setPackages(mockPackages);
      setLoading(false);
    }, 1000);
  }, []);

  // ===================================================================
  // FILTROS E BUSCA
  // ===================================================================

  const filteredPackages = useMemo(() => {
    let filtered = packages;

    // Busca por texto
    if (searchTerm) {
      filtered = filtered.filter(pkg =>
        pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por preço
    filtered = filtered.filter(pkg =>
      pkg.price >= filters.priceRange[0] && pkg.price <= filters.priceRange[1]
    );

    // Filtro por categoria
    if (filters.category.length > 0) {
      filtered = filtered.filter(pkg => filters.category.includes(pkg.category));
    }

    // Filtro por temporada
    if (filters.season.length > 0) {
      filtered = filtered.filter(pkg => filters.season.includes(pkg.season));
    }

    // Filtro por dificuldade
    if (filters.difficulty.length > 0) {
      filtered = filtered.filter(pkg => filters.difficulty.includes(pkg.difficulty));
    }

    // Filtro por rating
    if (filters.rating > 0) {
      filtered = filtered.filter(pkg => pkg.rating >= filters.rating);
    }

    // Filtro por número de hóspedes
    if (filters.maxGuests > 0) {
      filtered = filtered.filter(pkg => pkg.maxGuests >= filters.maxGuests);
    }

    // Ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price;
        case 'rating':
          return b.rating - a.rating;
        case 'duration':
          return a.duration - b.duration;
        case 'popularity':
        default:
          return b.reviewCount - a.reviewCount;
      }
    });

    return filtered;
  }, [packages, searchTerm, filters, sortBy]);

  // ===================================================================
  // HANDLERS
  // ===================================================================

  const handleViewPackage = (pkg: TravelPackage) => {
    console.log('Visualizar pacote:', pkg);
    // Implementar modal de visualização
  };

  const handleBookPackage = (pkg: TravelPackage) => {
    console.log('Reservar pacote:', pkg);
    // Implementar fluxo de reserva
  };

  const handleFavoritePackage = (pkg: TravelPackage) => {
    console.log('Favoritar pacote:', pkg);
    // Implementar sistema de favoritos
  };

  const handleSharePackage = (pkg: TravelPackage) => {
    console.log('Compartilhar pacote:', pkg);
    // Implementar compartilhamento
  };

  // ===================================================================
  // RENDERIZAÇÃO
  // ===================================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catálogo de Viagens</h1>
          <p className="text-gray-600">Descubra os melhores destinos e pacotes de viagem</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              Lista
            </button>
          </div>
        </div>
      </div>

      {/* Busca e Filtros */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar destinos, pacotes ou atividades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-2"
            title="Ordenar pacotes"
            aria-label="Ordenar pacotes de viagem"
          >
            <option value="popularity">Mais Popular</option>
            <option value="price">Menor Preço</option>
            <option value="rating">Melhor Avaliação</option>
            <option value="duration">Menor Duração</option>
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
          </button>
        </div>

        {/* Filtros Avançados */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Faixa de Preço
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange[0]}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      priceRange: [Number(e.target.value), prev.priceRange[1]]
                    }))}
                    className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.priceRange[1]}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      priceRange: [prev.priceRange[0], Number(e.target.value)]
                    }))}
                    className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria
                </label>
                <select
                  multiple
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    category: Array.from(e.target.selectedOptions, option => option.value)
                  }))}
                  className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                  title="Filtrar por categoria"
                  aria-label="Selecionar categorias de viagem"
                >
                  <option value="beach">Praia</option>
                  <option value="mountain">Montanha</option>
                  <option value="city">Cidade</option>
                  <option value="adventure">Aventura</option>
                  <option value="romantic">Romântico</option>
                  <option value="family">Família</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temporada
                </label>
                <select
                  multiple
                  value={filters.season}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    season: Array.from(e.target.selectedOptions, option => option.value)
                  }))}
                  className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                  title="Filtrar por temporada"
                  aria-label="Selecionar temporadas de viagem"
                >
                  <option value="summer">Verão</option>
                  <option value="winter">Inverno</option>
                  <option value="spring">Primavera</option>
                  <option value="autumn">Outono</option>
                  <option value="all">Todas</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Avaliação Mínima
                </label>
                <select
                  value={filters.rating}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    rating: Number(e.target.value)
                  }))}
                  className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                  title="Filtrar por avaliação"
                  aria-label="Selecionar avaliação mínima"
                >
                  <option value={0}>Qualquer</option>
                  <option value={3}>3+ estrelas</option>
                  <option value={4}>4+ estrelas</option>
                  <option value={4.5}>4.5+ estrelas</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Resultados */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-600">
          {filteredPackages.length} pacotes encontrados
        </p>
      </div>

      {/* Grid de Pacotes */}
      <div className={`grid gap-6 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
          : 'grid-cols-1'
      }`}>
        {filteredPackages.map(pkg => (
          <TravelCard
            key={pkg.id}
            package={pkg}
            onView={handleViewPackage}
            onBook={handleBookPackage}
            onFavorite={handleFavoritePackage}
            onShare={handleSharePackage}
          />
        ))}
      </div>

      {/* Paginação */}
      {filteredPackages.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum pacote encontrado
          </h3>
          <p className="text-gray-600">
            Tente ajustar os filtros ou termos de busca
          </p>
        </div>
      )}
    </div>
  );
};

export default TravelCatalog;
