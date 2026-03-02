import React, { useState, useEffect } from 'react';
import {
  Building, MapPin, Star, DollarSign, Users, Calendar, Search, Filter,
  Plus, Edit, Trash2, Download, Upload, Eye, Camera, Video, BarChart3,
  FileText, Settings, MoreHorizontal, Heart, Share2, MessageCircle,
  Phone, Mail, Globe, Clock, CheckCircle, AlertCircle, X, Save, Loader,
  Wifi, Car, Coffee, Utensils, Dumbbell, Pool, Tv, AirVent, ShieldCheck
} from 'lucide-react';
import NavigationButtons from '../components/NavigationButtons';

interface Hotel {
  id?: number;
  name: string;
  location: string;
  description: string;
  category: 'luxo' | 'executivo' | 'turístico' | 'econômico';
  rating: number;
  price: number;
  amenities: string[];
  facilities: string[];
  restrictions: string[];
  images: string[];
  videos: string[];
  contact: {
    phone: string;
    email: string;
    website: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
  status: 'active' | 'inactive' | 'maintenance';
  roomTypes: {
    type: string;
    count: number;
    pricePerNight: number;
    maxOccupancy: number;
  }[];
  availability: {
    checkIn: string;
    checkOut: string;
    availableRooms: number;
  }[];
  stats: {
    totalBookings: number;
    averageRating: number;
    occupancyRate: number;
    revenue: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

const initialHotelData: Hotel = {
  name: '',
  location: '',
  description: '',
  category: 'turístico',
  rating: 5,
  price: 0,
  amenities: [],
  facilities: [],
  restrictions: [],
  images: [],
  videos: [],
  contact: {
    phone: '',
    email: '',
    website: ''
  },
  address: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Brasil'
  },
  coordinates: {
    lat: 0,
    lng: 0
  },
  status: 'active',
  roomTypes: [],
  availability: [],
  stats: {
    totalBookings: 0,
    averageRating: 0,
    occupancyRate: 0,
    revenue: 0
  }
};

export default function HotelsComplete() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [formData, setFormData] = useState<Hotel>(initialHotelData);
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Carregar hotéis completos na inicialização
  useEffect(() => {
    loadHotelsComplete();
  }, []);

  const loadHotelsComplete = async () => {
    setLoading(true);
    try {
      // Simular carregamento da API
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockHotels: Hotel[] = [
        {
          id: 1,
          name: "Resort Caldas Novas Premium",
          location: "Caldas Novas, GO",
          description: "Resort completo com águas termais naturais, parque aquático e spa relaxante. Perfeito para famílias e casais.",
          category: "luxo",
          rating: 4.8,
          price: 450,
          amenities: ["Piscina Termal", "Spa", "Restaurante", "Bar", "Academia", "Wi-Fi", "Estacionamento"],
          facilities: ["Ar Condicionado", "TV", "Frigobar", "Cofre", "Room Service", "Lavanderia"],
          restrictions: ["Não aceita pets", "Check-in 14h", "Check-out 12h"],
          images: ["/images/caldas1.jpg", "/images/caldas2.jpg"],
          videos: ["/videos/caldas-tour.mp4"],
          contact: {
            phone: "(64) 3453-1000",
            email: "reservas@caldasnovas.com",
            website: "www.caldasnovas.com"
          },
          address: {
            street: "Av. das Águas Termais, 1000",
            city: "Caldas Novas",
            state: "GO",
            zipCode: "75690-000",
            country: "Brasil"
          },
          coordinates: {
            lat: -17.7739,
            lng: -48.6211
          },
          status: "active",
          roomTypes: [
            { type: "Standard", count: 50, pricePerNight: 350, maxOccupancy: 2 },
            { type: "Luxo", count: 30, pricePerNight: 450, maxOccupancy: 4 },
            { type: "Suíte Premium", count: 20, pricePerNight: 650, maxOccupancy: 6 }
          ],
          availability: [
            { checkIn: "2025-02-01", checkOut: "2025-02-28", availableRooms: 80 },
            { checkIn: "2025-03-01", checkOut: "2025-03-31", availableRooms: 95 }
          ],
          stats: {
            totalBookings: 1247,
            averageRating: 4.8,
            occupancyRate: 85,
            revenue: 2500000
          },
          createdAt: "2024-01-15",
          updatedAt: "2025-01-20"
        },
        {
          id: 2,
          name: "Pousada Familiar Rio Quente",
          location: "Rio Quente, GO",
          description: "Pousada aconchegante com piscinas termais e ambiente familiar. Ideal para relaxar e curtir as águas quentes.",
          category: "turístico",
          rating: 4.5,
          price: 280,
          amenities: ["Piscina Termal", "Café da Manhã", "Wi-Fi", "Estacionamento", "Playground"],
          facilities: ["Ar Condicionado", "TV", "Frigobar", "Room Service"],
          restrictions: ["Aceita pets pequenos", "Check-in 14h"],
          images: ["/images/rioquente1.jpg"],
          videos: [],
          contact: {
            phone: "(64) 3442-2000",
            email: "contato@rioquente.com",
            website: "www.rioquente.com"
          },
          address: {
            street: "Rua das Termas, 500",
            city: "Rio Quente",
            state: "GO",
            zipCode: "75695-000",
            country: "Brasil"
          },
          coordinates: {
            lat: -17.7842,
            lng: -48.7533
          },
          status: "active",
          roomTypes: [
            { type: "Standard", count: 40, pricePerNight: 250, maxOccupancy: 3 },
            { type: "Família", count: 20, pricePerNight: 280, maxOccupancy: 5 }
          ],
          availability: [
            { checkIn: "2025-02-01", checkOut: "2025-02-28", availableRooms: 45 }
          ],
          stats: {
            totalBookings: 892,
            averageRating: 4.5,
            occupancyRate: 75,
            revenue: 850000
          },
          createdAt: "2024-02-10",
          updatedAt: "2025-01-18"
        }
      ];

      setHotels(mockHotels);
      setSuccess(`${mockHotels.length} hotéis carregados com sucesso!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(`Erro ao carregar hotéis: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHotel = () => {
    setSelectedHotel(null);
    setFormData(initialHotelData);
    setCurrentStep(1);
    setShowAddModal(true);
    setError('');
    setSuccess('');
  };

  const handleEditHotel = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setFormData(hotel);
    setCurrentStep(1);
    setShowAddModal(true);
    setError('');
    setSuccess('');
  };

  const handleViewHotel = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setShowViewModal(true);
  };

  const handleStatsHotel = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setShowStatsModal(true);
  };

  const handleSaveHotel = async () => {
    try {
      setSaving(true);
      setError('');

      // Validação por step
      if (currentStep === 1) {
        if (!formData.name || !formData.location || !formData.description) {
          setError('Preencha todos os campos obrigatórios');
          return;
        }
      }

      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (selectedHotel && selectedHotel.id) {
        // Atualizar hotel existente
        setHotels(prev => prev.map(h =>
          h.id === selectedHotel.id ? { ...formData, id: selectedHotel.id, updatedAt: new Date().toISOString() } : h
        ));
        setSuccess('Hotel atualizado com sucesso!');
      } else {
        // Criar novo hotel
        const newHotel = {
          ...formData,
          id: Date.now(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setHotels(prev => [...prev, newHotel]);
        setSuccess('Hotel criado com sucesso!');
      }

      setTimeout(() => {
        setShowAddModal(false);
        setSuccess('');
      }, 2000);

    } catch (error: any) {
      setError(`Erro ao salvar: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteHotel = async (hotelId: number) => {
    if (!confirm('Tem certeza que deseja excluir este hotel?')) return;

    try {
      setHotels(prev => prev.filter(h => h.id !== hotelId));
      setSuccess('Hotel excluído com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(`Erro ao excluir: ${error.message}`);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const keys = field.split('.');
      setFormData(prev => {
        const updated = { ...prev };
        let current = updated;
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i] as keyof typeof current] as any;
        }
        current[keys[keys.length - 1] as keyof typeof current] = value;
        return updated;
      });
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleArrayAdd = (field: string, value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field as keyof Hotel] as string[]), value.trim()]
      }));
    }
  };

  const handleArrayRemove = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof Hotel] as string[]).filter((_, i) => i !== index)
    }));
  };

  const filteredAndSortedHotels = hotels
    .filter(hotel => {
      const matchesSearch = hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           hotel.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || hotel.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || hotel.status === selectedStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      let aValue = a[sortBy as keyof Hotel];
      let bValue = b[sortBy as keyof Hotel];

      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'luxo': return 'bg-purple-100 text-purple-800';
      case 'executivo': return 'bg-blue-100 text-blue-800';
      case 'turístico': return 'bg-green-100 text-green-800';
      case 'econômico': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationButtons />

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Building className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">🏨 Sistema Completo de Hotéis</h1>
                <p className="text-sm text-gray-500">Gestão completa com todas as funcionalidades</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                >
                  <BarChart3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                >
                  <FileText className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={loadHotelsComplete}
                disabled={loading}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center"
              >
                {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5 mr-2" />}
                {loading ? 'Carregando...' : 'Atualizar'}
              </button>

              <button
                onClick={handleCreateHotel}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Novo Hotel
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Success/Error Messages */}
      {success && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            {success}
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Hotéis</p>
                <p className="text-2xl font-bold text-gray-900">{hotels.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Star className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avaliação Média</p>
                <p className="text-2xl font-bold text-gray-900">
                  {hotels.length > 0 ? (hotels.reduce((acc, h) => acc + h.rating, 0) / hotels.length).toFixed(1) : '0.0'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Preço Médio</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {hotels.length > 0 ? Math.round(hotels.reduce((acc, h) => acc + h.price, 0) / hotels.length) : '0'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ativos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {hotels.filter(h => h.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros Avançados */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar hotéis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas as categorias</option>
              <option value="luxo">Luxo</option>
              <option value="executivo">Executivo</option>
              <option value="turístico">Turístico</option>
              <option value="econômico">Econômico</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os status</option>
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
              <option value="maintenance">Manutenção</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Ordenar por Nome</option>
              <option value="rating">Ordenar por Avaliação</option>
              <option value="price">Ordenar por Preço</option>
              <option value="createdAt">Ordenar por Data</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center"
            >
              {sortOrder === 'asc' ? '↑' : '↓'} {sortOrder === 'asc' ? 'Crescente' : 'Decrescente'}
            </button>
          </div>
        </div>

        {/* Lista de Hotéis */}
        {loading ? (
          <div className="text-center py-12">
            <Loader className="w-12 h-12 animate-spin mx-auto text-blue-600" />
            <p className="mt-4 text-gray-600">Carregando hotéis...</p>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedHotels.map((hotel) => (
                  <div key={hotel.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="h-48 bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center relative">
                      <Building className="w-16 h-16 text-white" />
                      <div className="absolute top-4 right-4 flex space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(hotel.status)}`}>
                          {hotel.status}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 truncate">{hotel.name}</h3>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="ml-1 text-sm text-gray-600">{hotel.rating}</span>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-2 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {hotel.location}
                      </p>

                      <p className="text-gray-700 text-sm mb-4 line-clamp-2">{hotel.description}</p>

                      <div className="flex items-center justify-between mb-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(hotel.category)}`}>
                          {hotel.category}
                        </span>
                        <span className="text-lg font-bold text-blue-600">
                          R$ {hotel.price}
                        </span>
                      </div>

                      {/* Amenities Icons */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {hotel.amenities.slice(0, 4).map((amenity, index) => (
                          <div key={index} className="flex items-center text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            {amenity.includes('Wi-Fi') && <Wifi className="w-3 h-3 mr-1" />}
                            {amenity.includes('Piscina') && <Pool className="w-3 h-3 mr-1" />}
                            {amenity.includes('Estacionamento') && <Car className="w-3 h-3 mr-1" />}
                            {amenity.includes('Restaurante') && <Utensils className="w-3 h-3 mr-1" />}
                            <span>{amenity}</span>
                          </div>
                        ))}
                        {hotel.amenities.length > 4 && (
                          <span className="text-xs text-gray-500">+{hotel.amenities.length - 4} mais</span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleViewHotel(hotel)}
                          className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg flex items-center justify-center text-sm"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </button>
                        <button
                          onClick={() => handleStatsHotel(hotel)}
                          className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded-lg flex items-center justify-center text-sm"
                        >
                          <BarChart3 className="w-4 h-4 mr-1" />
                          Stats
                        </button>
                        <button
                          onClick={() => handleEditHotel(hotel)}
                          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg flex items-center justify-center text-sm"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </button>
                        <button
                          onClick={() => hotel.id && handleDeleteHotel(hotel.id)}
                          className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg flex items-center justify-center text-sm"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Lista View
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hotel</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avaliação</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAndSortedHotels.map((hotel) => (
                      <tr key={hotel.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                                <Building className="w-5 h-5 text-white" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{hotel.name}</div>
                              <div className="text-sm text-gray-500">{hotel.location}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(hotel.category)}`}>
                            {hotel.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="ml-1 text-sm text-gray-900">{hotel.rating}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          R$ {hotel.price}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(hotel.status)}`}>
                            {hotel.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewHotel(hotel)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditHotel(hotel)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => hotel.id && handleDeleteHotel(hotel.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {filteredAndSortedHotels.length === 0 && !loading && (
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum hotel encontrado</h3>
            <p className="text-gray-600 mb-4">Tente ajustar os filtros ou criar um novo hotel</p>
            <button
              onClick={handleCreateHotel}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center mx-auto"
            >
              <Plus className="w-5 h-5 mr-2" />
              Criar Primeiro Hotel
            </button>
          </div>
        )}
      </div>

      {/* Modal de Criação/Edição - Multistep */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-md bg-white max-h-[85vh] overflow-y-auto">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedHotel ? 'Editar Hotel' : 'Novo Hotel'} - Passo {currentStep}/3
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex items-center">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {step}
                      </div>
                      {step < 3 && (
                        <div className={`w-16 h-1 ${
                          step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-sm text-gray-600">
                  <span>Informações Básicas</span>
                  <span>Detalhes & Contato</span>
                  <span>Amenidades & Quartos</span>
                </div>
              </div>

              {/* Step 1: Informações Básicas */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome do Hotel *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: Resort Caldas Novas Premium"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Localização *
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: Caldas Novas, GO"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Descreva o hotel, suas características e diferenciais..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Categoria
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="luxo">Luxo</option>
                        <option value="executivo">Executivo</option>
                        <option value="turístico">Turístico</option>
                        <option value="econômico">Econômico</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Avaliação
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        value={formData.rating}
                        onChange={(e) => handleInputChange('rating', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preço Base (R$)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="active">Ativo</option>
                        <option value="inactive">Inativo</option>
                        <option value="maintenance">Manutenção</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Detalhes & Contato */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h4 className="text-md font-medium text-gray-900">Endereço Completo</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rua/Avenida
                      </label>
                      <input
                        type="text"
                        value={formData.address.street}
                        onChange={(e) => handleInputChange('address.street', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: Av. das Águas Termais, 1000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cidade
                      </label>
                      <input
                        type="text"
                        value={formData.address.city}
                        onChange={(e) => handleInputChange('address.city', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: Caldas Novas"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado
                      </label>
                      <input
                        type="text"
                        value={formData.address.state}
                        onChange={(e) => handleInputChange('address.state', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: GO"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CEP
                      </label>
                      <input
                        type="text"
                        value={formData.address.zipCode}
                        onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: 75690-000"
                      />
                    </div>
                  </div>

                  <h4 className="text-md font-medium text-gray-900">Contato</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefone
                      </label>
                      <input
                        type="text"
                        value={formData.contact.phone}
                        onChange={(e) => handleInputChange('contact.phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="(64) 3453-1000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.contact.email}
                        onChange={(e) => handleInputChange('contact.email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="reservas@hotel.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website
                      </label>
                      <input
                        type="text"
                        value={formData.contact.website}
                        onChange={(e) => handleInputChange('contact.website', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="www.hotel.com"
                      />
                    </div>
                  </div>

                  <h4 className="text-md font-medium text-gray-900">Coordenadas GPS</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Latitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={formData.coordinates.lat}
                        onChange={(e) => handleInputChange('coordinates.lat', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="-17.7739"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Longitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={formData.coordinates.lng}
                        onChange={(e) => handleInputChange('coordinates.lng', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="-48.6211"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Amenidades & Quartos */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h4 className="text-md font-medium text-gray-900">Amenidades</h4>
                  <div className="space-y-4">
                    {/* Lista de amenidades atual */}
                    <div className="flex flex-wrap gap-2">
                      {formData.amenities.map((amenity, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                          {amenity}
                          <button
                            onClick={() => handleArrayRemove('amenities', index)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Adicionar nova amenidade */}
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        id="new-amenity"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: Piscina Termal, Spa, Wi-Fi..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const input = e.target as HTMLInputElement;
                            handleArrayAdd('amenities', input.value);
                            input.value = '';
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          const input = document.getElementById('new-amenity') as HTMLInputElement;
                          handleArrayAdd('amenities', input.value);
                          input.value = '';
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-md font-medium text-gray-900">Facilidades</h4>
                  <div className="space-y-4">
                    {/* Lista de facilidades atual */}
                    <div className="flex flex-wrap gap-2">
                      {formData.facilities.map((facility, index) => (
                        <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center">
                          {facility}
                          <button
                            onClick={() => handleArrayRemove('facilities', index)}
                            className="ml-2 text-green-600 hover:text-green-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Adicionar nova facilidade */}
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        id="new-facility"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: Ar Condicionado, TV, Frigobar..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const input = e.target as HTMLInputElement;
                            handleArrayAdd('facilities', input.value);
                            input.value = '';
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          const input = document.getElementById('new-facility') as HTMLInputElement;
                          handleArrayAdd('facilities', input.value);
                          input.value = '';
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-md font-medium text-gray-900">Restrições</h4>
                  <div className="space-y-4">
                    {/* Lista de restrições atual */}
                    <div className="flex flex-wrap gap-2">
                      {formData.restrictions.map((restriction, index) => (
                        <span key={index} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm flex items-center">
                          {restriction}
                          <button
                            onClick={() => handleArrayRemove('restrictions', index)}
                            className="ml-2 text-red-600 hover:text-red-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Adicionar nova restrição */}
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        id="new-restriction"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: Não aceita pets, Check-in 14h..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const input = e.target as HTMLInputElement;
                            handleArrayAdd('restrictions', input.value);
                            input.value = '';
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          const input = document.getElementById('new-restriction') as HTMLInputElement;
                          handleArrayAdd('restrictions', input.value);
                          input.value = '';
                        }}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <div>
                  {currentStep > 1 && (
                    <button
                      onClick={() => setCurrentStep(currentStep - 1)}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Anterior
                    </button>
                  )}
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>

                  {currentStep < 3 ? (
                    <button
                      onClick={() => setCurrentStep(currentStep + 1)}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    >
                      Próximo
                    </button>
                  ) : (
                    <button
                      onClick={handleSaveHotel}
                      disabled={saving}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Salvar Hotel
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Visualização Detalhada */}
      {showViewModal && selectedHotel && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-medium text-gray-900 flex items-center">
                  <Building className="w-6 h-6 mr-2 text-blue-600" />
                  {selectedHotel.name}
                </h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Coluna Principal */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Header com imagem */}
                  <div className="h-64 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center relative">
                    <Building className="w-24 h-24 text-white" />
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedHotel.status)}`}>
                        {selectedHotel.status}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <div className="flex items-center">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="ml-1 text-lg font-semibold">{selectedHotel.rating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Descrição */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Descrição</h4>
                    <p className="text-gray-700">{selectedHotel.description}</p>
                  </div>

                  {/* Amenidades */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Amenidades</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {selectedHotel.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-700 bg-blue-50 px-3 py-2 rounded-lg">
                          {amenity.includes('Wi-Fi') && <Wifi className="w-4 h-4 mr-2 text-blue-600" />}
                          {amenity.includes('Piscina') && <Pool className="w-4 h-4 mr-2 text-blue-600" />}
                          {amenity.includes('Estacionamento') && <Car className="w-4 h-4 mr-2 text-blue-600" />}
                          {amenity.includes('Restaurante') && <Utensils className="w-4 h-4 mr-2 text-blue-600" />}
                          {amenity.includes('Academia') && <Dumbbell className="w-4 h-4 mr-2 text-blue-600" />}
                          {amenity.includes('Bar') && <Coffee className="w-4 h-4 mr-2 text-blue-600" />}
                          <span>{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Facilidades */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Facilidades dos Quartos</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {selectedHotel.facilities.map((facility, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-700 bg-green-50 px-3 py-2 rounded-lg">
                          {facility.includes('Ar Condicionado') && <AirVent className="w-4 h-4 mr-2 text-green-600" />}
                          {facility.includes('TV') && <Tv className="w-4 h-4 mr-2 text-green-600" />}
                          {facility.includes('Cofre') && <ShieldCheck className="w-4 h-4 mr-2 text-green-600" />}
                          <span>{facility}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tipos de Quartos */}
                  {selectedHotel.roomTypes.length > 0 && (
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-3">Tipos de Quartos</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedHotel.roomTypes.map((room, index) => (
                          <div key={index} className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <h5 className="font-medium text-gray-900">{room.type}</h5>
                              <span className="text-lg font-bold text-blue-600">R$ {room.pricePerNight}/noite</span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div className="flex items-center">
                                <Building className="w-4 h-4 mr-2" />
                                {room.count} quartos disponíveis
                              </div>
                              <div className="flex items-center">
                                <Users className="w-4 h-4 mr-2" />
                                Até {room.maxOccupancy} pessoas
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar com informações */}
                <div className="space-y-6">
                  {/* Preço e Categoria */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-center mb-4">
                      <div className="text-3xl font-bold text-blue-600">R$ {selectedHotel.price}</div>
                      <div className="text-sm text-gray-600">por noite</div>
                    </div>
                    <div className="text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(selectedHotel.category)}`}>
                        {selectedHotel.category}
                      </span>
                    </div>
                  </div>

                  {/* Localização */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Localização
                    </h5>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div>{selectedHotel.address.street}</div>
                      <div>{selectedHotel.address.city}, {selectedHotel.address.state}</div>
                      <div>{selectedHotel.address.zipCode}</div>
                      <div>{selectedHotel.address.country}</div>
                    </div>
                  </div>

                  {/* Contato */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-3">Contato</h5>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        {selectedHotel.contact.phone}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        {selectedHotel.contact.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Globe className="w-4 h-4 mr-2" />
                        {selectedHotel.contact.website}
                      </div>
                    </div>
                  </div>

                  {/* Estatísticas */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Estatísticas
                    </h5>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total de Reservas:</span>
                        <span className="font-medium">{selectedHotel.stats.totalBookings}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Taxa de Ocupação:</span>
                        <span className="font-medium">{selectedHotel.stats.occupancyRate}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Receita Total:</span>
                        <span className="font-medium">R$ {selectedHotel.stats.revenue.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Restrições */}
                  {selectedHotel.restrictions.length > 0 && (
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2 text-red-600" />
                        Restrições
                      </h5>
                      <div className="space-y-2">
                        {selectedHotel.restrictions.map((restriction, index) => (
                          <div key={index} className="text-sm text-red-700 flex items-start">
                            <span className="w-1 h-1 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            {restriction}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ações */}
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        handleEditHotel(selectedHotel);
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar Hotel
                    </button>
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        handleStatsHotel(selectedHotel);
                      }}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg flex items-center justify-center"
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Ver Estatísticas
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Estatísticas */}
      {showStatsModal && selectedHotel && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white max-h-[80vh] overflow-y-auto">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-medium text-gray-900 flex items-center">
                  <BarChart3 className="w-6 h-6 mr-2 text-purple-600" />
                  Estatísticas - {selectedHotel.name}
                </h3>
                <button
                  onClick={() => setShowStatsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Métricas Principais */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900">Métricas Principais</h4>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600">Total de Reservas</p>
                        <p className="text-2xl font-bold text-blue-900">{selectedHotel.stats.totalBookings}</p>
                      </div>
                      <Calendar className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600">Taxa de Ocupação</p>
                        <p className="text-2xl font-bold text-green-900">{selectedHotel.stats.occupancyRate}%</p>
                      </div>
                      <Users className="w-8 h-8 text-green-600" />
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-yellow-600">Avaliação Média</p>
                        <p className="text-2xl font-bold text-yellow-900">{selectedHotel.stats.averageRating}</p>
                      </div>
                      <Star className="w-8 h-8 text-yellow-600" />
                    </div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-600">Receita Total</p>
                        <p className="text-2xl font-bold text-purple-900">R$ {selectedHotel.stats.revenue.toLocaleString()}</p>
                      </div>
                      <DollarSign className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                </div>

                {/* Informações Adicionais */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900">Análise Detalhada</h4>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-2">Performance</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Receita por Reserva:</span>
                        <span className="font-medium">R$ {Math.round(selectedHotel.stats.revenue / selectedHotel.stats.totalBookings)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Quartos Disponíveis:</span>
                        <span className="font-medium">{selectedHotel.roomTypes.reduce((acc, room) => acc + room.count, 0)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Preço Médio Quarto:</span>
                        <span className="font-medium">R$ {selectedHotel.roomTypes.length > 0 ? Math.round(selectedHotel.roomTypes.reduce((acc, room) => acc + room.pricePerNight, 0) / selectedHotel.roomTypes.length) : 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-2">Capacidade</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Capacidade Máxima:</span>
                        <span className="font-medium">{selectedHotel.roomTypes.reduce((acc, room) => acc + (room.count * room.maxOccupancy), 0)} pessoas</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tipos de Quarto:</span>
                        <span className="font-medium">{selectedHotel.roomTypes.length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-2">Qualidade</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Total de Amenidades:</span>
                        <span className="font-medium">{selectedHotel.amenities.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Facilidades por Quarto:</span>
                        <span className="font-medium">{selectedHotel.facilities.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Status Operacional:</span>
                        <span className={`font-medium ${selectedHotel.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedHotel.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gráfico Simples de Ocupação */}
              <div className="mt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Projeção de Ocupação</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-12 gap-1 h-32">
                    {Array.from({length: 12}, (_, i) => {
                      const month = i + 1;
                      const occupancy = Math.max(40, Math.min(95, selectedHotel.stats.occupancyRate + (Math.random() * 20 - 10)));
                      return (
                        <div key={i} className="flex flex-col justify-end">
                          <div
                            className="bg-blue-500 rounded-t"
                            style={{height: `${occupancy}%`}}
                            title={`${month}/${new Date().getFullYear()}: ${occupancy.toFixed(0)}%`}
                          ></div>
                          <div className="text-xs text-center mt-1 text-gray-600">{month}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-xs text-gray-600 mt-2 text-center">
                    Taxa de ocupação mensal (estimativa baseada nos dados atuais)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
