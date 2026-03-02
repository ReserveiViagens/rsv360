// Sistema de armazenamento para cotações RSV 360
import { Budget, BudgetTemplate, BudgetStats } from './types/budget';

const STORAGE_KEYS = {
  BUDGETS: 'rsv360_budgets',
  TEMPLATES: 'rsv360_budget_templates',
  SETTINGS: 'rsv360_budget_settings',
  COMPANY_INFO: 'rsv360_company_info',
} as const;

class BudgetStorage {
  // Métodos para cotações
  getAll(): Budget[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao carregar cotações:', error);
      return [];
    }
  }

  getById(id: string): Budget | null {
    const budgets = this.getAll();
    return budgets.find(budget => budget.id === id) || null;
  }

  save(budget: Budget): void {
    const budgets = this.getAll();
    const existingIndex = budgets.findIndex(b => b.id === budget.id);
    
    budget.updatedAt = new Date().toISOString();
    
    if (existingIndex >= 0) {
      budgets[existingIndex] = budget;
    } else {
      budgets.push(budget);
    }
    
    this.saveAll(budgets);
  }

  delete(id: string): boolean {
    const budgets = this.getAll();
    const filteredBudgets = budgets.filter(budget => budget.id !== id);
    
    if (filteredBudgets.length !== budgets.length) {
      this.saveAll(filteredBudgets);
      return true;
    }
    
    return false;
  }

  duplicate(id: string): Budget | null {
    const original = this.getById(id);
    if (!original) return null;
    
    const duplicate: Budget = {
      ...original,
      id: this.generateId(),
      title: `${original.title} (Cópia)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    this.save(duplicate);
    return duplicate;
  }

  // Métodos para templates
  getTemplates(): BudgetTemplate[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
      return data ? JSON.parse(data) : this.getDefaultTemplates();
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
      return this.getDefaultTemplates();
    }
  }

  saveTemplate(template: BudgetTemplate): void {
    const templates = this.getTemplates();
    const existingIndex = templates.findIndex(t => t.id === template.id);
    
    template.updatedAt = new Date().toISOString();
    
    if (existingIndex >= 0) {
      templates[existingIndex] = template;
    } else {
      templates.push(template);
    }
    
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
  }

  // Estatísticas
  getStats(): BudgetStats {
    const budgets = this.getAll();
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    const thisMonthBudgets = budgets.filter(b => new Date(b.createdAt) >= thisMonth);
    const lastMonthBudgets = budgets.filter(b => {
      const date = new Date(b.createdAt);
      return date >= lastMonth && date < thisMonth;
    });
    
    const byType = budgets.reduce((acc, budget) => {
      if (!acc[budget.type]) {
        acc[budget.type] = { count: 0, value: 0 };
      }
      acc[budget.type].count++;
      acc[budget.type].value += budget.total;
      return acc;
    }, {} as BudgetStats['byType']);
    
    return {
      total: budgets.length,
      totalValue: budgets.reduce((sum, b) => sum + b.total, 0),
      approved: budgets.filter(b => b.status === 'approved').length,
      pending: budgets.filter(b => b.status === 'sent').length,
      rejected: budgets.filter(b => b.status === 'rejected').length,
      draft: budgets.filter(b => b.status === 'draft').length,
      
      thisMonth: {
        total: thisMonthBudgets.length,
        value: thisMonthBudgets.reduce((sum, b) => sum + b.total, 0),
      },
      
      lastMonth: {
        total: lastMonthBudgets.length,
        value: lastMonthBudgets.reduce((sum, b) => sum + b.total, 0),
      },
      
      byType,
    };
  }

  // Busca e filtros
  search(query: string): Budget[] {
    const budgets = this.getAll();
    const searchTerm = query.toLowerCase();
    
    return budgets.filter(budget =>
      budget.title.toLowerCase().includes(searchTerm) ||
      budget.clientName.toLowerCase().includes(searchTerm) ||
      budget.clientEmail.toLowerCase().includes(searchTerm) ||
      budget.description?.toLowerCase().includes(searchTerm)
    );
  }

  filter(filters: {
    status?: string[];
    type?: string[];
    dateRange?: { start: string; end: string };
    minValue?: number;
    maxValue?: number;
  }): Budget[] {
    let budgets = this.getAll();
    
    if (filters.status?.length) {
      budgets = budgets.filter(b => filters.status!.includes(b.status));
    }
    
    if (filters.type?.length) {
      budgets = budgets.filter(b => filters.type!.includes(b.type));
    }
    
    if (filters.dateRange) {
      const start = new Date(filters.dateRange.start);
      const end = new Date(filters.dateRange.end);
      budgets = budgets.filter(b => {
        const date = new Date(b.createdAt);
        return date >= start && date <= end;
      });
    }
    
    if (filters.minValue !== undefined) {
      budgets = budgets.filter(b => b.total >= filters.minValue!);
    }
    
    if (filters.maxValue !== undefined) {
      budgets = budgets.filter(b => b.total <= filters.maxValue!);
    }
    
    return budgets;
  }

  // Utilitários
  private saveAll(budgets: Budget[]): void {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  }

  private generateId(): string {
    // Fallback para ambientes que não suportam crypto.randomUUID()
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    
    // Geração manual de UUID v4
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private getDefaultTemplates(): BudgetTemplate[] {
    return [
      {
        id: '1',
        name: 'Resort All Inclusive',
        description: 'Template para resorts com sistema all inclusive',
        category: 'Hotéis',
        type: 'hotel',
        defaultItems: [
          {
            name: 'Hospedagem All Inclusive',
            description: '3 diárias em apartamento duplo',
            category: 'Hospedagem',
            quantity: 3,
            unitPrice: 450,
            totalPrice: 1350,
            details: {
              checkIn: '',
              checkOut: '',
              roomType: 'Apartamento Duplo',
              guests: 2,
            }
          }
        ],
        defaultTerms: 'Pagamento: 50% na reserva, 50% no check-in. Cancelamento gratuito até 7 dias antes.',
        defaultNotes: 'Inclui café da manhã, almoço e jantar. Bebidas incluídas.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        usageCount: 0,
      },
      {
        id: '2',
        name: 'Parque Temático Família',
        description: 'Cotação para família em parques temáticos',
        category: 'Parques',
        type: 'parque',
        defaultItems: [
          {
            name: 'Ingresso Adulto',
            description: 'Acesso completo ao parque',
            category: 'Ingressos',
            quantity: 2,
            unitPrice: 120,
            totalPrice: 240,
            details: {
              date: '',
              ageGroup: 'Adulto',
            }
          },
          {
            name: 'Ingresso Criança',
            description: 'Acesso completo ao parque (6-12 anos)',
            category: 'Ingressos',
            quantity: 1,
            unitPrice: 80,
            totalPrice: 80,
            details: {
              date: '',
              ageGroup: 'Criança',
            }
          }
        ],
        defaultTerms: 'Ingressos válidos apenas para a data selecionada. Não reembolsável.',
        defaultNotes: 'Crianças até 5 anos não pagam. Estacionamento não incluso.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        usageCount: 0,
      }
    ];
  }

  // Dados de exemplo
  loadSampleData(): void {
    const sampleBudgets: Budget[] = [
      {
        id: this.generateId(),
        title: 'Pacote Resort Bahia - Família Silva',
        clientName: 'Maria Silva',
        clientEmail: 'maria.silva@email.com',
        clientPhone: '(11) 99999-9999',
        type: 'hotel',
        category: 'Resort',
        description: 'Pacote completo para família de 4 pessoas',
        subtotal: 4200,
        discount: 200,
        taxes: 0,
        total: 4000,
        currency: 'BRL',
        status: 'approved',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
        items: [
          {
            id: this.generateId(),
            name: 'Hospedagem All Inclusive',
            description: '5 diárias em suíte família',
            category: 'Hospedagem',
            quantity: 5,
            unitPrice: 800,
            totalPrice: 4000,
            details: {
              checkIn: '2024-02-15',
              checkOut: '2024-02-20',
              roomType: 'Suíte Família',
              guests: 4,
            }
          }
        ],
        terms: 'Pagamento: 50% na reserva, 50% no check-in. Cancelamento gratuito até 7 dias antes.',
        notes: 'Inclui todas as refeições e bebidas. Atividades para crianças incluídas.',
      },
      {
        id: this.generateId(),
        title: 'Beto Carrero World - Grupo Escolar',
        clientName: 'João Santos',
        clientEmail: 'joao.santos@escola.com',
        clientPhone: '(47) 88888-8888',
        type: 'parque',
        category: 'Parque Temático',
        description: 'Excursão escolar para 30 alunos',
        subtotal: 2700,
        discount: 300,
        taxes: 0,
        total: 2400,
        currency: 'BRL',
        status: 'sent',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
        items: [
          {
            id: this.generateId(),
            name: 'Ingresso Estudante',
            description: 'Acesso completo ao parque com desconto escolar',
            category: 'Ingressos',
            quantity: 30,
            unitPrice: 80,
            totalPrice: 2400,
            details: {
              date: '2024-03-10',
              ageGroup: 'Estudante',
            }
          }
        ],
        terms: 'Pagamento à vista com 10% de desconto. Válido apenas para a data agendada.',
        notes: 'Acompanhantes gratuitos: 1 para cada 10 alunos. Almoço não incluso.',
      }
    ];
    
    sampleBudgets.forEach(budget => this.save(budget));
  }

  // Limpar dados
  clearAll(): void {
    localStorage.removeItem(STORAGE_KEYS.BUDGETS);
    localStorage.removeItem(STORAGE_KEYS.TEMPLATES);
  }
}

export const budgetStorage = new BudgetStorage();
