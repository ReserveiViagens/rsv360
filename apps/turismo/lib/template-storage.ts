// Sistema de armazenamento de templates conforme documentação (linha 770-784)
import { BudgetTemplate } from './types/budget';

const STORAGE_KEY = "reservei-templates";
const VERSION_KEY = "reservei-templates-version";

export const templateStorage = {
  /**
   * Obtém todos os templates do localStorage
   */
  getAll(): BudgetTemplate[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
      return [];
    }
  },

  /**
   * Obtém um template por ID
   */
  getById(id: string): BudgetTemplate | null {
    const templates = this.getAll();
    return templates.find(template => template.id === id) || null;
  },

  /**
   * Obtém templates filtrados por categoria principal
   */
  getByCategory(mainCategory: string): BudgetTemplate[] {
    const templates = this.getAll();
    return templates.filter(template => 
      template.mainCategory === mainCategory || 
      template.category === mainCategory // Compatibilidade com templates antigos
    );
  },

  /**
   * Salva um template no localStorage
   */
  save(template: BudgetTemplate): void {
    const templates = this.getAll();
    const existingIndex = templates.findIndex(t => t.id === template.id);
    
    template.updatedAt = new Date().toISOString();
    
    // Se não tem createdAt, adiciona
    if (!template.createdAt) {
      template.createdAt = new Date().toISOString();
    }
    
    if (existingIndex >= 0) {
      templates[existingIndex] = template;
    } else {
      templates.push(template);
    }
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
    } catch (error) {
      console.error('Erro ao salvar template:', error);
      throw new Error('Erro ao salvar template no localStorage');
    }
  },

  /**
   * Remove um template do localStorage
   */
  delete(id: string): boolean {
    const templates = this.getAll();
    const filteredTemplates = templates.filter(template => template.id !== id);
    
    if (filteredTemplates.length !== templates.length) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredTemplates));
        return true;
      } catch (error) {
        console.error('Erro ao excluir template:', error);
        return false;
      }
    }
    
    return false;
  },

  /**
   * Inicializa templates padrão (será implementado na FASE 4)
   * Esta função será chamada por initializeDefaultTemplates() de default-templates.ts
   */
  initializeDefaults(): void {
    // Verificar versão
    const currentVersion = localStorage.getItem(VERSION_KEY);
    const TEMPLATE_VERSION = "1.0.0";
    
    // Se já existe e a versão é a mesma, não fazer nada
    if (currentVersion === TEMPLATE_VERSION) {
      return;
    }
    
    // A inicialização real será feita por initializeDefaultTemplates()
    // em default-templates.ts na FASE 4
    // Esta função apenas atualiza a versão
    localStorage.setItem(VERSION_KEY, TEMPLATE_VERSION);
  },

  /**
   * Obtém a versão atual dos templates
   */
  getVersion(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(VERSION_KEY);
  },

  /**
   * Limpa todos os templates do localStorage
   */
  clearAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(VERSION_KEY);
    } catch (error) {
      console.error('Erro ao limpar templates:', error);
    }
  }
};

