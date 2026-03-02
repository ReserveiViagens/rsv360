import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Camera,
  Image,
  Eye,
  Download,
  Upload,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Tag,
  Heart,
  Share,
  Edit,
  Trash2,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Shield,
  AlertTriangle,
  Info,
  Copy,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Globe,
  Settings,
  Database,
  Server,
  Zap,
  Target,
  Award,
  Star,
  ThumbsUp,
  MessageSquare,
  Bell,
  Lock,
  Unlock,
  Key,
  UserCheck,
  Users,
  UserPlus,
  UserX,
  UserCog,
  UserMinus,
  UserSearch,
  UserCheck2,
  UserX2,
  UserCog2,
  UserMinus2,
  Folder,
  FileText,
  ImageIcon,
  Video,
  Music,
  Archive,
  BookOpen,
  Bookmark,
  BookmarkPlus,
  BookmarkMinus,
  BookmarkX,
  BookmarkCheck
} from 'lucide-react';
import NavigationButtons from '../components/NavigationButtons';

interface Photo {
  id: string;
  title: string;
  description: string;
  filename: string;
  size: number;
  dimensions: string;
  format: string;
  category: string;
  tags: string[];
  uploaded_by: string;
  uploaded_at: string;
  views: number;
  likes: number;
  downloads: number;
  status: 'public' | 'private' | 'archived';
  url: string;
  thumbnail_url: string;
}

