import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { useRouter } from 'next/router';
import { 
  Users, 
  UserPlus, 
  Settings, 
  MessageSquare, 
  Calendar,
  MapPin,
  Phone,
  Mail,
  Plus,
  Edit,
  Trash,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Crown,
  Shield
} from 'lucide-react';

interface Group {
  id: number;
  name: string;
  description: string;
  type: 'family' | 'business' | 'friends' | 'custom';
  max_members: number;
  current_members: number;
  created_by: string;
  created_at: string;
  is_active: boolean;
  privacy: 'public' | 'private' | 'invite_only';
  tags: string[];
  avatar?: string;
}

interface GroupMember {
  id: number;
  user_id: number;
  group_id: number;
  name: string;
  email: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'pending';
}

interface GroupActivity {
  id: number;
  group_id: number;
  type: 'booking' | 'message' | 'member_joined' | 'member_left' | 'event_created';
  description: string;
  user_name: string;
  timestamp: string;
  metadata?: any;
}

export default function GroupsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('my-groups');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Dados simulados - em produção viriam da API
  const [groups] = useState<Group[]>([
    {
      id: 1,
      name: 'Família Silva',
      description: 'Grupo da família para viagens e eventos',
      type: 'family',
      max_members: 20,
      current_members: 8,
      created_by: 'João Silva',
      created_at: '2024-01-15',
      is_active: true,
      privacy: 'private',
      tags: ['família', 'viagens', 'eventos'],
      avatar: '/api/placeholder/40/40'
    },
    {
      id: 2,
      name: 'Empresa TechCorp',
      description: 'Grupo corporativo para viagens de negócios',
      type: 'business',
      max_members: 50,
      current_members: 23,
      created_by: 'Maria Santos',
      created_at: '2024-02-01',
      is_active: true,
      privacy: 'invite_only',
      tags: ['negócios', 'corporativo', 'viagens'],
      avatar: '/api/placeholder/40/40'
    },
    {
      id: 3,
      name: 'Amigos da Faculdade',
      description: 'Grupo de amigos para viagens e encontros',
      type: 'friends',
      max_members: 15,
      current_members: 12,
      created_by: 'Pedro Costa',
      created_at: '2024-01-20',
      is_active: true,
      privacy: 'private',
      tags: ['amigos', 'faculdade', 'encontros'],
      avatar: '/api/placeholder/40/40'
    }
  ]);

  const [groupMembers] = useState<GroupMember[]>([
    {
      id: 1,
      user_id: 1,
      group_id: 1,
      name: 'João Silva',
      email: 'joao@email.com',
      role: 'admin',
      joined_at: '2024-01-15',
      status: 'active',
      avatar: '/api/placeholder/32/32'
    },
    {
      id: 2,
      user_id: 2,
      group_id: 1,
      name: 'Maria Silva',
      email: 'maria@email.com',
      role: 'member',
      joined_at: '2024-01-16',
      status: 'active',
      avatar: '/api/placeholder/32/32'
    }
  ]);

  const [groupActivities] = useState<GroupActivity[]>([
    {
      id: 1,
      group_id: 1,
      type: 'booking',
      description: 'Reserva criada para viagem ao Rio de Janeiro',
      user_name: 'João Silva',
      timestamp: '2024-01-20T10:30:00Z'
    },
    {
      id: 2,
      group_id: 1,
      type: 'member_joined',
      description: 'Maria Silva entrou no grupo',
      user_name: 'Maria Silva',
      timestamp: '2024-01-16T14:20:00Z'
    },
    {
      id: 3,
      group_id: 1,
      type: 'message',
      description: 'Nova mensagem no chat do grupo',
      user_name: 'João Silva',
      timestamp: '2024-01-19T16:45:00Z'
    }
  ]);

  const [stats] = useState({
    total_groups: 3,
    total_members: 43,
    active_groups: 3,
    pending_invites: 5,
    total_bookings: 12,
    average_group_size: 14.3
  });

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const getGroupTypeIcon = (type: string) => {
    switch (type) {
      case 'family': return '👨‍👩‍👧‍👦';
      case 'business': return '💼';
      case 'friends': return '👥';
      default: return '🏷️';
    }
  };

  const getGroupTypeColor = (type: string) => {
    switch (type) {
      case 'family': return 'bg-blue-100 text-blue-800';
      case 'business': return 'bg-green-100 text-green-800';
      case 'friends': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPrivacyIcon = (privacy: string) => {
    switch (privacy) {
      case 'public': return '🌐';
      case 'private': return '🔒';
      case 'invite_only': return '📧';
      default: return '❓';
    }
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <button
                  onClick={handleBackToDashboard}
                  className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  ← Voltar
                </button>
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestão de Grupos</h1>
                    <p className="text-sm text-gray-500">Organize e gerencie grupos de viagem</p>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Grupo
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'my-groups', name: 'Meus Grupos', icon: '👥' },
                { id: 'discover', name: 'Descobrir', icon: '🔍' },
                { id: 'invites', name: 'Convites', icon: '📧' },
                { id: 'analytics', name: 'Analytics', icon: '📊' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'my-groups' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total de Grupos</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total_groups}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <UserPlus className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total de Membros</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total_members}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Calendar className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Reservas em Grupo</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total_bookings}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Settings className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Tamanho Médio</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.average_group_size}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Buscar grupos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todos os tipos</option>
                  <option value="family">Família</option>
                  <option value="business">Negócios</option>
                  <option value="friends">Amigos</option>
                  <option value="custom">Personalizado</option>
                </select>
              </div>

              {/* Groups Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGroups.map((group) => (
                  <div key={group.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-2xl mr-3">
                            {getGroupTypeIcon(group.type)}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`px-2 py-1 text-xs rounded-full ${getGroupTypeColor(group.type)}`}>
                                {group.type}
                              </span>
                              <span className="text-gray-400">{getPrivacyIcon(group.privacy)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4">{group.description}</p>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Membros:</span>
                          <span className="font-medium">{group.current_members}/{group.max_members}</span>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(group.current_members / group.max_members) * 100}%` }}
                          ></div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {group.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                          <span className="text-xs text-gray-500">
                            Criado por {group.created_by}
                          </span>
                          <div className="flex space-x-2">
                            <button className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200 transition-colors">
                              Ver Detalhes
                            </button>
                            <button className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 transition-colors">
                              Chat
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Atividade Recente</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {groupActivities.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                          <div>
                            <p className="font-medium text-gray-900">{activity.description}</p>
                            <p className="text-sm text-gray-500">
                              por {activity.user_name} • {new Date(activity.timestamp).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <span className="text-blue-600 text-sm font-medium">
                          {activity.type === 'booking' && '📅'}
                          {activity.type === 'message' && '💬'}
                          {activity.type === 'member_joined' && '👋'}
                          {activity.type === 'member_left' && '👋'}
                          {activity.type === 'event_created' && '🎉'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'discover' && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Descobrir Grupos</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-500">Funcionalidade em desenvolvimento...</p>
              </div>
            </div>
          )}

          {activeTab === 'invites' && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Convites Pendentes</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-500">Funcionalidade em desenvolvimento...</p>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Analytics de Grupos</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-500">Funcionalidade em desenvolvimento...</p>
              </div>
            </div>
          )}
        </div>

        {/* Create Group Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Criar Novo Grupo</h3>
              <p className="text-gray-500 mb-4">Funcionalidade em desenvolvimento...</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Criar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
} 