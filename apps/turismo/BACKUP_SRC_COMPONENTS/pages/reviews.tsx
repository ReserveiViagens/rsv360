import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
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
  Bell,
  Lock,
  Unlock,
  Key,
  UserCheck,
  Users,
  UserPlus,
  UserX,
  Clock,
  Volume2,
  VolumeX,
  Volume1,
  Volume,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus as PlusIcon
} from 'lucide-react';
import NavigationButtons from '../components/NavigationButtons';

interface Review {
  id: string;
  customer_name: string;
  customer_email: string;
  product_service: string;
  rating: number;
  title: string;
  comment: string;
  status: 'pending' | 'approved' | 'rejected' | 'featured';
  created_at: string;
  updated_at: string;
  helpful_votes: number;
  unhelpful_votes: number;
  verified_purchase: boolean;
  category: string;
  tags: string[];
  images: string[];
  response?: string;
  response_date?: string;
}

export default function ReviewsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  // Dados simulados
  const [stats] = useState({
    total_reviews: 2847,
    pending_reviews: 156,
    approved_reviews: 2456,
    rejected_reviews: 89,
    featured_reviews: 146,
    average_rating: 4.3,
    total_ratings: 12500,
    five_star_ratings: 8500,
    four_star_ratings: 2800,
    three_star_ratings: 800,
    two_star_ratings: 300,
    one_star_ratings: 100,
    helpful_votes: 12500,
    response_rate: 78.5
  });

  // Cards clicáveis de estatísticas
  const statsCards = [
    {
      id: 'total_reviews',
      title: 'Total de Avaliações',
      value: stats.total_reviews.toString(),
      icon: <Star className="h-6 w-6" />,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      description: 'Avaliações no sistema'
    },
    {
      id: 'average_rating',
      title: 'Avaliação Média',
      value: stats.average_rating.toString(),
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'bg-green-500',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      description: 'Nota média geral'
    },
    {
      id: 'pending_reviews',
      title: 'Pendentes',
      value: stats.pending_reviews.toString(),
      icon: <Clock className="h-6 w-6" />,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
      description: 'Aguardando aprovação'
    },
    {
      id: 'featured_reviews',
      title: 'Destaques',
      value: stats.featured_reviews.toString(),
      icon: <Award className="h-6 w-6" />,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      description: 'Avaliações em destaque'
    },
    {
      id: 'response_rate',
      title: 'Taxa de Resposta',
      value: `${stats.response_rate}%`,
      icon: <MessageSquare className="h-6 w-6" />,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600',
      description: 'Respostas aos clientes'
    },
    {
      id: 'helpful_votes',
      title: 'Votos Úteis',
      value: stats.helpful_votes.toLocaleString(),
      icon: <ThumbsUp className="h-6 w-6" />,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-100',
      textColor: 'text-indigo-600',
      description: 'Votos positivos'
    }
  ];

  const [reviews] = useState<Review[]>([
    {
      id: 'REV001',
      customer_name: 'João Silva',
      customer_email: 'joao.silva@email.com',
      product_service: 'Pacote Paris Premium',
      rating: 5,
      title: 'Experiência incrível!',
      comment: 'O pacote superou todas as expectativas. Hotel excelente, passeios organizados e guia muito profissional. Recomendo fortemente!',
      status: 'approved',
      created_at: '2024-01-15',
      updated_at: '2024-01-16',
      helpful_votes: 45,
      unhelpful_votes: 2,
      verified_purchase: true,
      category: 'Viagens Internacionais',
      tags: ['paris', 'premium', 'hotel', 'passeios'],
      images: ['review_photo_1.jpg', 'review_photo_2.jpg'],
      response: 'Obrigado pelo feedback positivo! Ficamos felizes em saber que sua experiência foi excelente.',
      response_date: '2024-01-16'
    },
    {
      id: 'REV002',
      customer_name: 'Maria Santos',
      customer_email: 'maria.santos@email.com',
      product_service: 'Ingresso Disney',
      rating: 4,
      title: 'Bom, mas poderia melhorar',
      comment: 'O ingresso funcionou perfeitamente, mas a fila estava muito grande. A experiência foi boa, mas esperava menos tempo de espera.',
      status: 'approved',
      created_at: '2024-01-14',
      updated_at: '2024-01-15',
      helpful_votes: 23,
      unhelpful_votes: 5,
      verified_purchase: true,
      category: 'Ingressos',
      tags: ['disney', 'ingresso', 'fila', 'espera'],
      images: ['review_photo_3.jpg']
    },
    {
      id: 'REV003',
      customer_name: 'Pedro Costa',
      customer_email: 'pedro.costa@email.com',
      product_service: 'Hotel Copacabana Palace',
      rating: 5,
      title: 'Hotel de luxo!',
      comment: 'Hospedagem perfeita! Quarto espaçoso, vista para o mar, serviço impecável. Valeu cada centavo investido.',
      status: 'featured',
      created_at: '2024-01-13',
      updated_at: '2024-01-14',
      helpful_votes: 67,
      unhelpful_votes: 1,
      verified_purchase: true,
      category: 'Hospedagem',
      tags: ['hotel', 'luxo', 'copacabana', 'vista'],
      images: ['review_photo_4.jpg', 'review_photo_5.jpg', 'review_photo_6.jpg'],
      response: 'Obrigado por escolher o Copacabana Palace! Sua satisfação é nossa prioridade.',
      response_date: '2024-01-14'
    },
    {
      id: 'REV004',
      customer_name: 'Ana Oliveira',
      customer_email: 'ana.oliveira@email.com',
      product_service: 'Passeio de Helicóptero',
      rating: 3,
      title: 'Experiência mediana',
      comment: 'O passeio foi interessante, mas muito curto para o preço cobrado. A vista é bonita, mas esperava mais tempo de voo.',
      status: 'pending',
      created_at: '2024-01-12',
      updated_at: '2024-01-12',
      helpful_votes: 12,
      unhelpful_votes: 8,
      verified_purchase: true,
      category: 'Passeios',
      tags: ['helicóptero', 'voo', 'vista', 'curto'],
      images: ['review_photo_7.jpg']
    }
  ]);

  const tabs = [
    { id: 'overview', name: 'Visão Geral', icon: BarChart3 },
    { id: 'pending', name: 'Pendentes', icon: Clock },
    { id: 'approved', name: 'Aprovadas', icon: CheckCircle },
    { id: 'rejected', name: 'Rejeitadas', icon: XCircle },
    { id: 'featured', name: 'Destaques', icon: Award }
  ];

  const handleCardClick = (cardId: string) => {
    setSelectedReview(null);
    setShowModal(true);
    // Aqui você pode implementar lógica específica para cada card
  };

  const handleQuickAction = (action: string) => {
    setSelectedReview(null);
    setShowModal(true);
    // Aqui você pode implementar lógica específica para cada ação
  };

  const handleReviewClick = (review: Review) => {
    setSelectedReview(review);
    setShowModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'featured':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'approved':
        return 'Aprovada';
      case 'rejected':
        return 'Rejeitada';
      case 'featured':
        return 'Destaque';
      default:
        return 'Desconhecido';
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.product_service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.comment.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || review.status === selectedFilter;
    
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
              <h1 className="text-3xl font-bold text-gray-900">Gestão de Avaliações</h1>
              <p className="mt-2 text-gray-600">
                Gerencie avaliações de clientes e monitore a satisfação
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
                onClick={() => handleQuickAction('new')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Avaliação
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
                  onClick={() => handleQuickAction('approve')}
                  className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-700">Aprovar Lote</span>
                </button>
                <button
                  onClick={() => handleQuickAction('reject')}
                  className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <XCircle className="w-5 h-5 text-red-600 mr-2" />
                  <span className="text-sm font-medium text-red-700">Rejeitar Lote</span>
                </button>
                <button
                  onClick={() => handleQuickAction('feature')}
                  className="flex items-center p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <Award className="w-5 h-5 text-purple-600 mr-2" />
                  <span className="text-sm font-medium text-purple-700">Destacar</span>
                </button>
                <button
                  onClick={() => handleQuickAction('respond')}
                  className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <MessageSquare className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-700">Responder</span>
                </button>
              </div>
            </div>

            {/* Reviews List */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Avaliações Recentes</h3>
                  <div className="flex space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar avaliações..."
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
                      <option value="pending">Pendentes</option>
                      <option value="approved">Aprovadas</option>
                      <option value="rejected">Rejeitadas</option>
                      <option value="featured">Destaques</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produto/Serviço
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avaliação
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredReviews.map((review) => (
                      <tr key={review.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleReviewClick(review)}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{review.customer_name}</div>
                            <div className="text-sm text-gray-500">{review.customer_email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {review.product_service}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {renderStars(review.rating)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(review.status)}`}>
                            {getStatusText(review.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(review.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <XCircle className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                {selectedReview ? 'Detalhes da Avaliação' : 'Ação do Sistema'}
              </h3>
              {selectedReview ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Cliente</p>
                    <p className="text-sm text-gray-900">{selectedReview.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Produto/Serviço</p>
                    <p className="text-sm text-gray-900">{selectedReview.product_service}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Avaliação</p>
                    {renderStars(selectedReview.rating)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Título</p>
                    <p className="text-sm text-gray-900">{selectedReview.title}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Comentário</p>
                    <p className="text-sm text-gray-900">{selectedReview.comment}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedReview.status)}`}>
                      {getStatusText(selectedReview.status)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Votos Úteis</p>
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center text-green-600">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        {selectedReview.helpful_votes}
                      </span>
                      <span className="flex items-center text-red-600">
                        <ThumbsDown className="h-4 w-4 mr-1" />
                        {selectedReview.unhelpful_votes}
                      </span>
                    </div>
                  </div>
                  {selectedReview.response && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Resposta</p>
                      <p className="text-sm text-gray-900">{selectedReview.response}</p>
                    </div>
                  )}
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