import React, { useState, useEffect, useMemo } from 'react';
import { Share2, Instagram, Facebook, Twitter, Linkedin, Youtube, Plus, Edit, Trash2, RefreshCw, Settings, BarChart3, Users, Eye, Heart, MessageCircle, Share, Calendar, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select, SelectOption } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { cn } from '../../utils/cn';

export interface SocialMediaAccount {
  id: string;
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'youtube' | 'tiktok';
  username: string;
  displayName: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  followers: number;
  lastSync: string;
  accessToken: string;
  refreshToken: string;
  permissions: string[];
  isBusiness: boolean;
  connectedAt: string;
  lastPost: string;
  engagementRate: number;
}

export interface SocialMediaPost {
  id: string;
  platform: string;
  accountId: string;
  content: string;
  media: string[];
  scheduledFor: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  publishedAt?: string;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    reach: number;
  };
  tags: string[];
  location?: string;
  campaignId?: string;
}

export interface SocialMediaIntegrationProps {
  className?: string;
}

const platformOptions: SelectOption[] = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'twitter', label: 'Twitter' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' }
];

const statusOptions: SelectOption[] = [
  { value: 'connected', label: 'Conectado' },
  { value: 'disconnected', label: 'Desconectado' },
  { value: 'error', label: 'Erro' },
  { value: 'pending', label: 'Pendente' }
];

const mockAccounts: SocialMediaAccount[] = [
  {
    id: '1',
    platform: 'instagram',
    username: '@rsv_travel',
    displayName: 'RSV Travel',
    status: 'connected',
    followers: 12500,
    lastSync: '2024-08-04T10:30:00Z',
    accessToken: 'ig_token_123',
    refreshToken: 'ig_refresh_123',
    permissions: ['read', 'write', 'manage'],
    isBusiness: true,
    connectedAt: '2024-01-15T09:00:00Z',
    lastPost: '2024-08-04T08:00:00Z',
    engagementRate: 8.5
  },
  {
    id: '2',
    platform: 'facebook',
    username: 'RSV Travel Agency',
    displayName: 'RSV Travel Agency',
    status: 'connected',
    followers: 18900,
    lastSync: '2024-08-04T10:25:00Z',
    accessToken: 'fb_token_456',
    refreshToken: 'fb_refresh_456',
    permissions: ['read', 'write', 'manage', 'ads'],
    isBusiness: true,
    connectedAt: '2024-01-10T14:30:00Z',
    lastPost: '2024-08-03T16:00:00Z',
    engagementRate: 6.2
  },
  {
    id: '3',
    platform: 'twitter',
    username: '@RSVTravel',
    displayName: 'RSV Travel',
    status: 'connected',
    followers: 8200,
    lastSync: '2024-08-04T10:20:00Z',
    accessToken: 'tw_token_789',
    refreshToken: 'tw_refresh_789',
    permissions: ['read', 'write'],
    isBusiness: false,
    connectedAt: '2024-02-05T11:15:00Z',
    lastPost: '2024-08-02T12:00:00Z',
    engagementRate: 4.8
  },
  {
    id: '4',
    platform: 'linkedin',
    username: 'rsv-travel-agency',
    displayName: 'RSV Travel Agency',
    status: 'error',
    followers: 6500,
    lastSync: '2024-08-03T15:45:00Z',
    accessToken: 'li_token_101',
    refreshToken: 'li_refresh_101',
    permissions: ['read', 'write'],
    isBusiness: true,
    connectedAt: '2024-01-20T13:45:00Z',
    lastPost: '2024-08-01T10:00:00Z',
    engagementRate: 7.1
  }
];

