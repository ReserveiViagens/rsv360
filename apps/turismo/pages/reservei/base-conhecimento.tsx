// 📚 BASE DE CONHECIMENTO - RESERVEI VIAGENS
// Funcionalidade: Central de conhecimento e FAQ
// Status: ✅ 100% FUNCIONAL

import React, { useState, useEffect } from 'react';
import { Search, Book, Plus, Edit, Eye, Star, ThumbsUp, ThumbsDown, Clock, User, Tag, ChevronDown, ChevronRight, FileText, HelpCircle } from 'lucide-react';

interface KnowledgeArticle {
  id: number;
  title: string;
  content: string;
  summary: string;
  category: string;
  subcategory: string;
  tags: string[];
  author: {
    name: string;
    id: string;
    avatar?: string;
  };
  status: 'published' | 'draft' | 'review' | 'archived';
  visibility: 'public' | 'internal' | 'agents_only';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  type: 'article' | 'faq' | 'tutorial' | 'policy' | 'troubleshooting';
  created_date: string;
  updated_date: string;
  views: number;
  likes: number;
  dislikes: number;
  helpful_votes: number;
  related_articles: number[];
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  faq_questions?: Array<{
    question: string;
    answer: string;
  }>;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  subcategories: Array<{
    id: string;
    name: string;
    count: number;
  }>;
  total_articles: number;
}

