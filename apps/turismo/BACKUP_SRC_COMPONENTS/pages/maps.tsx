import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  Search,
  Filter,
  Download,
  Printer,
  Share2,
  Eye,
  Edit,
  Plus,
  Clock,
  Calendar,
  User,
  DollarSign,
  Star,
  MessageSquare,
  BarChart3,
  PieChart,
  Activity,
  TrendingUp,
  Users,
  Percent,
  Shield,
  Lock,
  Unlock,
  Key,
  Database,
  Server,
  Zap,
  Target,
  Award,
  Trophy,
  Medal,
  Crown,
  Flag,
  CheckSquare,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Octagon,
  Map,
  Globe,
  Compass,
  Navigation2,
  Route,
  Car,
  Plane,
  Train,
  Bus,
  Ship,
  Bike,
  Home,
  Building,
  Hotel,
  Coffee,
  ShoppingBag,
  Camera,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Smile,
  Frown,
  Meh,
  Thermometer,
  Droplet,
  Umbrella,
  CloudRain,
  CloudLightning,
  CloudSnow,
  Sun,
  Moon,
  Cloud,
  CloudOff,
  CloudDrizzle,
  CloudFog,
  Wind,
  Tornado,
  Snowflake,
  ThermometerSun,
  XCircle
} from 'lucide-react';

interface Location {
  id: string;
  name: string;
  type: 'hotel' | 'restaurant' | 'attraction' | 'transport' | 'shopping' | 'other';
  address: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  rating: number;
  priceRange: 'low' | 'medium' | 'high';
  description: string;
  amenities: string[];
  photos: string[];
  reviews: number;
  distance?: number;
  duration?: number;
  route?: string;
}

interface Route {
  id: string;
  origin: string;
  destination: string;
  distance: number;
  duration: number;
  transportMode: 'car' | 'plane' | 'train' | 'bus' | 'ship' | 'bike';
  cost: number;
  carbonFootprint: number;
  routeType: 'fastest' | 'shortest' | 'cheapest' | 'eco-friendly';
  waypoints: Location[];
}

