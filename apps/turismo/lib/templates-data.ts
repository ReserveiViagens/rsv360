// Sistema de Templates de Cotações RSV 360

import { Budget } from './types/budget';
import { generateId } from './utils';
import { caldasNovasTemplates, seasonalTemplates, otherRegionalTemplates } from './regional-templates';
import FavoritesManager from './favorites-system';
import VersionHistoryManager from './version-history';
import CollaborationManager from './collaboration-system';
import AnalyticsManager from './analytics-system';

export interface Template {
  id: string;
  name: string;
  category: 'hotel' | 'parque' | 'atracao' | 'passeio' | 'personalizado';
  description: string;
  icon: string;
  color: string;
  preview: string;
  budget: Partial<Budget>;
  createdAt: string;
  updatedAt: string;
  isDefault: boolean;
  tags: string[];
  author?: string;
  usageCount: number;
}

// Templates padrão do sistema
export const defaultTemplates: Template[] = [
  {
    id: 'hotel-resort-all-inclusive',
    name: 'Resort All Inclusive',
    category: 'hotel',
    description: 'Template completo para resorts com sistema all inclusive, incluindo hospedagem, refeições e atividades',
    icon: '🏨',
    color: 'bg-blue-100 text-blue-600',
    preview: '/templates/previews/resort-all-inclusive.jpg',
    isDefault: true,
    tags: ['resort', 'all-inclusive', 'família', 'luxo'],
    usageCount: 245,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    budget: {
      type: 'hotel',
      title: 'Pacote Resort All Inclusive',
      currency: 'BRL',
      items: [
        {
          id: generateId(),
          name: 'Hospedagem All Inclusive',
          description: 'Quarto duplo com vista para o mar',
          category: 'Hospedagem',
          quantity: 3,
          unitPrice: 450.00,
          totalPrice: 1350.00,
          details: {
            checkIn: '',
            checkOut: '',
            roomType: 'Quarto Duplo Vista Mar',
            guests: 2,
            accommodationType: 'All Inclusive'
          }
        },
        {
          id: generateId(),
          name: 'Transfer Aeroporto',
          description: 'Transfer ida e volta',
          category: 'Transporte',
          quantity: 1,
          unitPrice: 120.00,
          totalPrice: 120.00
        }
      ],
      highlights: [
        { id: generateId(), title: 'Todas as refeições incluídas', description: '', checked: true },
        { id: generateId(), title: 'Bebidas nacionais liberadas', description: '', checked: true },
        { id: generateId(), title: 'Atividades de recreação', description: '', checked: true },
        { id: generateId(), title: 'Piscinas e área de lazer', description: '', checked: true }
      ],
      benefits: [
        { id: generateId(), description: 'Check-in antecipado (sujeito à disponibilidade)', checked: true },
        { id: generateId(), description: 'Wi-Fi gratuito em todo o resort', checked: true },
        { id: generateId(), description: 'Estacionamento gratuito', checked: true }
      ],
      importantNotes: [
        { id: generateId(), note: 'Valores sujeitos à disponibilidade e alteração', checked: true },
        { id: generateId(), note: 'Check-in às 15h e check-out às 12h', checked: true },
        { id: generateId(), note: 'Política de cancelamento: 48h antes da chegada', checked: true }
      ]
    }
  },
  {
    id: 'parque-tematico-familia',
    name: 'Parque Temático Família',
    category: 'parque',
    description: 'Cotação completa para família em parques temáticos com ingressos, fast pass e refeições',
    icon: '🎢',
    color: 'bg-purple-100 text-purple-600',
    preview: '/templates/previews/parque-familia.jpg',
    isDefault: true,
    tags: ['família', 'crianças', 'diversão', 'parque'],
    usageCount: 189,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    budget: {
      type: 'parque',
      title: 'Diversão em Família - Parque Temático',
      currency: 'BRL',
      items: [
        {
          id: generateId(),
          name: 'Ingresso Adulto',
          description: 'Acesso completo ao parque',
          category: 'Ingresso',
          quantity: 2,
          unitPrice: 149.90,
          totalPrice: 299.80,
          details: {
            ageGroup: 'adulto',
            ticketType: 'Dia Inteiro',
            validityDays: 1,
            fastPass: false
          }
        },
        {
          id: generateId(),
          name: 'Ingresso Criança',
          description: 'Acesso completo ao parque',
          category: 'Ingresso',
          quantity: 2,
          unitPrice: 119.90,
          totalPrice: 239.80,
          details: {
            ageGroup: 'crianca',
            ticketType: 'Dia Inteiro',
            validityDays: 1,
            fastPass: false
          }
        },
        {
          id: generateId(),
          name: 'Fast Pass Família',
          description: 'Fura-fila para principais atrações',
          category: 'Fast Pass',
          quantity: 4,
          unitPrice: 45.00,
          totalPrice: 180.00,
          details: {
            fastPass: true
          }
        }
      ],
      highlights: [
        { id: generateId(), title: 'Mais de 30 atrações incluídas', description: '', checked: true },
        { id: generateId(), title: 'Shows e apresentações', description: '', checked: true },
        { id: generateId(), title: 'Área infantil dedicada', description: '', checked: true },
        { id: generateId(), title: 'Estacionamento gratuito', description: '', checked: true }
      ]
    }
  },
  {
    id: 'city-tour-historico',
    name: 'City Tour Histórico',
    category: 'passeio',
    description: 'Tour completo pelos pontos históricos da cidade com guia especializado e transporte',
    icon: '🚌',
    color: 'bg-orange-100 text-orange-600',
    preview: '/templates/previews/city-tour.jpg',
    isDefault: true,
    tags: ['história', 'cultura', 'guia', 'transporte'],
    usageCount: 156,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    budget: {
      type: 'passeio',
      title: 'City Tour Histórico Completo',
      currency: 'BRL',
      items: [
        {
          id: generateId(),
          name: 'City Tour Adulto',
          description: 'Tour completo com guia especializado',
          category: 'Passeio',
          quantity: 2,
          unitPrice: 180.00,
          totalPrice: 360.00,
          details: {
            ageGroup: 'adulto',
            departureTime: '08:00',
            returnTime: '16:00',
            transportIncluded: true,
            guideIncluded: true,
            mealIncluded: false
          }
        }
      ],
      highlights: [
        { id: generateId(), title: 'Guia turístico credenciado', description: '', checked: true },
        { id: generateId(), title: 'Transporte com ar condicionado', description: '', checked: true },
        { id: generateId(), title: 'Principais pontos históricos', description: '', checked: true },
        { id: generateId(), title: 'Duração de 8 horas', description: '', checked: true }
      ],
      benefits: [
        { id: generateId(), description: 'Pick-up no hotel', checked: true },
        { id: generateId(), description: 'Água durante o passeio', checked: true },
        { id: generateId(), description: 'Material informativo', checked: true }
      ]
    }
  },
  {
    id: 'museus-cultura',
    name: 'Museus e Cultura',
    category: 'atracao',
    description: 'Roteiro cultural completo com museus, centros culturais e atrações históricas',
    icon: '🎡',
    color: 'bg-green-100 text-green-600',
    preview: '/templates/previews/museus-cultura.jpg',
    isDefault: true,
    tags: ['museu', 'cultura', 'arte', 'história'],
    usageCount: 98,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    budget: {
      type: 'atracao',
      title: 'Roteiro Cultural - Museus e Arte',
      currency: 'BRL',
      items: [
        {
          id: generateId(),
          name: 'Ingresso Museu Principal',
          description: 'Acesso às exposições permanentes',
          category: 'Ingresso',
          quantity: 2,
          unitPrice: 30.00,
          totalPrice: 60.00,
          details: {
            ageGroup: 'adulto',
            tourGuide: false,
            audioGuide: true
          }
        },
        {
          id: generateId(),
          name: 'Tour Guiado Cultural',
          description: 'Visita guiada por especialista',
          category: 'Tour Guiado',
          quantity: 1,
          unitPrice: 120.00,
          totalPrice: 120.00,
          details: {
            tourGuide: true,
            scheduledTime: '14:00'
          }
        }
      ],
      highlights: [
        { id: generateId(), title: 'Audioguia em português', description: '', checked: true },
        { id: generateId(), title: 'Acesso a exposições especiais', description: '', checked: true },
        { id: generateId(), title: 'Material educativo incluso', description: '', checked: true }
      ]
    }
  },
  {
    id: 'pacote-romantico',
    name: 'Pacote Romântico',
    category: 'hotel',
    description: 'Experiência romântica completa com hospedagem, jantar especial e mimos',
    icon: '💕',
    color: 'bg-pink-100 text-pink-600',
    preview: '/templates/previews/pacote-romantico.jpg',
    isDefault: true,
    tags: ['romântico', 'casal', 'lua-de-mel', 'especial'],
    usageCount: 134,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    budget: {
      type: 'hotel',
      title: 'Escapada Romântica',
      currency: 'BRL',
      items: [
        {
          id: generateId(),
          name: 'Suíte Romântica',
          description: 'Suíte com decoração especial',
          category: 'Hospedagem',
          quantity: 2,
          unitPrice: 380.00,
          totalPrice: 760.00,
          details: {
            roomType: 'Suíte Romântica',
            guests: 2,
            accommodationType: 'Especial'
          }
        },
        {
          id: generateId(),
          name: 'Jantar Romântico',
          description: 'Jantar à luz de velas',
          category: 'Alimentação',
          quantity: 1,
          unitPrice: 250.00,
          totalPrice: 250.00
        }
      ],
      highlights: [
        { id: generateId(), title: 'Decoração especial no quarto', description: '', checked: true },
        { id: generateId(), title: 'Champagne de cortesia', description: '', checked: true },
        { id: generateId(), title: 'Café da manhã na cama', description: '', checked: true },
        { id: generateId(), title: 'Late check-out gratuito', description: '', checked: true }
      ]
    }
  },
  {
    id: 'aventura-radical',
    name: 'Aventura Radical',
    category: 'passeio',
    description: 'Pacote de aventura com trilhas, rapel e atividades radicais',
    icon: '🏔️',
    color: 'bg-red-100 text-red-600',
    preview: '/templates/previews/aventura-radical.jpg',
    isDefault: true,
    tags: ['aventura', 'radical', 'trilha', 'natureza'],
    usageCount: 87,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    budget: {
      type: 'passeio',
      title: 'Aventura Radical na Natureza',
      currency: 'BRL',
      items: [
        {
          id: generateId(),
          name: 'Pacote Aventura Completo',
          description: 'Trilha, rapel e tirolesa',
          category: 'Passeio',
          quantity: 2,
          unitPrice: 220.00,
          totalPrice: 440.00,
          details: {
            ageGroup: 'adulto',
            difficulty: 'moderado',
            transportIncluded: true,
            guideIncluded: true
          }
        }
      ],
      highlights: [
        { id: generateId(), title: 'Equipamentos de segurança inclusos', description: '', checked: true },
        { id: generateId(), title: 'Instrutor especializado', description: '', checked: true },
        { id: generateId(), title: 'Seguro de acidentes pessoais', description: '', checked: true }
      ],
      importantNotes: [
        { id: generateId(), note: 'Idade mínima: 16 anos', checked: true },
        { id: generateId(), note: 'Bom condicionamento físico necessário', checked: true },
        { id: generateId(), note: 'Sujeito a condições climáticas', checked: true }
      ]
    }
  }
];

