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
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Filter as FilterIcon,
  Search as SearchIcon,
  Plus as PlusIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  BarChart3 as BarChart3Icon,
  FileText as FileTextIcon,
  Settings as SettingsIcon
} from 'lucide-react';
import NavigationButtons from '../components/NavigationButtons';

interface Hotel {
  id: number;
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
  createdAt: string;
  updatedAt: string;
}

export default function Hotels() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [newVideo, setNewVideo] = useState<File | null>(null);

  // Dados mockados para hotéis
  const mockHotels: Hotel[] = [
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
      images: ["/images/hotels/copacabana-palace-1.jpg", "/images/hotels/copacabana-palace-2.jpg"],
      videos: ["/videos/hotels/copacabana-palace.mp4"],
      contact: {
        phone: "(21) 2548-7070",
        email: "reservas@copacabanapalace.com",
        website: "www.copacabanapalace.com"
      },
      status: "active",
      createdAt: "2024-01-15",
      updatedAt: "2024-01-20"
    },
    {
      id: 2,
      name: "Fasano São Paulo",
      location: "São Paulo, SP",
      description: "Hotel boutique de luxo no coração de São Paulo, conhecido por seu design sofisticado e gastronomia excepcional.",
      category: "luxo",
      rating: 4.8,
      price: 1800,
      amenities: ["Restaurante", "Bar", "Spa", "Academia"],
      facilities: ["Wi-Fi", "Estacionamento", "Concierge", "Sala de eventos"],
      restrictions: ["Não aceita pets"],
      images: ["/images/hotels/fasano-sp-1.jpg", "/images/hotels/fasano-sp-2.jpg"],
      videos: ["/videos/hotels/fasano-sp.mp4"],
      contact: {
        phone: "(11) 3896-4000",
        email: "reservas@fasano.com.br",
        website: "www.fasano.com.br"
      },
      status: "active",
      createdAt: "2024-01-10",
      updatedAt: "2024-01-18"
    },
    {
      id: 3,
      name: "Pousada do Ouro",
      location: "Paraty, RJ",
      description: "Pousada charmosa no centro histórico de Paraty, oferecendo conforto e proximidade com as principais atrações.",
      category: "turístico",
      rating: 4.5,
      price: 450,
      amenities: ["Café da manhã", "Wi-Fi", "Ar condicionado"],
      facilities: ["Wi-Fi", "Café da manhã", "Ar condicionado"],
      restrictions: ["Não aceita pets"],
      images: ["/images/hotels/pousada-ouro-1.jpg"],
      videos: [],
      contact: {
        phone: "(24) 3371-1555",
        email: "contato@pousadadoouro.com",
        website: "www.pousadadoouro.com"
      },
      status: "active",
      createdAt: "2024-01-05",
      updatedAt: "2024-01-12"
    },
    {
      id: 4,
      name: "Brasília Palace Hotel",
      location: "Brasília, DF",
      description: "Hotel executivo moderno no centro empresarial de Brasília, ideal para viagens de negócios.",
      category: "executivo",
      rating: 4.3,
      price: 650,
      amenities: ["Restaurante", "Academia", "Sala de conferências"],
      facilities: ["Wi-Fi", "Estacionamento", "Business center", "Sala de reuniões"],
      restrictions: ["Não aceita pets"],
      images: ["/images/hotels/brasilia-palace-1.jpg"],
      videos: [],
      contact: {
        phone: "(61) 3322-0044",
        email: "reservas@brasiliapalace.com",
        website: "www.brasiliapalace.com"
      },
      status: "active",
      createdAt: "2024-01-08",
      updatedAt: "2024-01-15"
    },
    {
      id: 5,
      name: "Hostel Floripa",
      location: "Florianópolis, SC",
      description: "Hostel econômico próximo à praia, perfeito para mochileiros e viajantes com orçamento limitado.",
      category: "econômico",
      rating: 4.1,
      price: 120,
      amenities: ["Café da manhã", "Wi-Fi", "Cozinha compartilhada"],
      facilities: ["Wi-Fi", "Café da manhã", "Cozinha", "Sala comum"],
      restrictions: ["Não aceita pets"],
      images: ["/images/hotels/hostel-floripa-1.jpg"],
      videos: [],
      contact: {
        phone: "(48) 3333-4444",
        email: "contato@hostelfloripa.com",
        website: "www.hostelfloripa.com"
      },
      status: "active",
      createdAt: "2024-01-03",
      updatedAt: "2024-01-10"
    },
    {
      id: 6,
      name: "Pousada do Mar",
      location: "Porto de Galinhas, PE",
      description: "Pousada familiar na praia de Porto de Galinhas, oferecendo tranquilidade e contato com a natureza.",
      category: "turístico",
      rating: 4.6,
      price: 380,
      amenities: ["Piscina", "Café da manhã", "Wi-Fi"],
      facilities: ["Wi-Fi", "Café da manhã", "Piscina", "Estacionamento"],
      restrictions: ["Não aceita pets"],
      images: ["/images/hotels/pousada-mar-1.jpg"],
      videos: [],
      contact: {
        phone: "(81) 3552-1234",
        email: "reservas@pousadadomar.com",
        website: "www.pousadadomar.com"
      },
      status: "active",
      createdAt: "2024-01-12",
      updatedAt: "2024-01-19"
    }
  ];

  useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => {
      setHotels(mockHotels);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
  };

  const handlePeriodFilter = (period: string) => {
    setSelectedPeriod(period);
  };

  const handleAddHotel = () => {
    setShowAddModal(true);
  };

  const handleEditHotel = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setShowAddModal(true);
  };

  const handleDeleteHotel = (hotelId: number) => {
    if (confirm('Tem certeza que deseja excluir este hotel?')) {
      setHotels(hotels.filter(hotel => hotel.id !== hotelId));
    }
  };

  const handleVideoUpload = async () => {
    if (!newVideo || !selectedHotel) return;

    setUploadingVideo(true);
    try {
      // Simular upload de vídeo
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Adicionar vídeo ao hotel selecionado
      const updatedHotels = hotels.map(hotel => 
        hotel.id === selectedHotel.id 
          ? { ...hotel, videos: [...hotel.videos, URL.createObjectURL(newVideo)] }
          : hotel
      );
      
      setHotels(updatedHotels);
      setShowVideoModal(false);
      setNewVideo(null);
      setSelectedHotel(null);
      alert('Vídeo enviado com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar vídeo:', error);
      alert('Erro ao enviar vídeo. Tente novamente.');
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleDeleteVideo = (hotelId: number, videoIndex: number) => {
    if (confirm('Tem certeza que deseja excluir este vídeo?')) {
      const updatedHotels = hotels.map(hotel => 
        hotel.id === hotelId 
          ? { ...hotel, videos: hotel.videos.filter((_, index) => index !== videoIndex) }
          : hotel
      );
      setHotels(updatedHotels);
    }
  };

  // Funções de estatísticas e relatórios
  const getStatistics = () => {
    const totalHotels = hotels.length;
    const averageRating = hotels.reduce((sum, hotel) => sum + hotel.rating, 0) / totalHotels;
    const averageRevenue = hotels.reduce((sum, hotel) => sum + hotel.price, 0) / totalHotels;
    
    return {
      total: totalHotels,
      rating: averageRating.toFixed(1),
      revenue: averageRevenue.toFixed(0)
    };
  };

  const exportReport = async () => {
    try {
      // Simular geração de relatório
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const content = `Relatório de Hotéis\n\n`;
      const report = content + hotels.map(hotel => 
        `${hotel.name} - ${hotel.location} - R$ ${hotel.price}/noite`
      ).join('\n');
      
      const blob = new Blob([report], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'relatorio-hoteis.txt';
      a.click();
      URL.revokeObjectURL(url);
      
      alert('Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      alert('Erro ao exportar relatório. Tente novamente.');
    }
  };

  // Funções auxiliares
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'luxo': return 'bg-purple-100 text-purple-800';
      case 'executivo': return 'bg-blue-100 text-blue-800';
      case 'turístico': return 'bg-green-100 text-green-800';
      case 'econômico': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatisticLabel = (type: string) => {
    switch (type) {
      case 'total': return 'Total de Hotéis';
      case 'rating': return 'Avaliação Média';
      case 'revenue': return 'Receita Média';
      default: return 'Estatísticas';
    }
  };

  const filteredHotels = hotels.filter(hotel => {
    const matchesSearch = hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hotel.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || hotel.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = getStatistics();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <NavigationButtons />
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="mt-4 text-gray-600">Carregando hotéis...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <NavigationButtons />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestão de Hotéis</h1>
              <p className="text-gray-600">Gerencie hotéis, pousadas e resorts</p>
            </div>
            <button
              onClick={handleAddHotel}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Adicionar Hotel</span>
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Hotéis</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats.rating}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Receita Média</p>
                <p className="text-2xl font-bold text-gray-900">R$ {stats.revenue}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar hotéis..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todas as Categorias</option>
                <option value="luxo">Luxo</option>
                <option value="executivo">Executivo</option>
                <option value="turístico">Turístico</option>
                <option value="econômico">Econômico</option>
              </select>

              <select
                value={selectedPeriod}
                onChange={(e) => handlePeriodFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos os Períodos</option>
                <option value="daily">Diário</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
              </select>

              <button
                onClick={exportReport}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>Exportar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Hotéis */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Hotéis ({filteredHotels.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hotel</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Localização</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Avaliação</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Preço</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredHotels.map((hotel) => (
                  <tr key={hotel.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Building className="w-6 h-6 text-gray-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{hotel.name}</div>
                          <div className="text-sm text-gray-500">{hotel.contact.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{hotel.location}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(hotel.category)}`}>
                        {hotel.category}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span className="text-sm text-gray-900">{hotel.rating}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-900">R$ {hotel.price}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        hotel.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {hotel.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditHotel(hotel)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteHotel(hotel.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedHotel(hotel);
                            setShowVideoModal(true);
                          }}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Video className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de Vídeo */}
        {showVideoModal && selectedHotel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Gerenciar Vídeos</h3>
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Adicionar novo vídeo</p>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setNewVideo(e.target.files?.[0] || null)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              {uploadingVideo && (
                <div className="mb-4">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    <p className="mt-2 text-sm text-gray-600">Fazendo upload do vídeo...</p>
                  </div>
                </div>
              )}

              <div className="mb-4">
                <h4 className="font-medium mb-2">Vídeos existentes:</h4>
                {selectedHotel.videos.length > 0 ? (
                  <div className="space-y-2">
                    {selectedHotel.videos.map((video, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">Vídeo {index + 1}</span>
                        <button
                          onClick={() => handleDeleteVideo(selectedHotel.id, index)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Nenhum vídeo adicionado ainda</p>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleVideoUpload}
                  disabled={!newVideo || uploadingVideo}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Enviar Vídeo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Adicionar/Editar Hotel */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">
                  {selectedHotel ? 'Editar Hotel' : 'Adicionar Hotel'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedHotel(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Hotel</label>
                  <input
                    type="text"
                    defaultValue={selectedHotel?.name || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
                  <input
                    type="text"
                    defaultValue={selectedHotel?.location || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="luxo">Luxo</option>
                    <option value="executivo">Executivo</option>
                    <option value="turístico">Turístico</option>
                    <option value="econômico">Econômico</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preço por Noite</label>
                  <input
                    type="number"
                    defaultValue={selectedHotel?.price || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    rows={3}
                    defaultValue={selectedHotel?.description || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedHotel(null);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  {selectedHotel ? 'Atualizar' : 'Adicionar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