const MapsPage: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([
    {
      id: 'LOC001',
      name: 'Hotel Copacabana Palace',
      type: 'hotel',
      address: 'Av. Atlântica, 1702',
      city: 'Rio de Janeiro',
      state: 'RJ',
      country: 'Brasil',
      latitude: -22.9716,
      longitude: -43.1825,
      rating: 4.8,
      priceRange: 'high',
      description: 'Hotel de luxo com vista para o mar',
      amenities: ['Wi-Fi', 'Piscina', 'Spa', 'Restaurante', 'Estacionamento'],
      photos: ['hotel1.jpg', 'hotel2.jpg'],
      reviews: 1247
    },
    {
      id: 'LOC002',
      name: 'Restaurante Confeitaria Colombo',
      type: 'restaurant',
      address: 'R. Gonçalves Dias, 32',
      city: 'Rio de Janeiro',
      state: 'RJ',
      country: 'Brasil',
      latitude: -22.9068,
      longitude: -43.1729,
      rating: 4.5,
      priceRange: 'medium',
      description: 'Restaurante histórico no centro do Rio',
      amenities: ['Wi-Fi', 'Ar condicionado', 'Reservas'],
      photos: ['restaurant1.jpg'],
      reviews: 892
    },
    {
      id: 'LOC003',
      name: 'Cristo Redentor',
      type: 'attraction',
      address: 'Parque Nacional da Tijuca',
      city: 'Rio de Janeiro',
      state: 'RJ',
      country: 'Brasil',
      latitude: -22.9519,
      longitude: -43.2105,
      rating: 4.9,
      priceRange: 'medium',
      description: 'Monumento mais famoso do Brasil',
      amenities: ['Estacionamento', 'Guia turístico', 'Loja de souvenirs'],
      photos: ['cristo1.jpg', 'cristo2.jpg'],
      reviews: 2156
    }
  ]);

  const [routes, setRoutes] = useState<Route[]>([
    {
      id: 'ROU001',
      origin: 'São Paulo',
      destination: 'Rio de Janeiro',
      distance: 430,
      duration: 75,
      transportMode: 'plane',
      cost: 450.00,
      carbonFootprint: 0.15,
      routeType: 'fastest',
      waypoints: []
    },
    {
      id: 'ROU002',
      origin: 'Rio de Janeiro',
      destination: 'Fernando de Noronha',
      distance: 545,
      duration: 120,
      transportMode: 'plane',
      cost: 1200.00,
      carbonFootprint: 0.25,
      routeType: 'fastest',
      waypoints: []
    }
  ]);

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'map' | 'locations' | 'routes' | 'analytics'>('map');
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);

  const typeColors = {
    hotel: 'bg-blue-100 text-blue-800',
    restaurant: 'bg-green-100 text-green-800',
    attraction: 'bg-purple-100 text-purple-800',
    transport: 'bg-orange-100 text-orange-800',
    shopping: 'bg-pink-100 text-pink-800',
    other: 'bg-gray-100 text-gray-800'
  };

  const priceRangeColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };

  const transportModeIcons = {
    car: Car,
    plane: Plane,
    train: Train,
    bus: Bus,
    ship: Ship,
    bike: Bike
  };

  const filteredLocations = locations.filter(location => {
    const matchesType = filterType === 'all' || location.type === filterType;
    const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.city.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const stats = {
    total: locations.length,
    hotels: locations.filter(l => l.type === 'hotel').length,
    restaurants: locations.filter(l => l.type === 'restaurant').length,
    attractions: locations.filter(l => l.type === 'attraction').length,
    averageRating: locations.reduce((sum, l) => sum + l.rating, 0) / locations.length,
    totalRoutes: routes.length,
    totalDistance: routes.reduce((sum, r) => sum + r.distance, 0)
  };

  useEffect(() => {
    // Simulate getting current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Error getting location:', error);
        }
      );
    }
  }, []);

  const handleLocationClick = (location: Location) => {
    setSelectedLocation(location);
    setShowModal(true);
  };

  const handleRouteClick = (route: Route) => {
    setSelectedRoute(route);
    setShowRouteModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Map className="mr-3 h-8 w-8 text-blue-600" />
                Mapas e Localização
              </h1>
              <p className="text-gray-600 mt-2">Explore destinos e planeje suas rotas</p>
            </div>
            <div className="flex space-x-3">
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center font-medium transition-colors">
                <Navigation className="mr-2 h-5 w-5" />
                Minha Localização
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center font-medium transition-colors">
                <Plus className="mr-2 h-5 w-5" />
                Adicionar Local
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Locais Cadastrados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Hotel className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Hotéis</p>
                <p className="text-2xl font-bold text-gray-900">{stats.hotels}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avaliação Média</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Route className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rotas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRoutes}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('map')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'map'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Mapa
              </button>
              <button
                onClick={() => setActiveTab('locations')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'locations'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Locais
              </button>
              <button
                onClick={() => setActiveTab('routes')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'routes'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Rotas
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Analytics
              </button>
            </nav>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'map' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <Globe className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Mapa Interativo</h3>
              <p className="text-gray-600 mb-4">Integração com Google Maps ou OpenStreetMap</p>
              <div className="bg-white rounded-lg p-4 border">
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg">
                    <Navigation className="h-4 w-4" />
                    <span>Minha Localização</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg">
                    <Search className="h-4 w-4" />
                    <span>Buscar Local</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg">
                    <Route className="h-4 w-4" />
                    <span>Traçar Rota</span>
                  </button>
                </div>
                <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Área do Mapa</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'locations' && (
          <div>
            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar por nome ou cidade..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Todos os Tipos</option>
                    <option value="hotel">Hotéis</option>
                    <option value="restaurant">Restaurantes</option>
                    <option value="attraction">Atrações</option>
                    <option value="transport">Transporte</option>
                    <option value="shopping">Shopping</option>
                    <option value="other">Outros</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Locations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLocations.map((location) => (
                <div
                  key={location.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleLocationClick(location)}
                >
                  <div className="h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                    <MapPin className="h-12 w-12 text-gray-400" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{location.name}</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${typeColors[location.type]}`}>
                        {location.type === 'hotel' && 'Hotel'}
                        {location.type === 'restaurant' && 'Restaurante'}
                        {location.type === 'attraction' && 'Atração'}
                        {location.type === 'transport' && 'Transporte'}
                        {location.type === 'shopping' && 'Shopping'}
                        {location.type === 'other' && 'Outro'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{location.address}</p>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-sm text-gray-900">{location.rating}</span>
                        <span className="text-sm text-gray-500 ml-1">({location.reviews})</span>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${priceRangeColors[location.priceRange]}`}>
                        {location.priceRange === 'low' && '$'}
                        {location.priceRange === 'medium' && '$$'}
                        {location.priceRange === 'high' && '$$$'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{location.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'routes' && (
          <div>
            {/* Routes List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rota
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transporte
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Distância
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duração
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Custo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {routes.map((route) => {
                      const TransportIcon = transportModeIcons[route.transportMode];
                      return (
                        <tr key={route.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{route.origin} → {route.destination}</div>
                              <div className="text-sm text-gray-500">{route.routeType}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <TransportIcon className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-900">
                                {route.transportMode === 'car' && 'Carro'}
                                {route.transportMode === 'plane' && 'Avião'}
                                {route.transportMode === 'train' && 'Trem'}
                                {route.transportMode === 'bus' && 'Ônibus'}
                                {route.transportMode === 'ship' && 'Navio'}
                                                                {route.transportMode === 'bike' && 'Bicicleta'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{route.distance} km</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{route.duration} min</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              R$ {route.cost.toLocaleString('pt-BR')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleRouteClick(route)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button className="text-green-600 hover:text-green-900">
                                <Navigation className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Location Analytics */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Analytics de Locais</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total de Locais</span>
                  <span className="text-sm font-medium text-gray-900">{stats.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Hotéis</span>
                  <span className="text-sm font-medium text-gray-900">{stats.hotels}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Restaurantes</span>
                  <span className="text-sm font-medium text-gray-900">{stats.restaurants}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Atrações</span>
                  <span className="text-sm font-medium text-gray-900">{stats.attractions}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avaliação Média</span>
                  <span className="text-sm font-medium text-gray-900">{stats.averageRating.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Route Analytics */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Analytics de Rotas</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total de Rotas</span>
                  <span className="text-sm font-medium text-gray-900">{stats.totalRoutes}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Distância Total</span>
                  <span className="text-sm font-medium text-gray-900">{stats.totalDistance} km</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Modo Mais Usado</span>
                  <span className="text-sm font-medium text-gray-900">Avião</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Custo Médio</span>
                  <span className="text-sm font-medium text-gray-900">R$ 825,00</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Location Details Modal */}
        {showModal && selectedLocation && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedLocation.name}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Location Information */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Informações do Local</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Tipo:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedLocation.type === 'hotel' && 'Hotel'}
                          {selectedLocation.type === 'restaurant' && 'Restaurante'}
                          {selectedLocation.type === 'attraction' && 'Atração'}
                          {selectedLocation.type === 'transport' && 'Transporte'}
                          {selectedLocation.type === 'shopping' && 'Shopping'}
                          {selectedLocation.type === 'other' && 'Outro'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Endereço:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedLocation.address}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Cidade:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedLocation.city}, {selectedLocation.state}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Coordenadas:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedLocation.latitude}, {selectedLocation.longitude}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Ratings and Reviews */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Avaliações</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Avaliação:</span>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="text-sm font-medium text-gray-900">{selectedLocation.rating}</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Reviews:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedLocation.reviews}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Faixa de Preço:</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${priceRangeColors[selectedLocation.priceRange]}`}>
                          {selectedLocation.priceRange === 'low' && 'Baixa'}
                          {selectedLocation.priceRange === 'medium' && 'Média'}
                          {selectedLocation.priceRange === 'high' && 'Alta'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Descrição</h4>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedLocation.description}</p>
                </div>

                {/* Amenities */}
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Comodidades</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedLocation.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Fechar
                  </button>
                  <button className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700">
                    <Navigation className="h-4 w-4 inline mr-2" />
                    Traçar Rota
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Route Details Modal */}
        {showRouteModal && selectedRoute && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Rota: {selectedRoute.origin} → {selectedRoute.destination}
                  </h3>
                  <button
                    onClick={() => setShowRouteModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Route Information */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Informações da Rota</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Origem:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedRoute.origin}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Destino:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedRoute.destination}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Distância:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedRoute.distance} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Duração:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedRoute.duration} min</span>
                      </div>
                    </div>
                  </div>

                  {/* Transport Information */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Informações de Transporte</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Modo:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedRoute.transportMode === 'car' && 'Carro'}
                          {selectedRoute.transportMode === 'plane' && 'Avião'}
                          {selectedRoute.transportMode === 'train' && 'Trem'}
                          {selectedRoute.transportMode === 'bus' && 'Ônibus'}
                          {selectedRoute.transportMode === 'ship' && 'Navio'}
                          {selectedRoute.transportMode === 'bike' && 'Bicicleta'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Tipo de Rota:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedRoute.routeType === 'fastest' && 'Mais Rápida'}
                          {selectedRoute.routeType === 'shortest' && 'Mais Curta'}
                          {selectedRoute.routeType === 'cheapest' && 'Mais Barata'}
                          {selectedRoute.routeType === 'eco-friendly' && 'Ecológica'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Custo:</span>
                        <span className="text-sm font-medium text-gray-900">
                          R$ {selectedRoute.cost.toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Pegada de Carbono:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedRoute.carbonFootprint} kg CO2</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowRouteModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Fechar
                  </button>
                  <button className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700">
                    <Navigation className="h-4 w-4 inline mr-2" />
                    Seguir Rota
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapsPage; 