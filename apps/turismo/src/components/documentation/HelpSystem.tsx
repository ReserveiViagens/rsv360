import React, { useState, useEffect } from 'react';
import { HelpCircle, Search, MessageCircle, Phone, Mail, FileText, Video, BookOpen, Plus, Edit, Trash2, ExternalLink, Star, Clock, User, Tag, Eye } from 'lucide-react';
import { Card, Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger, Input, Select, Modal, Textarea } from '../ui';
import { useUIStore } from '../../stores/useUIStore';

interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'published' | 'archived';
  helpfulCount: number;
  notHelpfulCount: number;
  views: number;
  priority: 'low' | 'medium' | 'high';
}

interface HelpCategory {
  id: string;
  name: string;
  description: string;
  articleCount: number;
  icon: string;
  color: string;
}

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  userId: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  lastResponse?: string;
}

interface HelpSystemProps {
  onArticleCreated?: (article: HelpArticle) => void;
  onArticleUpdated?: (article: HelpArticle) => void;
  onArticleDeleted?: (id: string) => void;
  onTicketCreated?: (ticket: SupportTicket) => void;
  onTicketUpdated?: (ticket: SupportTicket) => void;
}

const HelpSystem: React.FC<HelpSystemProps> = ({
  onArticleCreated,
  onArticleUpdated,
  onArticleDeleted,
  onTicketCreated,
  onTicketUpdated
}) => {
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [categories, setCategories] = useState<HelpCategory[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCreateArticleModal, setShowCreateArticleModal] = useState(false);
  const [showEditArticleModal, setShowEditArticleModal] = useState(false);
  const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);
  const [showEditTicketModal, setShowEditTicketModal] = useState(false);
  const [activeTab, setActiveTab] = useState('articles');
  
  const { showNotification } = useUIStore();

  // Mock data
  useEffect(() => {
    const mockCategories: HelpCategory[] = [
      { id: 'getting-started', name: 'Primeiros Passos', description: 'Guia para iniciantes', articleCount: 8, icon: 'BookOpen', color: 'bg-blue-500' },
      { id: 'reservations', name: 'Reservas', description: 'Como fazer e gerenciar reservas', articleCount: 12, icon: 'Calendar', color: 'bg-green-500' },
      { id: 'customers', name: 'Clientes', description: 'Gestão de clientes e perfis', articleCount: 6, icon: 'Users', color: 'bg-purple-500' },
      { id: 'payments', name: 'Pagamentos', description: 'Sistema de pagamentos e reembolsos', articleCount: 10, icon: 'CreditCard', color: 'bg-orange-500' },
      { id: 'troubleshooting', name: 'Problemas', description: 'Solução de problemas comuns', articleCount: 15, icon: 'Wrench', color: 'bg-red-500' }
    ];

    const mockArticles: HelpArticle[] = [
      {
        id: '1',
        title: 'Como criar sua primeira reserva',
        content: 'Passo a passo completo para criar sua primeira reserva no sistema RSV...',
        category: 'reservations',
        tags: ['reserva', 'primeira-vez', 'tutorial'],
        author: 'Equipe RSV',
        createdAt: '2024-01-10',
        updatedAt: '2024-01-20',
        status: 'published',
        helpfulCount: 45,
        notHelpfulCount: 2,
        views: 234,
        priority: 'high'
      },
      {
        id: '2',
        title: 'Configurando perfil de cliente',
        content: 'Aprenda a configurar e personalizar perfis de clientes...',
        category: 'customers',
        tags: ['perfil', 'cliente', 'configuração'],
        author: 'Suporte RSV',
        createdAt: '2024-01-08',
        updatedAt: '2024-01-15',
        status: 'published',
        helpfulCount: 32,
        notHelpfulCount: 1,
        views: 156,
        priority: 'medium'
      }
    ];

    const mockTickets: SupportTicket[] = [
      {
        id: '1',
        title: 'Erro ao processar pagamento',
        description: 'Estou recebendo erro 500 ao tentar processar pagamento...',
        category: 'payments',
        priority: 'high',
        status: 'in-progress',
        userId: 'user123',
        assignedTo: 'suporte@rsv.com',
        createdAt: '2024-01-20T10:30:00Z',
        updatedAt: '2024-01-20T14:15:00Z',
        lastResponse: 'Estamos investigando o problema...'
      },
      {
        id: '2',
        title: 'Dúvida sobre relatórios',
        description: 'Como gerar relatório de vendas mensal?',
        category: 'reports',
        priority: 'medium',
        status: 'open',
        userId: 'user456',
        createdAt: '2024-01-20T09:00:00Z',
        updatedAt: '2024-01-20T09:00:00Z'
      }
    ];

    setCategories(mockCategories);
    setArticles(mockArticles);
    setTickets(mockTickets);
  }, []);

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateArticle = () => {
    setShowCreateArticleModal(true);
  };

  const handleEditArticle = (article: HelpArticle) => {
    setSelectedArticle(article);
    setShowEditArticleModal(true);
  };

  const handleDeleteArticle = (id: string) => {
    setArticles(articles => articles.filter(article => article.id !== id));
    onArticleDeleted?.(id);
    showNotification('Artigo excluído com sucesso!', 'success');
  };

  const handleCreateTicket = () => {
    setShowCreateTicketModal(true);
  };

  const handleEditTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setShowEditTicketModal(true);
  };

  const handleMarkHelpful = (articleId: string, isHelpful: boolean) => {
    setArticles(articles => articles.map(article => {
      if (article.id === articleId) {
        return {
          ...article,
          helpfulCount: isHelpful ? article.helpfulCount + 1 : article.helpfulCount,
          notHelpfulCount: !isHelpful ? article.notHelpfulCount + 1 : article.notHelpfulCount
        };
      }
      return article;
    }));
    showNotification(`Feedback registrado com sucesso!`, 'success');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sistema de Ajuda</h2>
          <p className="text-gray-600">Suporte e ajuda para usuários do sistema RSV</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleCreateArticle} variant="outline" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Artigo
          </Button>
          <Button onClick={handleCreateTicket} className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Novo Ticket
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar artigos de ajuda..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <option value="all">Todas as Categorias</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name} ({category.articleCount})
            </option>
          ))}
        </Select>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Artigos de Ajuda</p>
              <p className="text-2xl font-bold text-gray-900">{articles.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <MessageCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tickets Abertos</p>
              <p className="text-2xl font-bold text-gray-900">
                {tickets.filter(t => t.status === 'open' || t.status === 'in-progress').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Star className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Artigos Úteis</p>
              <p className="text-2xl font-bold text-gray-900">
                {articles.reduce((sum, article) => sum + article.helpfulCount, 0)}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Eye className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Visualizações</p>
              <p className="text-2xl font-bold text-gray-900">
                {articles.reduce((sum, article) => sum + article.views, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Categorias de Ajuda */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Categorias de Ajuda</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(category => (
              <div
                key={category.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                  selectedCategory === category.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{category.name}</h4>
                    <p className="text-sm text-gray-600">{category.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{category.articleCount} artigos</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Artigos de Ajuda */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Artigos de Ajuda {selectedCategory !== 'all' && `- ${categories.find(c => c.id === selectedCategory)?.name}`}
          </h3>
          
          {filteredArticles.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum artigo encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredArticles.map(article => {
                const category = categories.find(c => c.id === article.category);
                return (
                  <div key={article.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900">{article.title}</h4>
                          <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                            {article.status === 'published' ? 'Publicado' : 
                             article.status === 'draft' ? 'Rascunho' : 'Arquivado'}
                          </Badge>
                          <Badge className={getPriorityColor(article.priority)}>
                            {article.priority === 'urgent' ? 'Urgente' :
                             article.priority === 'high' ? 'Alta' :
                             article.priority === 'medium' ? 'Média' : 'Baixa'}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{article.content}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {article.author}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(article.updatedAt).toLocaleDateString('pt-BR')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {article.views} visualizações
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-3">
                          {category && (
                            <Badge variant="outline" className="text-xs">
                              {category.name}
                            </Badge>
                          )}
                          {article.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        {/* Feedback */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkHelpful(article.id, true)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Star className="h-4 w-4" />
                              Útil ({article.helpfulCount})
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkHelpful(article.id, false)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Não Útil ({article.notHelpfulCount})
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedArticle(article)}
                          title="Ver Detalhes"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditArticle(article)}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteArticle(article.id)}
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Tickets de Suporte */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tickets de Suporte</h3>
          
          {tickets.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum ticket encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map(ticket => (
                <div key={ticket.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900">{ticket.title}</h4>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority === 'urgent' ? 'Urgente' :
                           ticket.priority === 'high' ? 'Alta' :
                           ticket.priority === 'medium' ? 'Média' : 'Baixa'}
                        </Badge>
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status === 'open' ? 'Aberto' :
                           ticket.status === 'in-progress' ? 'Em Andamento' :
                           ticket.status === 'resolved' ? 'Resolvido' : 'Fechado'}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3">{ticket.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {ticket.userId}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                        {ticket.assignedTo && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Atribuído: {ticket.assignedTo}
                          </span>
                        )}
                      </div>

                      {ticket.lastResponse && (
                        <div className="bg-gray-50 p-3 rounded-lg mb-3">
                          <p className="text-sm text-gray-600">
                            <strong>Última resposta:</strong> {ticket.lastResponse}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditTicket(ticket)}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Modal de Criação de Artigo */}
      <Modal open={showCreateArticleModal} onOpenChange={setShowCreateArticleModal}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Novo Artigo de Ajuda</h3>
          <div className="space-y-4">
            <Input placeholder="Título do artigo" />
            <Select>
              <option value="">Selecionar categoria</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
            <Select>
              <option value="">Selecionar prioridade</option>
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
              <option value="urgent">Urgente</option>
            </Select>
            <Textarea placeholder="Conteúdo do artigo" rows={6} />
            <Input placeholder="Tags (separadas por vírgula)" />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCreateArticleModal(false)}>
                Cancelar
              </Button>
              <Button onClick={() => {
                setShowCreateArticleModal(false);
                showNotification('Artigo criado com sucesso!', 'success');
              }}>
                Criar Artigo
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal de Edição de Artigo */}
      <Modal open={showEditArticleModal} onOpenChange={setShowEditArticleModal}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Editar Artigo</h3>
          {selectedArticle && (
            <div className="space-y-4">
              <Input defaultValue={selectedArticle.title} placeholder="Título do artigo" />
              <Select defaultValue={selectedArticle.category}>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
              <Select defaultValue={selectedArticle.priority}>
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </Select>
              <Textarea defaultValue={selectedArticle.content} placeholder="Conteúdo do artigo" rows={6} />
              <Input defaultValue={selectedArticle.tags.join(', ')} placeholder="Tags (separadas por vírgula)" />
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowEditArticleModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => {
                  setShowEditArticleModal(false);
                  showNotification('Artigo atualizado com sucesso!', 'success');
                }}>
                  Salvar Alterações
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Modal de Criação de Ticket */}
      <Modal open={showCreateTicketModal} onOpenChange={setShowCreateTicketModal}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Novo Ticket de Suporte</h3>
          <div className="space-y-4">
            <Input placeholder="Título do ticket" />
            <Select>
              <option value="">Selecionar categoria</option>
              <option value="technical">Técnico</option>
              <option value="billing">Faturamento</option>
              <option value="feature">Solicitação de Funcionalidade</option>
              <option value="bug">Reportar Bug</option>
            </Select>
            <Select>
              <option value="">Selecionar prioridade</option>
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
              <option value="urgent">Urgente</option>
            </Select>
            <Textarea placeholder="Descrição detalhada do problema" rows={6} />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCreateTicketModal(false)}>
                Cancelar
              </Button>
              <Button onClick={() => {
                setShowCreateTicketModal(false);
                showNotification('Ticket criado com sucesso!', 'success');
              }}>
                Criar Ticket
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal de Edição de Ticket */}
      <Modal open={showEditTicketModal} onOpenChange={setShowEditTicketModal}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Editar Ticket</h3>
          {selectedTicket && (
            <div className="space-y-4">
              <Input defaultValue={selectedTicket.title} placeholder="Título do ticket" />
              <Select defaultValue={selectedTicket.category}>
                <option value="technical">Técnico</option>
                <option value="billing">Faturamento</option>
                <option value="feature">Solicitação de Funcionalidade</option>
                <option value="bug">Reportar Bug</option>
              </Select>
              <Select defaultValue={selectedTicket.priority}>
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </Select>
              <Select defaultValue={selectedTicket.status}>
                <option value="open">Aberto</option>
                <option value="in-progress">Em Andamento</option>
                <option value="resolved">Resolvido</option>
                <option value="closed">Fechado</option>
              </Select>
              <Textarea defaultValue={selectedTicket.description} placeholder="Descrição detalhada do problema" rows={6} />
              <Input placeholder="Resposta do suporte" />
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowEditTicketModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => {
                  setShowEditTicketModal(false);
                  showNotification('Ticket atualizado com sucesso!', 'success');
                }}>
                  Salvar Alterações
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export { HelpSystem };
export type { HelpArticle, HelpCategory, SupportTicket, HelpSystemProps };
