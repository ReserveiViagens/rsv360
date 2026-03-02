// ===================================================================
// TRAVEL PACKAGE MODAL - MODAL PARA VISUALIZAR DETALHES DO PACOTE
// ===================================================================

import React, { useState } from 'react';
import {
  X,
  Star,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Clock,
  Wifi,
  Car,
  Utensils,
  Waves,
  Mountain,
  Sun,
  Snowflake,
  Leaf,
  Heart,
  Share2,
  Phone,
  Mail,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Check,
  X as XIcon,
  Navigation,
  Camera
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

interface TravelPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  package: TravelPackage | null;
  onBook: (pkg: TravelPackage) => void;
  onFavorite: (pkg: TravelPackage) => void;
  onShare: (pkg: TravelPackage) => void;
}

// ===================================================================
// COMPONENTE PRINCIPAL
// ===================================================================

const TravelPackageModal: React.FC<TravelPackageModalProps> = ({
  isOpen,
  onClose,
  package: pkg,
  onBook,
  onFavorite,
  onShare
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'details' | 'reviews'>('overview');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  if (!isOpen || !pkg) return null;

  // ===================================================================
  // FUNÇÕES DE UTILIDADE
  // ===================================================================

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'beach': return <Waves className="w-5 h-5" />;
      case 'mountain': return <Mountain className="w-5 h-5" />;
      case 'city': return <Navigation className="w-5 h-5" />;
      case 'adventure': return <Camera className="w-5 h-5" />;
      case 'romantic': return <Heart className="w-5 h-5" />;
      case 'family': return <Users className="w-5 h-5" />;
      default: return <MapPin className="w-5 h-5" />;
    }
  };

  const getSeasonIcon = (season: string) => {
    switch (season) {
      case 'summer': return <Sun className="w-5 h-5" />;
      case 'winter': return <Snowflake className="w-5 h-5" />;
      case 'spring': return <Leaf className="w-5 h-5" />;
      case 'autumn': return <Leaf className="w-5 h-5" />;
      default: return <Sun className="w-5 h-5" />;
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

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case 'wifi': return <Wifi className="w-4 h-4" />;
      case 'piscina': return <Waves className="w-4 h-4" />;
      case 'spa': return <Heart className="w-4 h-4" />;
      case 'restaurante': return <Utensils className="w-4 h-4" />;
      case 'estacionamento': return <Car className="w-4 h-4" />;
      case 'mergulho': return <Waves className="w-4 h-4" />;
      case 'snorkel': return <Waves className="w-4 h-4" />;
      case 'aquecimento': return <Sun className="w-4 h-4" />;
      default: return <Check className="w-4 h-4" />;
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % pkg.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + pkg.images.length) % pkg.images.length);
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    onFavorite(pkg);
  };

  // ===================================================================
  // RENDERIZAÇÃO
  // ===================================================================

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      
      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{pkg.title}</h2>
                <div className="flex items-center space-x-4 text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{pkg.destination}, {pkg.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                    <span className="font-medium">{pkg.rating}</span>
                    <span className="ml-1">({pkg.reviewCount} avaliações)</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleFavorite}
                  className={`p-2 rounded-full ${
                    isFavorited ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'
                  } hover:bg-red-500 hover:text-white transition-colors`}
                  title="Favoritar"
                >
                  <Heart className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onShare(pkg)}
                  className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-blue-500 hover:text-white transition-colors"
                  title="Compartilhar"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                  title="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Galeria de Imagens */}
            <div className="mb-6">
              <div className="relative h-64 md:h-96 bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src={pkg.images[currentImageIndex] || '/placeholder-travel.jpg'}
                  alt={pkg.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Navegação de Imagens */}
                {pkg.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75"
                      title="Imagem anterior"
                      aria-label="Ver imagem anterior"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75"
                      title="Próxima imagem"
                      aria-label="Ver próxima imagem"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Indicadores */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {pkg.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                      title={`Ver imagem ${index + 1}`}
                      aria-label={`Ver imagem ${index + 1} de ${pkg.images.length}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  {[
                    { id: 'overview', label: 'Visão Geral' },
                    { id: 'itinerary', label: 'Roteiro' },
                    { id: 'details', label: 'Detalhes' },
                    { id: 'reviews', label: 'Avaliações' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Conteúdo das Tabs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Conteúdo Principal */}
              <div className="lg:col-span-2">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Sobre este pacote</h3>
                      <p className="text-gray-600 leading-relaxed">{pkg.description}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Destaques</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {pkg.highlights.map((highlight, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Check className="w-4 h-4 text-green-500" />
                            <span className="text-gray-700">{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Comodidades</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {pkg.amenities.map((amenity, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            {getAmenityIcon(amenity)}
                            <span className="text-gray-700 capitalize">{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'itinerary' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Roteiro Detalhado</h3>
                    {pkg.itinerary.map((day, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {day.day}
                          </div>
                          <h4 className="font-semibold text-gray-900">{day.title}</h4>
                        </div>
                        <p className="text-gray-600 mb-3">{day.description}</p>
                        
                        {day.activities.length > 0 && (
                          <div className="mb-3">
                            <h5 className="font-medium text-gray-900 mb-2">Atividades:</h5>
                            <ul className="space-y-1">
                              {day.activities.map((activity, actIndex) => (
                                <li key={actIndex} className="flex items-center space-x-2 text-sm text-gray-600">
                                  <Check className="w-3 h-3 text-green-500" />
                                  <span>{activity}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {day.meals.length > 0 && (
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Refeições:</h5>
                            <div className="flex flex-wrap gap-2">
                              {day.meals.map((meal, mealIndex) => (
                                <span key={mealIndex} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  {meal}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'details' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Incluído no pacote</h3>
                      <ul className="space-y-2">
                        {pkg.inclusions.map((inclusion, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <Check className="w-4 h-4 text-green-500" />
                            <span className="text-gray-700">{inclusion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Não incluído</h3>
                      <ul className="space-y-2">
                        {pkg.exclusions.map((exclusion, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <XIcon className="w-4 h-4 text-red-500" />
                            <span className="text-gray-700">{exclusion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Política de Cancelamento</h3>
                      <p className="text-gray-600">{pkg.cancellationPolicy}</p>
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Avaliações dos Clientes</h3>
                    <div className="text-center py-8 text-gray-500">
                      <Star className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p>Em breve: Sistema de avaliações</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Preço e Reserva */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-center mb-4">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <span className="text-3xl font-bold text-gray-900">
                        R$ {pkg.price.toLocaleString()}
                      </span>
                      {pkg.originalPrice && (
                        <span className="text-lg text-gray-500 line-through">
                          R$ {pkg.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-600">por pessoa</span>
                  </div>

                  <button
                    onClick={() => onBook(pkg)}
                    className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 transition-colors font-medium"
                  >
                    Reservar Agora
                  </button>
                </div>

                {/* Informações Básicas */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Informações do Pacote</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>Duração</span>
                      </div>
                      <span className="font-medium">{pkg.duration} dias</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        <span>Máx. Hóspedes</span>
                      </div>
                      <span className="font-medium">{pkg.maxGuests} pessoas</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-600">
                        {getCategoryIcon(pkg.category)}
                        <span className="ml-2">Categoria</span>
                      </div>
                      <span className="font-medium capitalize">{pkg.category}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-600">
                        {getSeasonIcon(pkg.season)}
                        <span className="ml-2">Temporada</span>
                      </div>
                      <span className="font-medium capitalize">{pkg.season}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>Dificuldade</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(pkg.difficulty)}`}>
                        {pkg.difficulty === 'easy' ? 'Fácil' : 
                         pkg.difficulty === 'medium' ? 'Médio' : 'Difícil'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contato */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Entre em Contato</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <a href={`tel:${pkg.contactInfo.phone}`} className="text-blue-600 hover:underline">
                        {pkg.contactInfo.phone}
                      </a>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <a href={`mailto:${pkg.contactInfo.email}`} className="text-blue-600 hover:underline">
                        {pkg.contactInfo.email}
                      </a>
                    </div>
                    {pkg.contactInfo.website && (
                      <div className="flex items-center space-x-3">
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                        <a href={pkg.contactInfo.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          Site Oficial
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelPackageModal;