export default function PhotosPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  // Dados simulados
  const [stats] = useState({
    total_photos: 1247,
    public_photos: 980,
    private_photos: 180,
    archived_photos: 87,
    total_size: '2.5 GB',
    average_size: '2.1 MB',
    total_views: 45000,
    total_likes: 1200,
    total_downloads: 850,
    categories: 15
  });

  // Cards clicáveis de estatísticas
  const statsCards = [
    {
      id: 'total_photos',
      title: 'Total de Fotos',
      value: stats.total_photos.toString(),
      icon: <ImageIcon className="h-6 w-6" />,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      description: 'Fotos no sistema'
    },
    {
      id: 'public_photos',
      title: 'Públicas',
      value: stats.public_photos.toString(),
      icon: <Globe className="h-6 w-6" />,
      color: 'bg-green-500',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      description: 'Fotos públicas'
    },
    {
      id: 'total_size',
      title: 'Tamanho Total',
      value: stats.total_size,
      icon: <Folder className="h-6 w-6" />,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      description: 'Espaço utilizado'
    },
    {
      id: 'total_views',
      title: 'Visualizações',
      value: stats.total_views.toLocaleString(),
      icon: <Eye className="h-6 w-6" />,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600',
      description: 'Total de visualizações'
    },
    {
      id: 'total_likes',
      title: 'Curtidas',
      value: stats.total_likes.toLocaleString(),
      icon: <Heart className="h-6 w-6" />,
      color: 'bg-red-500',
      bgColor: 'bg-red-100',
      textColor: 'text-red-600',
      description: 'Total de curtidas'
    },
    {
      id: 'categories',
      title: 'Categorias',
      value: stats.categories.toString(),
      icon: <Tag className="h-6 w-6" />,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-100',
      textColor: 'text-indigo-600',
      description: 'Categorias ativas'
    }
  ];

  const [photos] = useState<Photo[]>([
    {
      id: 'PHO001',
      title: 'Praia de Copacabana',
      description: 'Vista panorâmica da praia de Copacabana no Rio de Janeiro',
      filename: 'copacabana_beach.jpg',
      size: 2.5,
      dimensions: '1920x1080',
      format: 'JPEG',
      category: 'Paisagens',
      tags: ['praia', 'rio de janeiro', 'copacabana', 'paisagem'],
      uploaded_by: 'João Silva',
      uploaded_at: '2024-01-15',
      views: 1250,
      likes: 45,
      downloads: 12,
      status: 'public',
      url: '/photos/copacabana_beach.jpg',
      thumbnail_url: '/thumbnails/copacabana_beach.jpg'
    },
    {
      id: 'PHO002',
      title: 'Cristo Redentor',
      description: 'Monumento do Cristo Redentor no Corcovado',
      filename: 'cristo_redentor.jpg',
      size: 3.2,
      dimensions: '2560x1440',
      format: 'JPEG',
      category: 'Monumentos',
      tags: ['cristo redentor', 'corcovado', 'monumento', 'rio de janeiro'],
      uploaded_by: 'Maria Santos',
      uploaded_at: '2024-01-14',
      views: 2100,
      likes: 78,
      downloads: 25,
      status: 'public',
      url: '/photos/cristo_redentor.jpg',
      thumbnail_url: '/thumbnails/cristo_redentor.jpg'
    },
    {
      id: 'PHO003',
      title: 'Pão de Açúcar',
      description: 'Vista do Pão de Açúcar ao pôr do sol',
      filename: 'pao_acucar_sunset.jpg',
      size: 4.1,
      dimensions: '3840x2160',
      format: 'JPEG',
      category: 'Paisagens',
      tags: ['pão de açúcar', 'pôr do sol', 'rio de janeiro', 'paisagem'],
      uploaded_by: 'Pedro Costa',
      uploaded_at: '2024-01-13',
      views: 890,
      likes: 32,
      downloads: 8,
      status: 'private',
      url: '/photos/pao_acucar_sunset.jpg',
      thumbnail_url: '/thumbnails/pao_acucar_sunset.jpg'
    },
    {
      id: 'PHO004',
      title: 'Escadaria Selarón',
      description: 'Famosa escadaria colorida no centro do Rio',
      filename: 'selaron_steps.jpg',
      size: 2.8,
      dimensions: '1920x1080',
      format: 'JPEG',
      category: 'Arte Urbana',
      tags: ['escadaria selarón', 'arte urbana', 'centro', 'colorido'],
      uploaded_by: 'Ana Oliveira',
      uploaded_at: '2024-01-12',
      views: 1560,
      likes: 67,
      downloads: 18,
      status: 'public',
      url: '/photos/selaron_steps.jpg',
      thumbnail_url: '/thumbnails/selaron_steps.jpg'
    }
  ]);

  const tabs = [
    { id: 'overview', name: 'Visão Geral', icon: BarChart3 },
    { id: 'public', name: 'Públicas', icon: Globe },
    { id: 'private', name: 'Privadas', icon: Lock },
    { id: 'archived', name: 'Arquivadas', icon: Archive },
    { id: 'categories', name: 'Categorias', icon: Tag }
  ];

  const handleCardClick = (cardId: string) => {
    setSelectedPhoto(null);
    setShowModal(true);
    // Aqui você pode implementar lógica específica para cada card
  };

  const handleQuickAction = (action: string) => {
    setSelectedPhoto(null);
    setShowModal(true);
    // Aqui você pode implementar lógica específica para cada ação
  };

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo);
    setShowModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'public':
        return 'bg-green-100 text-green-800';
      case 'private':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'public':
        return 'Pública';
      case 'private':
        return 'Privada';
      case 'archived':
        return 'Arquivada';
      default:
        return 'Desconhecido';
    }
  };

  const formatFileSize = (size: number) => {
    return `${size} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const filteredPhotos = photos.filter(photo => {
    const matchesSearch = photo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         photo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         photo.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         photo.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = selectedFilter === 'all' || photo.status === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationButtons />
      
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestão de Fotos</h1>
              <p className="mt-2 text-gray-600">
                Gerencie sua biblioteca de fotos e organize seu conteúdo visual
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => handleQuickAction('export')}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </button>
              <button
                onClick={() => handleQuickAction('upload')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Upload className="h-4 w-4 mr-2" />
                Enviar Fotos
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {statsCards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105 border border-transparent hover:border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`p-2 ${card.bgColor} rounded-lg`}>
                        <div className={card.textColor}>
                          {card.icon}
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">{card.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                      </div>
                    </div>
                    <div className="text-gray-400 hover:text-gray-600">
                      <span className="text-xs">Clique para detalhes</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-xs text-gray-500">{card.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => handleQuickAction('upload')}
                  className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Upload className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-700">Enviar Fotos</span>
                </button>
                <button
                  onClick={() => handleQuickAction('organize')}
                  className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Folder className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-700">Organizar</span>
                </button>
                <button
                  onClick={() => handleQuickAction('export')}
                  className="flex items-center p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <Download className="w-5 h-5 text-purple-600 mr-2" />
                  <span className="text-sm font-medium text-purple-700">Exportar</span>
                </button>
                <button
                  onClick={() => handleQuickAction('settings')}
                  className="flex items-center p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <Settings className="w-5 h-5 text-orange-600 mr-2" />
                  <span className="text-sm font-medium text-orange-700">Configurações</span>
                </button>
              </div>
            </div>

            {/* Photos Grid */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Fotos Recentes</h3>
                  <div className="flex space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar fotos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <select
                      value={selectedFilter}
                      onChange={(e) => setSelectedFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Todos os Status</option>
                      <option value="public">Públicas</option>
                      <option value="private">Privadas</option>
                      <option value="archived">Arquivadas</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      onClick={() => handlePhotoClick(photo)}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                      <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                        <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                          <ImageIcon className="h-12 w-12 text-white" />
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{photo.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">{photo.category}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(photo.status)}`}>
                            {getStatusText(photo.status)}
                          </span>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span className="flex items-center">
                              <Eye className="h-3 w-3 mr-1" />
                              {photo.views}
                            </span>
                            <span className="flex items-center">
                              <Heart className="h-3 w-3 mr-1" />
                              {photo.likes}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">{formatFileSize(photo.size)}</span>
                          <span className="text-xs text-gray-500">{photo.dimensions}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs content would go here */}
        {activeTab !== 'overview' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {tabs.find(tab => tab.id === activeTab)?.name}
            </h3>
            <p className="text-gray-600">
              Conteúdo específico para a aba {tabs.find(tab => tab.id === activeTab)?.name} será implementado aqui.
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedPhoto ? 'Detalhes da Foto' : 'Ação do Sistema'}
              </h3>
              {selectedPhoto ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Título</p>
                    <p className="text-sm text-gray-900">{selectedPhoto.title}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Descrição</p>
                    <p className="text-sm text-gray-900">{selectedPhoto.description}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Categoria</p>
                    <p className="text-sm text-gray-900">{selectedPhoto.category}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedPhoto.status)}`}>
                      {getStatusText(selectedPhoto.status)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tamanho</p>
                    <p className="text-sm text-gray-900">{formatFileSize(selectedPhoto.size)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Dimensões</p>
                    <p className="text-sm text-gray-900">{selectedPhoto.dimensions}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tags</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedPhoto.tags.map((tag, index) => (
                        <span key={index} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  Funcionalidade em desenvolvimento. Esta ação será implementada em breve.
                </p>
              )}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 