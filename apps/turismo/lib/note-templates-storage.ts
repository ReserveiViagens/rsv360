// Sistema de armazenamento de templates de notas conforme documentação (linha 787-798)

/**
 * Interface para template de nota
 */
export interface NoteTemplate {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Classe para gerenciar templates de notas reutilizáveis
 */
class NoteTemplatesStorage {
  private storageKey = "budget-note-templates";

  /**
   * Obtém todos os templates de notas
   */
  getAll(): NoteTemplate[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao carregar templates de notas:', error);
      return [];
    }
  }

  /**
   * Obtém um template de nota por ID
   */
  getById(id: string): NoteTemplate | null {
    const templates = this.getAll();
    return templates.find(template => template.id === id) || null;
  }

  /**
   * Salva um template de nota
   */
  save(template: NoteTemplate): void {
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
      localStorage.setItem(this.storageKey, JSON.stringify(templates));
    } catch (error) {
      console.error('Erro ao salvar template de nota:', error);
      throw new Error('Erro ao salvar template de nota no localStorage');
    }
  }

  /**
   * Remove um template de nota
   */
  delete(id: string): boolean {
    const templates = this.getAll();
    const filteredTemplates = templates.filter(template => template.id !== id);
    
    if (filteredTemplates.length !== templates.length) {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(filteredTemplates));
        return true;
      } catch (error) {
        console.error('Erro ao excluir template de nota:', error);
        return false;
      }
    }
    
    return false;
  }

  /**
   * Limpa todos os templates de notas
   */
  clearAll(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Erro ao limpar templates de notas:', error);
    }
  }
}

// Exporta instância única (singleton)
export const noteTemplatesStorage = new NoteTemplatesStorage();

