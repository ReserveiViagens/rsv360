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

export default function HotelsDebug() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [formData, setFormData] = useState<Hotel>(initialHotelData);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [debugLog, setDebugLog] = useState<string[]>([]);

  // Função para adicionar logs de debug
  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log('🐛 DEBUG:', logMessage);
    setDebugLog(prev => [...prev.slice(-4), logMessage]); // Manter apenas últimos 5 logs
  };

  // Carregar hotéis mock na inicialização
  useEffect(() => {
    addDebugLog('Componente iniciado - carregando dados mock');
    const mockHotels: Hotel[] = [
      {
        id: 1,
        name: "Hotel Teste",
        location: "São Paulo, SP",
        description: "Hotel para testes do sistema",
        category: "turístico",
        rating: 4.5,
        price: 350,
        amenities: ["Wi-Fi", "Piscina"],
        facilities: ["Estacionamento", "Café da manhã"],
        restrictions: [],
        images: [],
        videos: [],
        contact: {
          phone: "(11) 1234-5678",
          email: "teste@hotel.com",
          website: "www.hotel.com"
        },
        status: "active",
        createdAt: "2025-01-01",
        updatedAt: "2025-01-01"
      }
    ];
    setHotels(mockHotels);
    addDebugLog(`${mockHotels.length} hotéis carregados`);
  }, []);

  const handleCreateHotel = () => {
    addDebugLog('Botão "Novo Hotel" clicado');
    try {
      setSelectedHotel(null);
      setFormData(initialHotelData);
      setShowAddModal(true);
      setError('');
      setSuccess('');
      addDebugLog('Modal aberto para criar novo hotel');
    } catch (err: any) {
      addDebugLog(`ERRO ao abrir modal: ${err.message}`);
      setError('Erro ao abrir modal de criação');
    }
  };

  const handleEditHotel = (hotel: Hotel) => {
    addDebugLog(`Editando hotel: ${hotel.name}`);
    try {
      setSelectedHotel(hotel);
      setFormData(hotel);
      setShowAddModal(true);
      setError('');
      setSuccess('');
      addDebugLog('Modal aberto para editar hotel');
    } catch (err: any) {
      addDebugLog(`ERRO ao editar hotel: ${err.message}`);
      setError('Erro ao abrir modal de edição');
    }
  };

  const handleSaveHotel = async () => {
    addDebugLog('Iniciando salvamento de hotel');
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Validação básica
      if (!formData.name || !formData.location || !formData.description) {
        const errorMsg = 'Preencha todos os campos obrigatórios';
        addDebugLog(`Validação falhou: ${errorMsg}`);
        setError(errorMsg);
        return;
      }

      addDebugLog('Validação passou - salvando hotel');

      if (selectedHotel && selectedHotel.id) {
        // Atualizar hotel existente
        setHotels(prev => prev.map(h =>
          h.id === selectedHotel.id ? { ...formData, id: selectedHotel.id } : h
        ));
        addDebugLog(`Hotel ID ${selectedHotel.id} atualizado`);
        setSuccess('Hotel atualizado com sucesso!');
      } else {
        // Criar novo hotel
        const newHotel = { ...formData, id: Date.now() };
        setHotels(prev => [...prev, newHotel]);
        addDebugLog(`Novo hotel criado com ID ${newHotel.id}`);
        setSuccess('Hotel criado com sucesso!');
      }

      // Fechar modal após sucesso
      setTimeout(() => {
        setShowAddModal(false);
        setSuccess('');
        addDebugLog('Modal fechado após salvamento');
      }, 1500);

    } catch (error: any) {
      const errorMsg = `Erro ao salvar: ${error.message || 'Erro desconhecido'}`;
      addDebugLog(`ERRO: ${errorMsg}`);
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteHotel = async (hotelId: number) => {
    addDebugLog(`Excluindo hotel ID: ${hotelId}`);
    if (!confirm('Tem certeza que deseja excluir este hotel?')) {
      addDebugLog('Exclusão cancelada pelo usuário');
      return;
    }

    try {
      setHotels(prev => prev.filter(h => h.id !== hotelId));
      addDebugLog(`Hotel ID ${hotelId} excluído`);
      setSuccess('Hotel excluído com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      const errorMsg = `Erro ao excluir: ${error.message}`;
      addDebugLog(`ERRO: ${errorMsg}`);
      setError(errorMsg);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    addDebugLog(`Campo alterado: ${field} = ${value}`);
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
                <h1 className="text-2xl font-bold text-gray-900">🐛 Hotéis - Versão Debug</h1>
                <p className="text-sm text-gray-500">Sistema com logs de debug ativados</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  addDebugLog('Botão "Teste Modal" clicado diretamente');
                  alert('Teste: Se você vê esta mensagem, JavaScript está funcionando!');
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                🧪 Teste JS
              </button>
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

      {/* Debug Panel */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-300 font-bold">🐛 DEBUG LOG:</span>
            <span className="text-yellow-400">Modal: {showAddModal ? 'ABERTO' : 'FECHADO'}</span>
          </div>
          {debugLog.length === 0 ? (
            <div>Aguardando interações...</div>
          ) : (
            debugLog.map((log, index) => (
              <div key={index} className="text-xs opacity-80">{log}</div>
            ))
          )}
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            ✅ {success}
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            ❌ {error}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar hotéis..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  addDebugLog(`Busca alterada: "${e.target.value}"`);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                addDebugLog(`Categoria alterada: ${e.target.value}`);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todas as categorias</option>
              <option value="luxo">Luxo</option>
              <option value="executivo">Executivo</option>
              <option value="turístico">Turístico</option>
              <option value="econômico">Econômico</option>
            </select>
          </div>
        </div>

        {/* Lista de Hotéis */}
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

        {filteredHotels.length === 0 && (
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
                  🎉 {selectedHotel ? 'Editar Hotel' : 'Novo Hotel'} - MODAL FUNCIONANDO!
                </h3>
                <button
                  onClick={() => {
                    addDebugLog('Modal fechado pelo botão X');
                    setShowAddModal(false);
                  }}
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
                  onClick={() => {
                    addDebugLog('Modal cancelado');
                    setShowAddModal(false);
                  }}
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