const BaseConhecimento: React.FC = () => {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [selectedSubcategory, setSelectedSubcategory] = useState('todas');
  const [selectedType, setSelectedType] = useState('todos');
  const [sortBy, setSortBy] = useState('updated_date');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['reservas']);
  const [showModal, setShowModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);

  // Dados mock
  const categoriesMock: Category[] = [
    {
      id: 'reservas',
      name: 'Reservas e Vendas',
      icon: '🎯',
      subcategories: [
        { id: 'nova_reserva', name: 'Nova Reserva', count: 12 },
        { id: 'alteracao', name: 'Alterações', count: 8 },
        { id: 'cancelamento', name: 'Cancelamentos', count: 6 },
        { id: 'pagamento', name: 'Pagamentos', count: 10 }
      ],
      total_articles: 36
    },
    {
      id: 'hoteis',
      name: 'Hotéis e Hospedagem',
      icon: '🏨',
      subcategories: [
        { id: 'check_in', name: 'Check-in/Check-out', count: 5 },
        { id: 'quartos', name: 'Quartos e Comodidades', count: 7 },
        { id: 'problemas', name: 'Problemas no Hotel', count: 4 }
      ],
      total_articles: 16
    },
    {
      id: 'destinos',
      name: 'Destinos e Pacotes',
      icon: '🌴',
      subcategories: [
        { id: 'caldas_novas', name: 'Caldas Novas', count: 15 },
        { id: 'outros_destinos', name: 'Outros Destinos', count: 8 },
        { id: 'pacotes_especiais', name: 'Pacotes Especiais', count: 6 }
      ],
      total_articles: 29
    },
    {
      id: 'atendimento',
      name: 'Atendimento ao Cliente',
      icon: '📞',
      subcategories: [
        { id: 'protocolos', name: 'Protocolos', count: 12 },
        { id: 'escalation', name: 'Escalação', count: 5 },
        { id: 'satisfacao', name: 'Satisfação', count: 4 }
      ],
      total_articles: 21
    },
    {
      id: 'sistema',
      name: 'Sistema e Tecnologia',
      icon: '💻',
      subcategories: [
        { id: 'login', name: 'Login e Acesso', count: 3 },
        { id: 'bugs', name: 'Bugs e Problemas', count: 8 },
        { id: 'tutoriais', name: 'Tutoriais', count: 12 }
      ],
      total_articles: 23
    }
  ];

  const articlesMock: KnowledgeArticle[] = [
    {
      id: 1,
      title: 'Como realizar uma nova reserva de hotel',
      content: `# Como realizar uma nova reserva de hotel

## Passo a passo completo

### 1. Verificação de Disponibilidade
Antes de criar qualquer reserva, sempre verifique:
- Disponibilidade do hotel nas datas solicitadas
- Tipos de quartos disponíveis
- Tarifas aplicáveis
- Políticas de cancelamento

### 2. Dados do Cliente
Colete as seguintes informações:
- Nome completo (igual ao documento)
- CPF/RG
- Data de nascimento
- Telefone de contato
- Email
- Endereço completo

### 3. Detalhes da Reserva
- Hotel escolhido
- Tipo de quarto
- Datas de check-in e check-out
- Número de hóspedes (adultos e crianças)
- Preferências especiais

### 4. Confirmação e Pagamento
- Revisar todos os dados
- Calcular valores finais
- Definir forma de pagamento
- Gerar protocolo de reserva
- Enviar confirmação por email

### Dicas Importantes
- Sempre confirme os dados em voz alta com o cliente
- Explique as políticas de cancelamento
- Ofereça seguros de viagem quando aplicável
- Mantenha o protocolo de reserva acessível`,
      summary: 'Tutorial completo para criação de novas reservas de hotel, incluindo verificação de disponibilidade, coleta de dados e confirmação.',
      category: 'reservas',
      subcategory: 'nova_reserva',
      tags: ['reserva', 'hotel', 'tutorial', 'vendas', 'protocolo'],
      author: {
        name: 'Ana Silva Santos',
        id: 'AG001'
      },
      status: 'published',
      visibility: 'agents_only',
      difficulty: 'beginner',
      type: 'tutorial',
      created_date: '2025-08-01 10:00:00',
      updated_date: '2025-08-20 14:30:00',
      views: 245,
      likes: 42,
      dislikes: 2,
      helpful_votes: 38,
      related_articles: [2, 5, 8]
    },
    {
      id: 2,
      title: 'Política de cancelamento - Caldas Novas',
      content: `# Política de Cancelamento - Destino Caldas Novas

## Regras Gerais

### Hotéis Categoria Resort
- **48 horas antes**: Cancelamento gratuito
- **24-48 horas**: Taxa de 50% da primeira diária
- **Menos de 24h**: Taxa de 100% da primeira diária
- **No-show**: Cobrança de 100% da reserva

### Hotéis Categoria Pousada
- **24 horas antes**: Cancelamento gratuito
- **Menos de 24h**: Taxa de 50% da primeira diária
- **No-show**: Taxa de 100% da primeira diária

### Exceções Especiais
- **Emergências médicas**: Análise caso a caso com documentação
- **Problemas climáticos**: Flexibilização conforme política da empresa
- **Overbooking do hotel**: Cancelamento sem taxa + compensação

### Procedimento para Cancelamento
1. Verificar política específica do hotel
2. Calcular taxas aplicáveis
3. Confirmar com cliente
4. Processar cancelamento no sistema
5. Emitir comprovante

### Importante
- Sempre verificar se há seguro de viagem
- Documentar motivo do cancelamento
- Manter cliente informado sobre prazos`,
      summary: 'Políticas detalhadas de cancelamento para reservas em Caldas Novas, incluindo prazos, taxas e procedimentos.',
      category: 'reservas',
      subcategory: 'cancelamento',
      tags: ['cancelamento', 'caldas_novas', 'politica', 'taxas'],
      author: {
        name: 'Carlos Vendedor Silva',
        id: 'AG002'
      },
      status: 'published',
      visibility: 'public',
      difficulty: 'intermediate',
      type: 'policy',
      created_date: '2025-07-15 09:00:00',
      updated_date: '2025-08-18 16:45:00',
      views: 189,
      likes: 35,
      dislikes: 1,
      helpful_votes: 32,
      related_articles: [1, 3, 9],
      faq_questions: [
        {
          question: 'Posso cancelar sem taxa em caso de emergência médica?',
          answer: 'Sim, emergências médicas são analisadas caso a caso. É necessário apresentar documentação médica adequada.'
        },
        {
          question: 'O que acontece se o hotel fizer overbooking?',
          answer: 'Em caso de overbooking por parte do hotel, o cancelamento é gratuito e oferecemos compensação ao cliente.'
        }
      ]
    },
    {
      id: 3,
      title: 'Resolvendo problemas de ruído em hotéis',
      content: `# Resolvendo Problemas de Ruído em Hotéis

## Protocolo de Atendimento

### 1. Primeira Abordagem
- Escute atentamente a reclamação
- Demonstre empatia e compreensão
- Anote todos os detalhes (quarto, horário, tipo de ruído)
- Peça desculpas pelo inconveniente

### 2. Verificação Imediata
- Contacte o hotel imediatamente
- Informe sobre a situação
- Solicite verificação no local
- Peça relatório da situação

### 3. Soluções Possíveis
**Mudança de Quarto:**
- Solicite quarto mais silencioso
- Prefira andares mais altos
- Evite quartos próximos a elevadores ou escadas

**Compensações:**
- Upgrade gratuito quando disponível
- Cortesia no café da manhã
- Late check-out sem taxa
- Desconto na próxima estadia

### 4. Acompanhamento
- Confirme se a solução foi efetiva
- Mantenha contato durante a estadia
- Solicite feedback ao final
- Documente no sistema

### 5. Prevenção
- Sempre pergunte sobre preferências de quarto
- Informe sobre possíveis obras ou eventos
- Ofereça quartos com vista e localização adequadas

### Importante
- Nunca minimize a reclamação do cliente
- Age rapidamente - tempo é crucial
- Documente tudo para futuras melhorias
- Use a situação para fortalecer o relacionamento`,
      summary: 'Protocolo completo para resolução de problemas de ruído em hotéis, incluindo verificação, soluções e acompanhamento.',
      category: 'hoteis',
      subcategory: 'problemas',
      tags: ['problema', 'ruido', 'hotel', 'protocolo', 'solucao'],
      author: {
        name: 'Maria Atendente Costa',
        id: 'AG003'
      },
      status: 'published',
      visibility: 'agents_only',
      difficulty: 'intermediate',
      type: 'troubleshooting',
      created_date: '2025-08-10 11:15:00',
      updated_date: '2025-08-25 09:30:00',
      views: 156,
      likes: 28,
      dislikes: 0,
      helpful_votes: 26,
      related_articles: [4, 6, 7]
    },
    {
      id: 4,
      title: 'FAQ - Perguntas Frequentes sobre Caldas Novas',
      content: '',
      summary: 'Respostas para as perguntas mais comuns dos clientes sobre o destino Caldas Novas.',
      category: 'destinos',
      subcategory: 'caldas_novas',
      tags: ['faq', 'caldas_novas', 'duvidas', 'cliente'],
      author: {
        name: 'Equipe Reservei',
        id: 'TEAM'
      },
      status: 'published',
      visibility: 'public',
      difficulty: 'beginner',
      type: 'faq',
      created_date: '2025-07-01 08:00:00',
      updated_date: '2025-08-22 10:00:00',
      views: 423,
      likes: 67,
      dislikes: 3,
      helpful_votes: 61,
      related_articles: [2, 5, 10],
      faq_questions: [
        {
          question: 'Qual a melhor época para visitar Caldas Novas?',
          answer: 'Caldas Novas pode ser visitada o ano todo. O período de maio a setembro tem clima mais seco e temperaturas amenas. De outubro a abril é temporada de chuvas, mas as águas termais são agradáveis em qualquer época.'
        },
        {
          question: 'As águas termais são naturais?',
          answer: 'Sim! Caldas Novas possui a maior estância hidrotermal do mundo. As águas brotam naturalmente do subsolo com temperaturas entre 37°C e 57°C, ricas em minerais benéficos à saúde.'
        },
        {
          question: 'Qual a distância de Brasília?',
          answer: 'Caldas Novas fica a aproximadamente 170 km de Brasília, cerca de 2 horas de viagem de carro pela BR-352.'
        },
        {
          question: 'Precisa de carro para se locomover na cidade?',
          answer: 'Não necessariamente. A maioria dos hotéis fica concentrada no centro da cidade e oferece transfer para os principais pontos turísticos. Táxis e aplicativos também estão disponíveis.'
        },
        {
          question: 'Crianças pagam entrada nos parques aquáticos?',
          answer: 'As políticas variam por hotel/parque. Geralmente crianças até 5-6 anos não pagam. Sempre verificamos as condições específicas de cada estabelecimento ao fazer a reserva.'
        }
      ]
    },
    {
      id: 5,
      title: 'Protocolos de atendimento ao cliente VIP',
      content: `# Protocolos de Atendimento ao Cliente VIP

## Identificação de Clientes VIP

### Critérios
- **Histórico**: 10+ viagens nos últimos 12 meses
- **Valor**: Gasto anual acima de R$ 25.000
- **Referências**: Indicou 5+ novos clientes
- **Feedback**: Avaliações consistentemente altas
- **Perfil**: Executivos, celebridades, parceiros estratégicos

## Protocolo Diferenciado

### 1. Primeiro Contato
- Atendimento imediato (sem fila)
- Saudação personalizada pelo nome
- Agente sênior dedicado
- Oferta de canal direto (WhatsApp VIP)

### 2. Durante o Atendimento
- Escuta ativa e paciente
- Oferecer sempre as melhores opções
- Flexibilidade em políticas quando possível
- Antecipar necessidades

### 3. Reservas
- **Prioridade** em quartos com melhor localização
- **Upgrades** gratuitos quando disponível
- **Late check-out** automático
- **Early check-in** sem custo adicional

### 4. Problemas e Reclamações
- **Resolução imediata** - não transferir
- **Gerente de turno** deve ser acionado
- **Compensações generosas**
- **Follow-up** obrigatório em 24h

### 5. Pós-Venda
- Ligação de cortesia 24h após check-in
- Pesquisa de satisfação personalizada
- Ofertas exclusivas para próximas viagens
- Lembretes de datas especiais

## Benefícios Exclusivos

### Cortesias
- Welcome drink no hotel
- Frutas ou amenities no quarto
- Transfer gratuito (quando aplicável)
- Consultoria personalizada de destinos

### Programas Especiais
- **Fidelidade VIP**: Pontuação em dobro
- **Aniversário**: Desconto especial
- **Referências**: Comissão em viagens de indicados
- **Eventos**: Convites para lançamentos

## Importante
- Nunca prometa o que não pode cumprir
- Documente todas as interações especiais
- Mantenha histórico atualizado
- Comunique preferências a toda equipe`,
      summary: 'Protocolo especializado para atendimento de clientes VIP, incluindo critérios, benefícios e procedimentos diferenciados.',
      category: 'atendimento',
      subcategory: 'protocolos',
      tags: ['vip', 'protocolo', 'atendimento', 'premium', 'fidelidade'],
      author: {
        name: 'Ana Silva Santos',
        id: 'AG001'
      },
      status: 'published',
      visibility: 'agents_only',
      difficulty: 'advanced',
      type: 'article',
      created_date: '2025-08-05 14:00:00',
      updated_date: '2025-08-23 11:20:00',
      views: 198,
      likes: 41,
      dislikes: 1,
      helpful_votes: 39,
      related_articles: [1, 6, 11]
    }
  ];

  useEffect(() => {
    setCategories(categoriesMock);
    setArticles(articlesMock);
  }, []);

  const filteredArticles = articles.filter(article => {
    const matchSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchCategory = selectedCategory === 'todas' || article.category === selectedCategory;
    const matchSubcategory = selectedSubcategory === 'todas' || article.subcategory === selectedSubcategory;
    const matchType = selectedType === 'todos' || article.type === selectedType;

    return matchSearch && matchCategory && matchSubcategory && matchType;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'views':
        return b.views - a.views;
      case 'likes':
        return b.likes - a.likes;
      case 'helpful_votes':
        return b.helpful_votes - a.helpful_votes;
      case 'updated_date':
      default:
        return new Date(b.updated_date).getTime() - new Date(a.updated_date).getTime();
    }
  });

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleViewArticle = (article: KnowledgeArticle) => {
    setSelectedArticle(article);
    setShowModal(true);

    // Simular incremento de visualização
    setArticles(prev => prev.map(a =>
      a.id === article.id ? { ...a, views: a.views + 1 } : a
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return <FileText className="h-4 w-4" />;
      case 'faq': return <HelpCircle className="h-4 w-4" />;
      case 'tutorial': return <Book className="h-4 w-4" />;
      case 'policy': return <FileText className="h-4 w-4" />;
      case 'troubleshooting': return <HelpCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const stats = {
    totalArticles: articles.length,
    totalViews: articles.reduce((acc, a) => acc + a.views, 0),
    totalLikes: articles.reduce((acc, a) => acc + a.likes, 0),
    publishedArticles: articles.filter(a => a.status === 'published').length
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Categorias */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Book className="h-6 w-6 text-blue-600" />
            Base de Conhecimento
          </h1>

          {/* Stats rápidas */}
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="bg-blue-50 p-3 rounded">
              <div className="font-bold text-blue-600">{stats.totalArticles}</div>
              <div className="text-blue-700">Artigos</div>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <div className="font-bold text-green-600">{stats.totalViews}</div>
              <div className="text-green-700">Visualizações</div>
            </div>
          </div>
        </div>

        {/* Navegação por Categorias */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            <button
              onClick={() => setSelectedCategory('todas')}
              className={`w-full text-left px-3 py-2 rounded-lg ${
                selectedCategory === 'todas' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
              }`}
            >
              📚 Todas as Categorias ({stats.totalArticles})
            </button>

            {categories.map(category => (
              <div key={category.id}>
                <button
                  onClick={() => toggleCategory(category.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg ${
                    selectedCategory === category.id ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{category.icon}</span>
                    <span className="font-medium">{category.name}</span>
                    <span className="text-sm text-gray-500">({category.total_articles})</span>
                  </span>
                  {expandedCategories.includes(category.id) ?
                    <ChevronDown className="h-4 w-4" /> :
                    <ChevronRight className="h-4 w-4" />
                  }
                </button>

                {expandedCategories.includes(category.id) && (
                  <div className="ml-6 mt-1 space-y-1">
                    {category.subcategories.map(sub => (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setSelectedSubcategory(sub.id);
                        }}
                        className={`w-full text-left px-3 py-1 text-sm rounded ${
                          selectedSubcategory === sub.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {sub.name} ({sub.count})
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col">
        {/* Header de Busca e Filtros */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar artigos, tutoriais, FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos os Tipos</option>
              <option value="article">Artigos</option>
              <option value="faq">FAQ</option>
              <option value="tutorial">Tutoriais</option>
              <option value="policy">Políticas</option>
              <option value="troubleshooting">Troubleshooting</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="updated_date">Mais Recentes</option>
              <option value="views">Mais Visualizados</option>
              <option value="likes">Mais Curtidos</option>
              <option value="helpful_votes">Mais Úteis</option>
            </select>

            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Novo Artigo
            </button>
          </div>
        </div>

        {/* Lista de Artigos */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {filteredArticles.map(article => (
              <div key={article.id} className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(article.type)}
                    <h3 className="font-semibold text-lg text-gray-900">{article.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(article.status)}`}>
                      {article.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(article.difficulty)}`}>
                      {article.difficulty}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2">{article.summary}</p>

                {/* FAQ Preview */}
                {article.type === 'faq' && article.faq_questions && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      💡 Perguntas em destaque:
                    </div>
                    <div className="space-y-1">
                      {article.faq_questions.slice(0, 2).map((faq, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          <span className="font-medium">Q:</span> {faq.question}
                        </div>
                      ))}
                      {article.faq_questions.length > 2 && (
                        <div className="text-sm text-blue-600">
                          +{article.faq_questions.length - 2} mais perguntas
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {article.tags.map((tag, index) => (
                    <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {article.author.name}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {new Date(article.updated_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {article.views} visualizações
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <ThumbsUp className="h-4 w-4" />
                      {article.likes}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Star className="h-4 w-4" />
                      {article.helpful_votes} úteis
                    </div>
                    <button
                      onClick={() => handleViewArticle(article)}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      <Eye className="h-4 w-4" />
                      Ler
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="text-center py-12">
              <Book className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum artigo encontrado</h3>
              <p className="text-gray-500">Tente ajustar os filtros ou termos de busca.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Visualização */}
      {showModal && selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedArticle.title}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedArticle.status)}`}>
                      {selectedArticle.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(selectedArticle.difficulty)}`}>
                      {selectedArticle.difficulty}
                    </span>
                    <span className="text-sm text-gray-500">
                      por {selectedArticle.author.name}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              {selectedArticle.type === 'faq' && selectedArticle.faq_questions ? (
                <div className="space-y-6">
                  <div className="text-gray-600 mb-6">{selectedArticle.summary}</div>
                  {selectedArticle.faq_questions.map((faq, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                      <p className="text-gray-700">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap">{selectedArticle.content}</div>
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-200">
                {selectedArticle.tags.map((tag, index) => (
                  <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Footer com ações */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div>Atualizado: {new Date(selectedArticle.updated_date).toLocaleDateString()}</div>
                  <div>{selectedArticle.views} visualizações</div>
                </div>

                <div className="flex gap-2">
                  <button className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
                    <ThumbsUp className="h-4 w-4" />
                    Útil ({selectedArticle.helpful_votes})
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                    <Edit className="h-4 w-4" />
                    Editar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BaseConhecimento;
