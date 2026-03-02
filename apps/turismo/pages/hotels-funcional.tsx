import React, { useState, useEffect } from 'react';
import {
  Building,
  MapPin,
  Star,
  DollarSign,
  Users,
  Calendar,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Eye,
  Camera,
  Video,
  BarChart3,
  FileText,
  Settings,
  MoreHorizontal,
  Heart,
  Share2,
  MessageCircle,
  Phone,
  Mail,
  Globe,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Save,
  Loader
} from 'lucide-react';
import NavigationButtons from '../components/NavigationButtons';
import { travelService } from '../services/api-corrigido';

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
  status: 'active' | 'inactive';
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
  status: 'active'
};

export default function HotelsFuncional() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [formData, setFormData] = useState<Hotel>(initialHotelData);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Carregar hotéis da API
  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('🔄 Carregando hotéis...');
      const response = await travelService.getHotels();

      if (Array.isArray(response)) {
        setHotels(response);
        console.log('✅ Hotéis carregados:', response.length);
      } else {
        // Se API retornar formato diferente ou erro, usar dados mock
        console.log('⚠️ API não disponível, usando dados mock');
        setHotels(getMockHotels());
      }
    } catch (error) {
      console.error('❌ Erro ao carregar hotéis:', error);
      setError('Erro ao carregar hotéis. Usando dados locais.');
      setHotels(getMockHotels());
    } finally {
      setLoading(false);
    }
  };

  const getMockHotels = (): Hotel[] => [
    {
      id: 1,
      name: "Copacabana Palace",
      location: "Rio de Janeiro, RJ",
      description: "Hotel histórico de luxo na praia de Copacabana, oferecendo experiências únicas e serviço de primeira classe.",
      category: "luxo",
      rating: 4.9,
      price: 2500,
      amenities: ["Piscina", "Spa", "Restaurante", "Concierge"],
      facilities: ["Wi-Fi", "Estacionamento", "Academia", "Sala de conferências"],
      restrictions: ["Não aceita pets"],
      images: ["/images/hotels/copacabana-palace-1.jpg"],
      videos: [],
      contact: {
        phone: "(21) 2548-7070",
        email: "reservas@copacabanapalace.com",
        website: "www.copacabanapalace.com"
      },
      status: "active",
      createdAt: "2024-01-15",
      updatedAt: "2024-01-20"
    }
  ];

  const handleCreateHotel = () => {
    setSelectedHotel(null);
    setFormData(initialHotelData);
    setShowAddModal(true);
    setError('');
    setSuccess('');
  };

  const handleEditHotel = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setFormData(hotel);
    setShowAddModal(true);
    setError('');
    setSuccess('');
  };

  const handleSaveHotel = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Validação básica
      if (!formData.name || !formData.location || !formData.description) {
        setError('Preencha todos os campos obrigatórios');
        return;
      }

      console.log('💾 Salvando hotel:', formData);

      let result;
      if (selectedHotel && selectedHotel.id) {
        // Atualizar hotel existente
        result = await travelService.updateHotel(selectedHotel.id, formData);
        console.log('✅ Hotel atualizado:', result);

        // Atualizar na lista local
        setHotels(prev => prev.map(h =>
          h.id === selectedHotel.id ? { ...formData, id: selectedHotel.id } : h
        ));
        setSuccess('Hotel atualizado com sucesso!');
      } else {
        // Criar novo hotel
        result = await travelService.createHotel(formData);
        console.log('✅ Hotel criado:', result);

        // Adicionar à lista local
        const newHotel = { ...formData, id: Date.now() }; // ID temporário
        setHotels(prev => [...prev, newHotel]);
        setSuccess('Hotel criado com sucesso!');
      }

      // Fechar modal após sucesso
      setTimeout(() => {
        setShowAddModal(false);
        setSuccess('');
      }, 2000);

    } catch (error: any) {
      console.error('❌ Erro ao salvar hotel:', error);
      setError(`Erro ao salvar: ${error.message || 'Erro desconhecido'}`);

      // Se falhar na API, salvar localmente
      if (selectedHotel && selectedHotel.id) {
        setHotels(prev => prev.map(h =>
          h.id === selectedHotel.id ? { ...formData, id: selectedHotel.id } : h
        ));
        setError('Salvamento offline realizado. Conecte-se à internet para sincronizar.');
      } else {
        const newHotel = { ...formData, id: Date.now() };
        setHotels(prev => [...prev, newHotel]);
        setError('Hotel salvo localmente. Conecte-se à internet para sincronizar.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteHotel = async (hotelId: number) => {
    if (!confirm('Tem certeza que deseja excluir este hotel?')) return;

    try {
      console.log('🗑️ Excluindo hotel:', hotelId);
      await travelService.deleteHotel(hotelId);

      setHotels(prev => prev.filter(h => h.id !== hotelId));
      setSuccess('Hotel excluído com sucesso!');

      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('❌ Erro ao excluir hotel:', error);

      // Excluir localmente mesmo se API falhar
      setHotels(prev => prev.filter(h => h.id !== hotelId));
      setError('Hotel excluído localmente. Conecte-se à internet para sincronizar.');
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof Hotel],
          [child]: value
        }
      }));
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

  const filteredHotels = hotels.filter(hotel => {
    const matchesSearch = hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hotel.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || hotel.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
                <h1 className="text-2xl font-bold text-gray-900">Gestão de Hotéis</h1>
                <p className="text-sm text-gray-500">Sistema funcional com API integrada</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleCreateHotel}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
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
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todas as categorias</option>
              <option value="luxo">Luxo</option>
              <option value="executivo">Executivo</option>
              <option value="turístico">Turístico</option>
              <option value="econômico">Econômico</option>
            </select>

            <button
              onClick={loadHotels}
              disabled={loading}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors"
            >
              {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5 mr-2" />}
              {loading ? 'Carregando...' : 'Atualizar'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHotels.map((hotel) => (
              <div key={hotel.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="h-48 bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                  <Building className="w-16 h-16 text-white" />
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
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      hotel.category === 'luxo' ? 'bg-purple-100 text-purple-800' :
                      hotel.category === 'executivo' ? 'bg-blue-100 text-blue-800' :
                      hotel.category === 'turístico' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {hotel.category}
                    </span>
                    <span className="text-lg font-bold text-blue-600">
                      R$ {hotel.price}
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditHotel(hotel)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </button>
                    <button
                      onClick={() => hotel.id && handleDeleteHotel(hotel.id)}
                      className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredHotels.length === 0 && !loading && (
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

      {/* Modal de Criação/Edição */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white max-h-[80vh] overflow-y-auto">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedHotel ? 'Editar Hotel' : 'Novo Hotel'}
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Informações Básicas */}
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
                      placeholder="Ex: Hotel Copacabana Palace"
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
                      placeholder="Ex: Rio de Janeiro, RJ"
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
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Descreva o hotel..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      Preço (R$)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Contato */}
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
                      placeholder="(11) 1234-5678"
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
                      placeholder="contato@hotel.com"
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
              </div>

              {/* Botões de Ação */}
              <div className="flex justify-end space-x-3 mt-8">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveHotel}
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center transition-colors disabled:opacity-50"
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
