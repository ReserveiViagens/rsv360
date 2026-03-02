import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Video,
  Play,
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
  Folder,
  FileText,
  Music,
  Archive,
  BookOpen,
  Bookmark,
  Clock,
  Volume2,
  VolumeX,
  Volume1,
  Volume
} from 'lucide-react';
import NavigationButtons from '../components/NavigationButtons';

interface Video {
  id: string;
  title: string;
  description: string;
  filename: string;
  size: number;
  duration: string;
  resolution: string;
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
  quality: 'HD' | '4K' | '1080p' | '720p';
}

export default function VideosPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  // Dados simulados
  const [stats] = useState({
    total_videos: 856,
    public_videos: 720,
    private_videos: 120,
    archived_videos: 16,
    total_size: '15.2 GB',
    average_size: '18.2 MB',
    total_views: 125000,
    total_likes: 3200,
    total_downloads: 450,
    categories: 12,
    total_duration: '45h 30m'
  });

  // Cards clicáveis de estatísticas
  const statsCards = [
    {
      id: 'total_videos',
      title: 'Total de Vídeos',
      value: stats.total_videos.toString(),
      icon: <Video className="h-6 w-6" />,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      description: 'Vídeos no sistema'
    },
    {
      id: 'public_videos',
      title: 'Públicos',
      value: stats.public_videos.toString(),
      icon: <Globe className="h-6 w-6" />,
      color: 'bg-green-500',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      description: 'Vídeos públicos'
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
      id: 'total_duration',
      title: 'Duração Total',
      value: stats.total_duration,
      icon: <Clock className="h-6 w-6" />,
      color: 'bg-red-500',
      bgColor: 'bg-red-100',
      textColor: 'text-red-600',
      description: 'Tempo total de vídeos'
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

  const [videos] = useState<Video[]>([
    {
      id: 'VID001',
      title: 'Tour pelo Rio de Janeiro',
      description: 'Vídeo completo mostrando os principais pontos turísticos do Rio de Janeiro',
      filename: 'rio_tour.mp4',
      size: 45.2,
      duration: '12:30',
      resolution: '1920x1080',
      format: 'MP4',
      category: 'Turismo',
      tags: ['rio de janeiro', 'turismo', 'tour', 'paisagens'],
      uploaded_by: 'João Silva',
      uploaded_at: '2024-01-15',
      views: 2500,
      likes: 89,
      downloads: 23,
      status: 'public',
      url: '/videos/rio_tour.mp4',
      thumbnail_url: '/thumbnails/rio_tour.jpg',
      quality: 'HD'
    },
    {
      id: 'VID002',
      title: 'Guia Copacabana',
      description: 'Guia completo sobre a praia de Copacabana e arredores',
      filename: 'copacabana_guide.mp4',
      size: 32.8,
      duration: '08:45',
      resolution: '1920x1080',
      format: 'MP4',
      category: 'Guias',
      tags: ['copacabana', 'praia', 'guia', 'rio de janeiro'],
      uploaded_by: 'Maria Santos',
      uploaded_at: '2024-01-14',
      views: 1800,
      likes: 67,
      downloads: 15,
      status: 'public',
      url: '/videos/copacabana_guide.mp4',
      thumbnail_url: '/thumbnails/copacabana_guide.jpg',
      quality: 'HD'
    },
    {
      id: 'VID003',
      title: 'Cristo Redentor 4K',
      description: 'Vídeo em alta qualidade do Cristo Redentor',
      filename: 'cristo_4k.mp4',
      size: 125.6,
      duration: '05:20',
      resolution: '3840x2160',
      format: 'MP4',
      category: 'Monumentos',
      tags: ['cristo redentor', '4k', 'monumento', 'corcovado'],
      uploaded_by: 'Pedro Costa',
      uploaded_at: '2024-01-13',
      views: 3200,
      likes: 145,
      downloads: 45,
      status: 'private',
      url: '/videos/cristo_4k.mp4',
      thumbnail_url: '/thumbnails/cristo_4k.jpg',
      quality: '4K'
    },
    {
      id: 'VID004',
      title: 'Pão de Açúcar Sunset',
      description: 'Pôr do sol no Pão de Açúcar em timelapse',
      filename: 'pao_sunset_timelapse.mp4',
      size: 28.4,
      duration: '03:15',
      resolution: '1920x1080',
      format: 'MP4',
      category: 'Paisagens',
      tags: ['pão de açúcar', 'pôr do sol', 'timelapse', 'paisagem'],
      uploaded_by: 'Ana Oliveira',
      uploaded_at: '2024-01-12',
      views: 1200,
      likes: 78,
      downloads: 12,
      status: 'public',
      url: '/videos/pao_sunset_timelapse.mp4',
      thumbnail_url: '/thumbnails/pao_sunset_timelapse.jpg',
      quality: 'HD'
    }
  ]);

  const tabs = [
    { id: 'overview', name: 'Visão Geral', icon: BarChart3 },
    { id: 'public', name: 'Públicos', icon: Globe },
    { id: 'private', name: 'Privados', icon: Lock },
    { id: 'archived', name: 'Arquivados', icon: Archive },
    { id: 'categories', name: 'Categorias', icon: Tag }
  ];

  const handleCardClick = (cardId: string) => {
    setSelectedVideo(null);
    setShowModal(true);
    // Aqui você pode implementar lógica específica para cada card
  };

  const handleQuickAction = (action: string) => {
    setSelectedVideo(null);
    setShowModal(true);
    // Aqui você pode implementar lógica específica para cada ação
  };

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
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
        return 'Público';
      case 'private':
        return 'Privado';
      case 'archived':
        return 'Arquivado';
      default:
        return 'Desconhecido';
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case '4K':
        return 'bg-purple-100 text-purple-800';
      case 'HD':
        return 'bg-blue-100 text-blue-800';
      case '1080p':
        return 'bg-green-100 text-green-800';
      case '720p':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (size: number) => {
    return `${size} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = selectedFilter === 'all' || video.status === selectedFilter;
    
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
              <h1 className="text-3xl font-bold text-gray-900">Gestão de Vídeos</h1>
              <p className="mt-2 text-gray-600">
                Gerencie sua biblioteca de vídeos e organize seu conteúdo audiovisual
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
                Enviar Vídeo
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
                  <span className="text-sm font-medium text-blue-700">Enviar Vídeo</span>
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

            {/* Videos Grid */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Vídeos Recentes</h3>
                  <div className="flex space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar vídeos..."
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
                      <option value="public">Públicos</option>
                      <option value="private">Privados</option>
                      <option value="archived">Arquivados</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredVideos.map((video) => (
                    <div
                      key={video.id}
                      onClick={() => handleVideoClick(video)}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                      <div className="aspect-w-16 aspect-h-9 bg-gray-200 relative">
                        <div className="w-full h-48 bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center">
                          <Play className="h-12 w-12 text-white" />
                        </div>
                        <div className="absolute top-2 right-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getQualityColor(video.quality)}`}>
                            {video.quality}
                          </span>
                        </div>
                        <div className="absolute bottom-2 left-2">
                          <span className="bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                            {video.duration}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{video.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">{video.category}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(video.status)}`}>
                            {getStatusText(video.status)}
                          </span>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span className="flex items-center">
                              <Eye className="h-3 w-3 mr-1" />
                              {video.views}
                            </span>
                            <span className="flex items-center">
                              <Heart className="h-3 w-3 mr-1" />
                              {video.likes}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">{formatFileSize(video.size)}</span>
                          <span className="text-xs text-gray-500">{video.resolution}</span>
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
                {selectedVideo ? 'Detalhes do Vídeo' : 'Ação do Sistema'}
              </h3>
              {selectedVideo ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Título</p>
                    <p className="text-sm text-gray-900">{selectedVideo.title}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Descrição</p>
                    <p className="text-sm text-gray-900">{selectedVideo.description}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Categoria</p>
                    <p className="text-sm text-gray-900">{selectedVideo.category}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedVideo.status)}`}>
                      {getStatusText(selectedVideo.status)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Qualidade</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getQualityColor(selectedVideo.quality)}`}>
                      {selectedVideo.quality}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Duração</p>
                    <p className="text-sm text-gray-900">{selectedVideo.duration}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tamanho</p>
                    <p className="text-sm text-gray-900">{formatFileSize(selectedVideo.size)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Resolução</p>
                    <p className="text-sm text-gray-900">{selectedVideo.resolution}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tags</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedVideo.tags.map((tag, index) => (
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