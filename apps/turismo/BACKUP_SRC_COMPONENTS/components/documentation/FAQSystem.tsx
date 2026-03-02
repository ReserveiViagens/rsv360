import React, { useState, useEffect } from 'react';
import { HelpCircle, Search, Plus, Edit, Trash2, ChevronDown, ChevronUp, MessageCircle, ThumbsUp, ThumbsDown, Star, Tag, Clock, User, Eye, Filter } from 'lucide-react';
import { Card, Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger, Input, Select, Modal, Textarea } from '../ui';
import { useUIStore } from '../../stores/useUIStore';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
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
  isExpanded?: boolean;
}

interface FAQCategory {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  icon: string;
  color: string;
}

interface FAQSystemProps {
  onFAQCreated?: (faq: FAQItem) => void;
  onFAQUpdated?: (faq: FAQItem) => void;
  onFAQDeleted?: (id: string) => void;
  onFAQViewed?: (id: string) => void;
}

const FAQSystem: React.FC<FAQSystemProps> = ({
  onFAQCreated,
  onFAQUpdated,
  onFAQDeleted,
  onFAQViewed
}) => {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [selectedFAQ, setSelectedFAQ] = useState<FAQItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState('faqs');
  
  const { showNotification } = useUIStore();

  // Mock data
  useEffect(() => {
    const mockCategories: FAQCategory[] = [
      { id: 'general', name: 'Geral', description: 'Perguntas gerais sobre o sistema', itemCount: 15, icon: 'HelpCircle', color: 'bg-blue-500' },
      { id: 'reservations', name: 'Reservas', description: 'Dúvidas sobre reservas e agendamentos', itemCount: 22, icon: 'Calendar', color: 'bg-green-500' },
      { id: 'payments', name: 'Pagamentos', description: 'Questões relacionadas a pagamentos', itemCount: 18, icon: 'CreditCard', color: 'bg-purple-500' },
      { id: 'technical', name: 'Técnico', description: 'Problemas técnicos e configurações', itemCount: 12, icon: 'Settings', color: 'bg-orange-500' },
      { id: 'account', name: 'Conta', description: 'Gestão de conta e perfil', itemCount: 8, icon: 'User', color: 'bg-indigo-500' }
    ];

    const mockFAQs: FAQItem[] = [
      {
        id: '1',
        question: 'Como criar minha primeira reserva no sistema RSV?',
        answer: 'Para criar sua primeira reserva, siga estes passos:\n\n1. Acesse o menu "Reservas" no painel principal\n2. Clique em "Nova Reserva"\n3. Selecione o pacote de viagem desejado\n4. Escolha as datas de check-in e check-out\n5. Preencha os dados do cliente\n6. Confirme as informações e finalize a reserva\n\nO sistema irá gerar automaticamente um número de confirmação e enviar um email com os detalhes.',
        category: 'reservations',
        tags: ['reserva', 'primeira-vez', 'tutorial'],
        author: 'Equipe RSV',
        createdAt: '2024-01-10',
        updatedAt: '2024-01-20',
        status: 'published',
        helpfulCount: 89,
        notHelpfulCount: 3,
        views: 456,
        priority: 'high'
      },
      {
        id: '2',
        question: 'Quais são as formas de pagamento aceitas?',
        answer: 'O sistema RSV aceita as seguintes formas de pagamento:\n\n• Cartão de crédito (Visa, Mastercard, American Express)\n• Cartão de débito\n• PIX (transferência instantânea)\n• Boleto bancário\n• Transferência bancária\n\nPara pagamentos parcelados, consulte as condições específicas de cada pacote de viagem.',
        category: 'payments',
        tags: ['pagamento', 'cartão', 'pix', 'boleto'],
        author: 'Suporte RSV',
        createdAt: '2024-01-08',
        updatedAt: '2024-01-15',
        status: 'published',
        helpfulCount: 67,
        notHelpfulCount: 2,
        views: 234,
        priority: 'high'
      },
      {
        id: '3',
        question: 'Como alterar minha senha de acesso?',
        answer: 'Para alterar sua senha:\n\n1. Acesse "Configurações" no menu do usuário\n2. Clique em "Segurança"\n3. Selecione "Alterar Senha"\n4. Digite sua senha atual\n5. Digite a nova senha (mínimo 8 caracteres)\n6. Confirme a nova senha\n7. Clique em "Salvar"\n\nA nova senha será aplicada imediatamente.',
        category: 'account',
        tags: ['senha', 'segurança', 'conta'],
        author: 'Admin RSV',
        createdAt: '2024-01-05',
        updatedAt: '2024-01-12',
        status: 'published',
        helpfulCount: 45,
        notHelpfulCount: 1,
        views: 189,
        priority: 'medium'
      },
      {
        id: '4',
        question: 'O que fazer se esquecer minha senha?',
        answer: 'Se você esqueceu sua senha:\n\n1. Na tela de login, clique em "Esqueci minha senha"\n2. Digite seu email cadastrado\n3. Clique em "Enviar link de recuperação"\n4. Verifique seu email e clique no link recebido\n5. Digite uma nova senha\n6. Confirme a nova senha\n\nO link de recuperação é válido por 24 horas.',
        category: 'account',
        tags: ['senha', 'recuperação', 'esqueci'],
        author: 'Suporte RSV',
        createdAt: '2024-01-03',
        updatedAt: '2024-01-10',
        status: 'published',
        helpfulCount: 34,
        notHelpfulCount: 0,
        views: 156,
        priority: 'medium'
      }
    ];

    setCategories(mockCategories);
    setFaqs(mockFAQs);
  }, []);

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesPriority = selectedPriority === 'all' || faq.priority === selectedPriority;
    return matchesSearch && matchesCategory && matchesPriority;
  });

  const handleCreateFAQ = () => {
    setShowCreateModal(true);
  };

  const handleEditFAQ = (faq: FAQItem) => {
    setSelectedFAQ(faq);
    setShowEditModal(true);
  };

  const handleDeleteFAQ = (id: string) => {
    setFaqs(faqs => faqs.filter(faq => faq.id !== id));
    onFAQDeleted?.(id);
    showNotification('FAQ excluída com sucesso!', 'success');
  };

  const handleToggleExpand = (faqId: string) => {
    setFaqs(faqs => faqs.map(faq => ({
      ...faq,
      isExpanded: faq.id === faqId ? !faq.isExpanded : faq.isExpanded
    })));
    
    // Marcar como visualizada
    onFAQViewed?.(faqId);
    setFaqs(faqs => faqs.map(faq => 
      faq.id === faqId ? { ...faq, views: faq.views + 1 } : faq
    ));
  };

  const handleMarkHelpful = (faqId: string, isHelpful: boolean) => {
    setFaqs(faqs => faqs.map(faq => {
      if (faq.id === faqId) {
        return {
          ...faq,
          helpfulCount: isHelpful ? faq.helpfulCount + 1 : faq.helpfulCount,
          notHelpfulCount: !isHelpful ? faq.notHelpfulCount + 1 : faq.notHelpfulCount
        };
      }
      return faq;
    }));
    showNotification(`Feedback registrado com sucesso!`, 'success');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return priority;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sistema de FAQ</h2>
          <p className="text-gray-600">Perguntas frequentes e respostas para usuários</p>
        </div>
        <Button onClick={handleCreateFAQ} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova FAQ
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar perguntas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <option value="all">Todas as Categorias</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name} ({category.itemCount})
            </option>
          ))}
        </Select>
        <Select value={selectedPriority} onValueChange={setSelectedPriority}>
          <option value="all">Todas as Prioridades</option>
          <option value="high">Alta</option>
          <option value="medium">Média</option>
          <option value="low">Baixa</option>
        </Select>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <HelpCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de FAQs</p>
              <p className="text-2xl font-bold text-gray-900">{faqs.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Eye className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Visualizações</p>
              <p className="text-2xl font-bold text-gray-900">
                {faqs.reduce((sum, faq) => sum + faq.views, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ThumbsUp className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Respostas Úteis</p>
              <p className="text-2xl font-bold text-gray-900">
                {faqs.reduce((sum, faq) => sum + faq.helpfulCount, 0)}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Tag className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Categorias</p>
              <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Categorias de FAQ */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Categorias de FAQ</h3>
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
                    <p className="text-xs text-gray-500 mt-1">{category.itemCount} perguntas</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Lista de FAQs */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            FAQs {selectedCategory !== 'all' && `- ${categories.find(c => c.id === selectedCategory)?.name}`}
          </h3>
          
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-8">
              <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhuma FAQ encontrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFAQs.map(faq => {
                const category = categories.find(c => c.id === faq.category);
                return (
                  <div key={faq.id} className="border rounded-lg hover:shadow-md transition-shadow">
                    {/* Pergunta */}
                    <div 
                      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleToggleExpand(faq.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-gray-900">{faq.question}</h4>
                            <Badge variant={faq.status === 'published' ? 'default' : 'secondary'}>
                              {faq.status === 'published' ? 'Publicado' : 
                               faq.status === 'draft' ? 'Rascunho' : 'Arquivado'}
                            </Badge>
                            <Badge className={getPriorityColor(faq.priority)}>
                              {getPriorityLabel(faq.priority)}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {faq.author}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(faq.updatedAt).toLocaleDateString('pt-BR')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {faq.views} visualizações
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-3">
                            {category && (
                              <Badge variant="outline" className="text-xs">
                                {category.name}
                              </Badge>
                            )}
                            {faq.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditFAQ(faq);
                            }}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFAQ(faq.id);
                            }}
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          
                          <div className="text-gray-400">
                            {faq.isExpanded ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Resposta (expandível) */}
                    {faq.isExpanded && (
                      <div className="px-4 pb-4 border-t bg-gray-50">
                        <div className="pt-4">
                          <div className="prose max-w-none">
                            <p className="text-gray-700 whitespace-pre-line">{faq.answer}</p>
                          </div>
                          
                          {/* Feedback */}
                          <div className="flex items-center gap-4 mt-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkHelpful(faq.id, true)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <ThumbsUp className="h-4 w-4" />
                                Útil ({faq.helpfulCount})
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkHelpful(faq.id, false)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <ThumbsDown className="h-4 w-4" />
                                Não Útil ({faq.notHelpfulCount})
                              </Button>
                            </div>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Simular contato com suporte
                                showNotification('Solicitação de contato enviada!', 'success');
                              }}
                              className="flex items-center gap-2"
                            >
                              <MessageCircle className="h-4 w-4" />
                              Contatar Suporte
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Modal de Criação */}
      <Modal open={showCreateModal} onOpenChange={setShowCreateModal}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nova FAQ</h3>
          <div className="space-y-4">
            <Input placeholder="Pergunta" />
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
            </Select>
            <Textarea placeholder="Resposta detalhada" rows={8} />
            <Input placeholder="Tags (separadas por vírgula)" />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancelar
              </Button>
              <Button onClick={() => {
                setShowCreateModal(false);
                showNotification('FAQ criada com sucesso!', 'success');
              }}>
                Criar FAQ
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal de Edição */}
      <Modal open={showEditModal} onOpenChange={setShowEditModal}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Editar FAQ</h3>
          {selectedFAQ && (
            <div className="space-y-4">
              <Input defaultValue={selectedFAQ.question} placeholder="Pergunta" />
              <Select defaultValue={selectedFAQ.category}>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
              <Select defaultValue={selectedFAQ.priority}>
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </Select>
              <Textarea defaultValue={selectedFAQ.answer} placeholder="Resposta detalhada" rows={8} />
              <Input defaultValue={selectedFAQ.tags.join(', ')} placeholder="Tags (separadas por vírgula)" />
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowEditModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => {
                  setShowEditModal(false);
                  showNotification('FAQ atualizada com sucesso!', 'success');
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

export { FAQSystem };
export type { FAQItem, FAQCategory, FAQSystemProps };