// Funções utilitárias para templates
export class TemplateManager {
  private static STORAGE_KEY = 'rsv360_templates';

  static getAll(): Template[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const customTemplates = stored ? JSON.parse(stored) : [];
      
      // Combinar todos os templates: padrão, regionais e personalizados
      const allTemplatesBase = [
        ...defaultTemplates, 
        ...caldasNovasTemplates,
        ...seasonalTemplates,
        ...otherRegionalTemplates,
        ...customTemplates
      ];
      // Importar templates externos (V0) se existirem
      const external = this.importExternalTemplates();
      const allTemplates = [...allTemplatesBase, ...external];
      
      return allTemplates;
    } catch {
      return [...defaultTemplates, ...caldasNovasTemplates, ...seasonalTemplates, ...otherRegionalTemplates];
    }
  }

  static getById(id: string): Template | undefined {
    return this.getAll().find(template => template.id === id);
  }

  static getByCategory(category: string): Template[] {
    if (category === 'all') return this.getAll();
    return this.getAll().filter(template => template.category === category);
  }

  static save(template: Template): void {
    try {
      const customTemplates = this.getCustomTemplates();
      const existingIndex = customTemplates.findIndex(t => t.id === template.id);
      
      if (existingIndex >= 0) {
        customTemplates[existingIndex] = { ...template, updatedAt: new Date().toISOString() };
      } else {
        customTemplates.push({ ...template, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(customTemplates));
    } catch (error) {
      console.error('Erro ao salvar template:', error);
    }
  }

  static delete(id: string): void {
    try {
      const customTemplates = this.getCustomTemplates();
      const filtered = customTemplates.filter(t => t.id !== id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Erro ao deletar template:', error);
    }
  }

  static duplicate(id: string): Template | null {
    try {
      const original = this.getById(id);
      if (!original) return null;

      const duplicated: Template = {
        ...original,
        id: generateId(),
        name: `${original.name} (Cópia)`,
        isDefault: false,
        usageCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.save(duplicated);
      return duplicated;
    } catch (error) {
      console.error('Erro ao duplicar template:', error);
      return null;
    }
  }

  static incrementUsage(id: string): void {
    try {
      const template = this.getById(id);
      if (template) {
        template.usageCount += 1;
        
        // Salvar apenas se não for template padrão
        if (!template.isDefault) {
          this.save(template);
        }
        
        // Rastrear uso no analytics
        AnalyticsManager.trackEvent('use', id, {
          templateName: template.name,
          category: template.category
        });
        
        // Adicionar aos recentes
        FavoritesManager.addToRecentlyUsed(id);
        
        // Log de colaboração
        CollaborationManager.logActivity({
          type: 'template_shared',
          userId: 'current_user',
          userName: 'Usuário',
          templateId: id,
          templateName: template.name,
          description: `Template "${template.name}" foi utilizado`
        });
      }
    } catch (error) {
      console.error('Erro ao incrementar uso do template:', error);
    }
  }

  static search(query: string): Template[] {
    const lowerQuery = query.toLowerCase();
    return this.getAll().filter(template =>
      template.name.toLowerCase().includes(lowerQuery) ||
      template.description.toLowerCase().includes(lowerQuery) ||
      template.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  private static getCustomTemplates(): Template[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Importa templates externos do módulo "Modulo de Orçamentos Parques Hoteis e Atrações" via localStorage
  // Chave usada lá: "reservei-templates" (array de objetos BudgetTemplate)
  private static importExternalTemplates(): Template[] {
    try {
      const stored = localStorage.getItem('reservei-templates');
      if (!stored) return [];
      const externalArr = JSON.parse(stored);
      if (!Array.isArray(externalArr)) return [];

      const mapCategory = (mainCategory: string): Template['category'] => {
        const c = (mainCategory || '').toLowerCase();
        if (c.includes('hotel') || c.includes('resort') || c.includes('pousada')) return 'hotel';
        if (c.includes('parque')) return 'parque';
        if (c.includes('atra')) return 'atracao';
        if (c.includes('passeio') || c.includes('tour')) return 'passeio';
        return 'personalizado';
      };

      const mapped: Template[] = externalArr.map((t: any) => {
        const category = mapCategory(t.mainCategory || t.category || '');
        const photos = (t.photos || []).map((p: any) => ({ id: p.id || generateId(), url: p.url, caption: p.caption, type: undefined }));
        const highlights = (t.highlights || []).map((h: any) => ({ id: h.id || generateId(), title: h.title, description: h.description, checked: h.checked !== false }));
        const benefits = (t.benefits || []).map((b: any) => ({ id: b.id || generateId(), description: b.description, checked: b.checked !== false }));
        const importantNotes = (t.importantNotes || []).map((n: any) => ({ id: n.id || generateId(), note: n.note, checked: n.checked !== false }));
        const items = (t.items || []).map((i: any) => ({
          id: i.id || generateId(),
          name: i.name || i.description || 'Item',
          description: i.description || '',
          category: 'Item',
          quantity: i.quantity || 1,
          unitPrice: i.unitPrice || i.total || 0,
          totalPrice: i.total || ((i.quantity || 1) * (i.unitPrice || 0)),
        }));

        const budget: Partial<Budget> = {
          type: category,
          title: t.title || t.name || 'Cotação',
          description: t.templateDescription || t.description || '',
          status: 'draft',
          createdAt: t.createdAt || new Date().toISOString(),
          updatedAt: t.updatedAt || new Date().toISOString(),
          items,
          photos,
          highlights,
          benefits,
          importantNotes,
          subtotal: items.reduce((s: number, it: any) => s + (it.quantity * it.unitPrice), 0),
          discount: t.discount || 0,
          discountType: t.discountType === 'percentage' ? 'percentage' : 'fixed',
          taxes: t.tax || 0,
          taxType: t.taxType === 'percentage' ? 'percentage' : 'fixed',
          total: items.reduce((s: number, it: any) => s + (it.totalPrice || (it.quantity * it.unitPrice)), 0)
        };

        return {
          id: t.id || generateId(),
          name: t.name || t.title || 'Template',
          category,
          description: t.templateDescription || t.description || '',
          icon: category === 'hotel' ? '🏨' : category === 'parque' ? '🎢' : category === 'atracao' ? '🎡' : category === 'passeio' ? '🚌' : '📋',
          color: this.getCategoryColor(category),
          preview: photos?.[0]?.url || '',
          budget: budget as Budget,
          createdAt: budget.createdAt as string,
          updatedAt: budget.updatedAt as string,
          isDefault: true,
          tags: [ 'importado', 'externo', (t.hotelCity || t.parkCity || t.attractionCity || '').toLowerCase() ].filter(Boolean),
          author: 'V0 Templates',
          usageCount: 0,
        } as Template;
      });

      return mapped;
    } catch (e) {
      console.error('Falha ao importar templates externos:', e);
      return [];
    }
  }

  static createFromBudget(budget: Budget, name: string, description: string): Template {
    const template: Template = {
      id: generateId(),
      name,
      description,
      category: budget.type as Template['category'],
      icon: this.getCategoryIcon(budget.type),
      color: this.getCategoryColor(budget.type),
      preview: '',
      budget: { ...budget },
      isDefault: false,
      tags: [],
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.save(template);
    return template;
  }

  private static getCategoryIcon(type: string): string {
    const icons = {
      hotel: '🏨',
      parque: '🎢',
      atracao: '🎡',
      passeio: '🚌',
      personalizado: '⚙️'
    };
    return icons[type as keyof typeof icons] || '📋';
  }

  private static getCategoryColor(type: string): string {
    const colors = {
      hotel: 'bg-blue-100 text-blue-600',
      parque: 'bg-purple-100 text-purple-600',
      atracao: 'bg-green-100 text-green-600',
      passeio: 'bg-orange-100 text-orange-600',
      personalizado: 'bg-gray-100 text-gray-600'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-600';
  }

  // Métodos avançados integrados

  // Favoritos
  static toggleFavorite(templateId: string): boolean {
    const template = this.getById(templateId);
    if (!template) return false;

    const isFavorite = FavoritesManager.isFavorite(templateId);
    
    if (isFavorite) {
      FavoritesManager.removeFromFavorites(templateId);
      return false;
    } else {
      FavoritesManager.addToFavorites(templateId, template.name, template.category, template.tags);
      return true;
    }
  }

  static getFavoriteTemplates(): Template[] {
    const favorites = FavoritesManager.getFavorites();
    return favorites.map(fav => this.getById(fav.templateId)).filter(Boolean) as Template[];
  }

  static getRecommendedTemplates(): Template[] {
    const allTemplates = this.getAll();
    return FavoritesManager.getRecommendedTemplates(allTemplates);
  }

  // Histórico de versões
  static saveTemplateVersion(template: Template, changeDescription: string): void {
    try {
      const oldTemplate = this.getById(template.id);
      if (oldTemplate) {
        const changes = VersionHistoryManager.detectChanges(oldTemplate, template);
        VersionHistoryManager.saveVersion(template, changes, changeDescription);
      }
    } catch (error) {
      console.error('Erro ao salvar versão:', error);
    }
  }

  static getTemplateVersions(templateId: string) {
    return VersionHistoryManager.getTemplateVersions(templateId);
  }

  static restoreTemplateVersion(templateId: string, version: number): Template | null {
    return VersionHistoryManager.restoreVersion(templateId, version);
  }

  // Colaboração
  static shareTemplate(templateId: string, userIds: string[], message?: string): boolean {
    try {
      const template = this.getById(templateId);
      if (!template) return false;

      CollaborationManager.shareTemplate(templateId, userIds, {
        canView: true,
        canEdit: false,
        canComment: true,
        canShare: false,
        canUse: true
      }, message);

      return true;
    } catch (error) {
      console.error('Erro ao compartilhar template:', error);
      return false;
    }
  }

  static getSharedTemplates(): Template[] {
    const shared = CollaborationManager.getSharedTemplates('current_user');
    return shared.map(s => this.getById(s.templateId)).filter(Boolean) as Template[];
  }

  static addTemplateComment(templateId: string, content: string): boolean {
    try {
      CollaborationManager.addComment(templateId, content);
      return true;
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      return false;
    }
  }

  static getTemplateComments(templateId: string) {
    return CollaborationManager.getTemplateComments(templateId);
  }

  // Analytics
  static trackTemplateView(templateId: string): void {
    AnalyticsManager.trackEvent('view', templateId);
  }

  static trackTemplateShare(templateId: string): void {
    AnalyticsManager.trackEvent('share', templateId);
  }

  static getTemplateAnalytics(templateId: string) {
    return AnalyticsManager.getTemplateAnalytics(templateId);
  }

  static getTopPerformingTemplates(limit: number = 10): Template[] {
    const topAnalytics = AnalyticsManager.getTopPerformingTemplates(limit);
    return topAnalytics.map(a => this.getById(a.templateId)).filter(Boolean) as Template[];
  }

  // Filtros avançados
  static getTemplatesByRegion(region: string): Template[] {
    return this.getAll().filter(template => 
      template.tags.includes(region.toLowerCase())
    );
  }

  static getSeasonalTemplates(season: 'alta' | 'baixa' | 'all' = 'all'): Template[] {
    if (season === 'all') {
      return this.getAll().filter(template => 
        template.tags.includes('alta-temporada') || template.tags.includes('baixa-temporada')
      );
    }
    
    const seasonTag = season === 'alta' ? 'alta-temporada' : 'baixa-temporada';
    return this.getAll().filter(template => template.tags.includes(seasonTag));
  }

  static getTemplatesByDifficulty(difficulty: 'facil' | 'moderado' | 'dificil'): Template[] {
    return this.getAll().filter(template => template.tags.includes(difficulty));
  }

  static getTemplatesByPriceRange(min: number, max: number): Template[] {
    return this.getAll().filter(template => {
      if (!template.budget?.total) return false;
      return template.budget.total >= min && template.budget.total <= max;
    });
  }

  // Estatísticas avançadas
  static getAdvancedStats(): {
    totalTemplates: number;
    templatesByCategory: { [key: string]: number };
    templatesByRegion: { [key: string]: number };
    averageUsage: number;
    mostPopularTags: { tag: string; count: number }[];
    recentlyCreated: Template[];
    topRated: Template[];
    analytics: any;
    collaboration: any;
    favorites: any;
  } {
    const templates = this.getAll();
    
    // Por categoria
    const templatesByCategory: { [key: string]: number } = {};
    templates.forEach(t => {
      templatesByCategory[t.category] = (templatesByCategory[t.category] || 0) + 1;
    });

    // Por região
    const templatesByRegion: { [key: string]: number } = {};
    templates.forEach(t => {
      const regionTags = t.tags.filter(tag => 
        ['caldas-novas', 'bonito', 'gramado', 'fernando-noronha'].includes(tag)
      );
      regionTags.forEach(region => {
        templatesByRegion[region] = (templatesByRegion[region] || 0) + 1;
      });
    });

    // Tags mais populares
    const tagCount: { [key: string]: number } = {};
    templates.forEach(t => {
      t.tags.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });
    
    const mostPopularTags = Object.entries(tagCount)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Uso médio
    const totalUsage = templates.reduce((sum, t) => sum + t.usageCount, 0);
    const averageUsage = templates.length > 0 ? totalUsage / templates.length : 0;

    // Recentemente criados (últimos 7 dias)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentlyCreated = templates.filter(t => 
      new Date(t.createdAt) > weekAgo
    ).slice(0, 5);

    // Melhor avaliados (simulado)
    const topRated = templates
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 5);

    return {
      totalTemplates: templates.length,
      templatesByCategory,
      templatesByRegion,
      averageUsage,
      mostPopularTags,
      recentlyCreated,
      topRated,
      analytics: AnalyticsManager.getQuickStats(),
      collaboration: CollaborationManager.getCollaborationStats(),
      favorites: FavoritesManager.getFavoritesStats()
    };
  }

  // Limpeza e manutenção
  static cleanupOldData(): void {
    try {
      // Limpar versões antigas (manter apenas 5 por template)
      VersionHistoryManager.cleanupOldVersions(5);
      
      // Limpar eventos antigos de analytics (manter últimos 90 dias)
      // Implementado internamente no AnalyticsManager
      
      console.log('Limpeza de dados concluída');
    } catch (error) {
      console.error('Erro na limpeza de dados:', error);
    }
  }

  // Exportação avançada
  static exportAllData(): string {
    try {
      const exportData = {
        templates: this.getAll(),
        favorites: FavoritesManager.exportFavorites(),
        versions: VersionHistoryManager.exportVersionHistory(),
        analytics: AnalyticsManager.getQuickStats(),
        collaboration: CollaborationManager.getCollaborationStats(),
        exportedAt: new Date().toISOString(),
        version: '2.0'
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      return '';
    }
  }
}

export default TemplateManager;