const mockPosts: SocialMediaPost[] = [
  {
    id: '1',
    platform: 'instagram',
    accountId: '1',
    content: '🌴 Destino dos sonhos: Maldives! Que tal uma viagem inesquecível? #Maldives #Travel #Dreams #RSVTravel',
    media: ['maldives_beach.jpg', 'maldives_resort.jpg'],
    scheduledFor: '2024-08-05T10:00:00Z',
    status: 'scheduled',
    engagement: { likes: 0, comments: 0, shares: 0, saves: 0, reach: 0 },
    tags: ['Maldives', 'Travel', 'Dreams', 'RSVTravel'],
    location: 'Maldives'
  },
  {
    id: '2',
    platform: 'facebook',
    accountId: '2',
    content: '🎉 Black Friday chegando! Prepare-se para as melhores ofertas em pacotes de viagem! #BlackFriday #Travel #Ofertas #RSVTravel',
    media: ['black_friday_banner.jpg'],
    scheduledFor: '2024-08-06T09:00:00Z',
    status: 'scheduled',
    engagement: { likes: 0, comments: 0, shares: 0, saves: 0, reach: 0 },
    tags: ['BlackFriday', 'Travel', 'Ofertas', 'RSVTravel']
  },
  {
    id: '3',
    platform: 'instagram',
    accountId: '1',
    content: '✨ Dicas de viagem: Como economizar em suas férias! Swipe para ver mais! #TravelTips #Economia #Viagem #RSVTravel',
    media: ['travel_tips_1.jpg', 'travel_tips_2.jpg', 'travel_tips_3.jpg'],
    scheduledFor: '2024-08-04T08:00:00Z',
    status: 'published',
    publishedAt: '2024-08-04T08:00:00Z',
    engagement: { likes: 156, comments: 23, shares: 12, saves: 45, reach: 3200 },
    tags: ['TravelTips', 'Economia', 'Viagem', 'RSVTravel']
  }
];

const SocialMediaIntegration: React.FC<SocialMediaIntegrationProps> = ({ className }) => {
  const [accounts, setAccounts] = useState<SocialMediaAccount[]>(mockAccounts);
  const [posts, setPosts] = useState<SocialMediaPost[]>(mockPosts);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<SocialMediaAccount | null>(null);
  const [selectedPost, setSelectedPost] = useState<SocialMediaPost | null>(null);
  const [activeTab, setActiveTab] = useState('accounts');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const connectedAccounts = useMemo(() => accounts.filter(acc => acc.status === 'connected'), [accounts]);
  const totalFollowers = useMemo(() => connectedAccounts.reduce((acc, account) => acc + account.followers, 0), [connectedAccounts]);
  const averageEngagement = useMemo(() => {
    const connected = connectedAccounts.filter(acc => acc.status === 'connected');
    return connected.length > 0 ? connected.reduce((acc, account) => acc + account.engagementRate, 0) / connected.length : 0;
  }, [connectedAccounts]);

  const handleConnectAccount = () => {
    setIsConnectModalOpen(true);
  };

  const handleCreatePost = () => {
    setIsPostModalOpen(true);
  };

  const handleEditAccount = (account: SocialMediaAccount) => {
    setSelectedAccount(account);
    setIsSettingsModalOpen(true);
  };

  const handleDisconnectAccount = (account: SocialMediaAccount) => {
    setAccounts(prev => prev.map(acc => 
      acc.id === account.id ? { ...acc, status: 'disconnected' as const } : acc
    ));
  };

  const handleRefreshAccount = (account: SocialMediaAccount) => {
    setAccounts(prev => prev.map(acc => 
      acc.id === account.id ? { ...acc, lastSync: new Date().toISOString() } : acc
    ));
  };

  const handleDeletePost = (post: SocialMediaPost) => {
    setPosts(prev => prev.filter(p => p.id !== post.id));
  };

  const getPlatformIcon = (platform: string) => {
    const icons = {
      instagram: Instagram,
      facebook: Facebook,
      twitter: Twitter,
      linkedin: Linkedin,
      youtube: Youtube,
      tiktok: Share2
    };
    return icons[platform as keyof typeof icons] || Share2;
  };

  const getPlatformColor = (platform: string) => {
    const colors = {
      instagram: 'text-pink-600',
      facebook: 'text-blue-600',
      twitter: 'text-blue-400',
      linkedin: 'text-blue-700',
      youtube: 'text-red-600',
      tiktok: 'text-black'
    };
    return colors[platform as keyof typeof colors] || 'text-gray-600';
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      connected: 'success',
      disconnected: 'secondary',
      error: 'error',
      pending: 'warning'
    } as const;
    return <Badge variant={variants[status as keyof typeof variants]}>{statusOptions.find(s => s.value === status)?.label}</Badge>;
  };

  const getPostStatusBadge = (status: string) => {
    const variants = {
      draft: 'secondary',
      scheduled: 'warning',
      published: 'success',
      failed: 'error'
    } as const;
    const labels = {
      draft: 'Rascunho',
      scheduled: 'Agendado',
      published: 'Publicado',
      failed: 'Falhou'
    };
    return <Badge variant={variants[status as keyof typeof variants]}>{labels[status as keyof typeof labels]}</Badge>;
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Integração com Redes Sociais</h2>
          <p className="text-gray-600">Gerencie suas contas e publicações nas redes sociais</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleConnectAccount} variant="outline" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Conectar Conta
          </Button>
          <Button onClick={handleCreatePost} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nova Publicação
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Contas Conectadas</p>
              <p className="text-2xl font-bold text-gray-900">{connectedAccounts.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Share2 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Seguidores</p>
              <p className="text-2xl font-bold text-gray-900">{totalFollowers.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Engajamento Médio</p>
              <p className="text-2xl font-bold text-gray-900">{averageEngagement.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Heart className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Publicações</p>
              <p className="text-2xl font-bold text-gray-900">{posts.length}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-14">
            <TabsTrigger value="accounts" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Contas Conectadas
            </TabsTrigger>
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Publicações
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="accounts" className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accounts.map((account) => {
                  const IconComponent = getPlatformIcon(account.platform);
                  return (
                    <Card key={account.id} className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-full bg-gray-100 ${getPlatformColor(account.platform)}`}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(account.status)}
                        </div>
                      </div>

                      <div className="mb-4">
                        <h3 className="font-semibold text-gray-900 mb-1">{account.displayName}</h3>
                        <p className="text-sm text-gray-600">{account.username}</p>
                        <p className="text-xs text-gray-500 capitalize">{account.platform}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <p className="text-gray-600">Seguidores</p>
                          <p className="font-semibold text-gray-900">{account.followers.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Engajamento</p>
                          <p className="font-semibold text-gray-900">{account.engagementRate}%</p>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 mb-4">
                        <p>Última sincronização: {new Date(account.lastSync).toLocaleDateString('pt-BR')}</p>
                        <p>Conectado em: {new Date(account.connectedAt).toLocaleDateString('pt-BR')}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditAccount(account)}
                          title="Configurações"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRefreshAccount(account)}
                          title="Sincronizar"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDisconnectAccount(account)}
                          title="Desconectar"
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="posts" className="p-6">
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Publicação</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Plataforma</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Agendamento</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Engajamento</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post) => (
                      <tr key={post.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="max-w-xs">
                            <p className="font-medium text-gray-900 text-sm line-clamp-2">{post.content}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {post.media.length} mídia(s) • {post.tags.length} tag(s)
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            {React.createElement(getPlatformIcon(post.platform), { className: `w-4 h-4 ${getPlatformColor(post.platform)}` })}
                            <span className="text-sm text-gray-700 capitalize">{post.platform}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {getPostStatusBadge(post.status)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-gray-700">
                            {post.status === 'published' ? (
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span>{new Date(post.publishedAt!).toLocaleDateString('pt-BR')}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span>{new Date(post.scheduledFor).toLocaleDateString('pt-BR')}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {post.status === 'published' ? (
                            <div className="space-y-1 text-xs">
                              <div className="flex items-center justify-between">
                                <span>❤️ {post.engagement.likes}</span>
                                <span>💬 {post.engagement.comments}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>🔄 {post.engagement.shares}</span>
                                <span>👁️ {post.engagement.reach}</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              title="Visualizar"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeletePost(post)}
                              title="Excluir"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="p-6">
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Analytics de Redes Sociais
              </h3>
              <p className="text-gray-600 mb-6">
                Análises detalhadas de performance e engajamento
              </p>
              <div className="flex justify-center gap-3">
                <Button variant="outline">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Ver Métricas
                </Button>
                <Button variant="outline">
                  <Share className="w-4 h-4 mr-2" />
                  Exportar Relatórios
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Connect Account Modal */}
      <Modal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        title="Conectar Conta de Rede Social"
        size="lg"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Plataforma</label>
            <Select placeholder="Selecione a plataforma">
              {platformOptions.map(option => (
                <SelectOption key={option.value} value={option.value}>
                  {option.label}
                </SelectOption>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome de Exibição</label>
            <Input placeholder="Ex: RSV Travel Agency" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Conta</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="radio" name="accountType" value="personal" className="mr-2" />
                Conta Pessoal
              </label>
              <label className="flex items-center">
                <input type="radio" name="accountType" value="business" className="mr-2" />
                Conta Empresarial
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Permissões</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                Ler conteúdo
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                Publicar conteúdo
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                Gerenciar anúncios
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsConnectModalOpen(false)}>
              Cancelar
            </Button>
            <Button>
              Conectar Conta
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Post Modal */}
      <Modal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        title="Nova Publicação"
        size="lg"
      >
        <div className="space-y-6">
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">Conteúdo</TabsTrigger>
              <TabsTrigger value="media">Mídia</TabsTrigger>
              <TabsTrigger value="schedule">Agendamento</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contas</label>
                <Select placeholder="Selecione as contas">
                  {connectedAccounts.map(account => (
                    <SelectOption key={account.id} value={account.id}>
                      {account.displayName} ({account.platform})
                    </SelectOption>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Conteúdo</label>
                <textarea
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite o conteúdo da publicação..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <Input placeholder="Ex: #Travel #Vacation #RSVTravel" />
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Adicionar Mídia</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input type="file" multiple className="hidden" id="media-upload" />
                  <label htmlFor="media-upload" className="cursor-pointer">
                    <div className="text-gray-600">
                      <Plus className="w-8 h-8 mx-auto mb-2" />
                      <p>Clique para selecionar arquivos</p>
                      <p className="text-sm">PNG, JPG, MP4 até 10MB</p>
                    </div>
                  </label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data e Hora</label>
                <Input type="datetime-local" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fuso Horário</label>
                <Select placeholder="Selecione o fuso horário">
                  <SelectOption value="utc-3">UTC-3 (Brasília)</SelectOption>
                  <SelectOption value="utc-4">UTC-4 (Manaus)</SelectOption>
                  <SelectOption value="utc-5">UTC-5 (Acre)</SelectOption>
                </Select>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsPostModalOpen(false)}>
              Cancelar
            </Button>
            <Button>
              Agendar Publicação
            </Button>
          </div>
        </div>
      </Modal>

      {/* Settings Modal */}
      <Modal
        isOpen={isSettingsModalOpen}
        onClose={() => {
          setIsSettingsModalOpen(false);
          setSelectedAccount(null);
        }}
        title="Configurações da Conta"
        size="lg"
      >
        {selectedAccount && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plataforma</label>
                <p className="text-gray-900 capitalize">{selectedAccount.platform}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <div className="mt-1">{getStatusBadge(selectedAccount.status)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seguidores</label>
                <p className="text-gray-900">{selectedAccount.followers.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Engajamento</label>
                <p className="text-gray-900">{selectedAccount.engagementRate}%</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Permissões</h4>
              <div className="space-y-2">
                {selectedAccount.permissions.map(permission => (
                  <div key={permission} className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-sm text-gray-700 capitalize">{permission}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => {
                setIsSettingsModalOpen(false);
                setSelectedAccount(null);
              }}>
                Fechar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export { SocialMediaIntegration };
export type { SocialMediaAccount, SocialMediaPost, SocialMediaIntegrationProps };
