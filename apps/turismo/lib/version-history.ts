// Sistema de Histórico de Versões para Templates

import { Template } from './templates-data';

export interface TemplateVersion {
  id: string;
  templateId: string;
  version: number;
  templateData: Template;
  changes: TemplateChange[];
  createdBy: string;
  createdAt: string;
  changeDescription: string;
  isActive: boolean;
  tags: string[];
}

export interface TemplateChange {
  field: string;
  oldValue: any;
  newValue: any;
  changeType: 'added' | 'modified' | 'removed';
  description: string;
}

export interface VersionComparison {
  templateId: string;
  version1: number;
  version2: number;
  differences: TemplateChange[];
  summary: {
    added: number;
    modified: number;
    removed: number;
  };
}

export class VersionHistoryManager {
  private static VERSIONS_KEY = 'rsv360_template_versions';
  private static currentUserId = 'default_user';

  // Salvar nova versão do template
  static saveVersion(
    template: Template, 
    changes: TemplateChange[], 
    changeDescription: string
  ): TemplateVersion {
    try {
      const versions = this.getAllVersions();
      const templateVersions = versions.filter(v => v.templateId === template.id);
      
      // Desativar versão anterior
      templateVersions.forEach(v => v.isActive = false);
      
      const newVersion: TemplateVersion = {
        id: this.generateVersionId(),
        templateId: template.id,
        version: templateVersions.length + 1,
        templateData: { ...template },
        changes,
        createdBy: this.currentUserId,
        createdAt: new Date().toISOString(),
        changeDescription,
        isActive: true,
        tags: template.tags
      };

      // Adicionar nova versão
      const updatedVersions = versions.filter(v => v.templateId !== template.id);
      updatedVersions.push(...templateVersions, newVersion);
      
      localStorage.setItem(this.VERSIONS_KEY, JSON.stringify(updatedVersions));
      
      return newVersion;
    } catch (error) {
      console.error('Erro ao salvar versão:', error);
      throw error;
    }
  }

  // Obter todas as versões de um template
  static getTemplateVersions(templateId: string): TemplateVersion[] {
    try {
      const versions = this.getAllVersions();
      return versions
        .filter(v => v.templateId === templateId)
        .sort((a, b) => b.version - a.version);
    } catch (error) {
      console.error('Erro ao obter versões do template:', error);
      return [];
    }
  }

  // Obter versão específica
  static getVersion(templateId: string, version: number): TemplateVersion | null {
    try {
      const versions = this.getTemplateVersions(templateId);
      return versions.find(v => v.version === version) || null;
    } catch (error) {
      console.error('Erro ao obter versão específica:', error);
      return null;
    }
  }

  // Obter versão ativa (atual)
  static getActiveVersion(templateId: string): TemplateVersion | null {
    try {
      const versions = this.getTemplateVersions(templateId);
      return versions.find(v => v.isActive) || null;
    } catch (error) {
      console.error('Erro ao obter versão ativa:', error);
      return null;
    }
  }

  // Restaurar versão anterior
  static restoreVersion(templateId: string, version: number): Template | null {
    try {
      const targetVersion = this.getVersion(templateId, version);
      if (!targetVersion) return null;

      // Criar nova versão baseada na versão restaurada
      const restoredTemplate = { ...targetVersion.templateData };
      restoredTemplate.updatedAt = new Date().toISOString();

      const changes: TemplateChange[] = [{
        field: 'template',
        oldValue: 'current_version',
        newValue: `version_${version}`,
        changeType: 'modified',
        description: `Restaurado para versão ${version}`
      }];

      this.saveVersion(
        restoredTemplate,
        changes,
        `Restaurado para versão ${version}`
      );

      return restoredTemplate;
    } catch (error) {
      console.error('Erro ao restaurar versão:', error);
      return null;
    }
  }

  // Comparar duas versões
  static compareVersions(
    templateId: string, 
    version1: number, 
    version2: number
  ): VersionComparison | null {
    try {
      const v1 = this.getVersion(templateId, version1);
      const v2 = this.getVersion(templateId, version2);

      if (!v1 || !v2) return null;

      const differences: TemplateChange[] = [];
      
      // Comparar campos principais
      const fieldsToCompare = [
        'name', 'description', 'category', 'tags', 'budget'
      ];

      fieldsToCompare.forEach(field => {
        const oldValue = v1.templateData[field as keyof Template];
        const newValue = v2.templateData[field as keyof Template];

        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          differences.push({
            field,
            oldValue,
            newValue,
            changeType: 'modified',
            description: `Campo ${field} foi modificado`
          });
        }
      });

      // Comparar itens do budget
      if (v1.templateData.budget?.items && v2.templateData.budget?.items) {
        const items1 = v1.templateData.budget.items;
        const items2 = v2.templateData.budget.items;

        // Itens adicionados
        items2.forEach(item2 => {
          if (!items1.find(item1 => item1.id === item2.id)) {
            differences.push({
              field: 'budget.items',
              oldValue: null,
              newValue: item2,
              changeType: 'added',
              description: `Item "${item2.name}" foi adicionado`
            });
          }
        });

        // Itens removidos
        items1.forEach(item1 => {
          if (!items2.find(item2 => item2.id === item1.id)) {
            differences.push({
              field: 'budget.items',
              oldValue: item1,
              newValue: null,
              changeType: 'removed',
              description: `Item "${item1.name}" foi removido`
            });
          }
        });

        // Itens modificados
        items1.forEach(item1 => {
          const item2 = items2.find(i => i.id === item1.id);
          if (item2 && JSON.stringify(item1) !== JSON.stringify(item2)) {
            differences.push({
              field: 'budget.items',
              oldValue: item1,
              newValue: item2,
              changeType: 'modified',
              description: `Item "${item1.name}" foi modificado`
            });
          }
        });
      }

      const summary = {
        added: differences.filter(d => d.changeType === 'added').length,
        modified: differences.filter(d => d.changeType === 'modified').length,
        removed: differences.filter(d => d.changeType === 'removed').length
      };

      return {
        templateId,
        version1,
        version2,
        differences,
        summary
      };
    } catch (error) {
      console.error('Erro ao comparar versões:', error);
      return null;
    }
  }

  // Obter histórico de mudanças
  static getChangeHistory(templateId: string): {
    version: number;
    date: string;
    author: string;
    description: string;
    changes: TemplateChange[];
  }[] {
    try {
      const versions = this.getTemplateVersions(templateId);
      
      return versions.map(v => ({
        version: v.version,
        date: v.createdAt,
        author: v.createdBy,
        description: v.changeDescription,
        changes: v.changes
      }));
    } catch (error) {
      console.error('Erro ao obter histórico de mudanças:', error);
      return [];
    }
  }

  // Detectar mudanças automaticamente
  static detectChanges(oldTemplate: Template, newTemplate: Template): TemplateChange[] {
    const changes: TemplateChange[] = [];

    // Comparar campos básicos
    const basicFields: (keyof Template)[] = ['name', 'description', 'category'];
    
    basicFields.forEach(field => {
      if (oldTemplate[field] !== newTemplate[field]) {
        changes.push({
          field: field as string,
          oldValue: oldTemplate[field],
          newValue: newTemplate[field],
          changeType: 'modified',
          description: `${field} alterado de "${oldTemplate[field]}" para "${newTemplate[field]}"`
        });
      }
    });

    // Comparar tags
    const oldTags = oldTemplate.tags || [];
    const newTags = newTemplate.tags || [];
    
    const addedTags = newTags.filter(tag => !oldTags.includes(tag));
    const removedTags = oldTags.filter(tag => !newTags.includes(tag));

    addedTags.forEach(tag => {
      changes.push({
        field: 'tags',
        oldValue: null,
        newValue: tag,
        changeType: 'added',
        description: `Tag "${tag}" adicionada`
      });
    });

    removedTags.forEach(tag => {
      changes.push({
        field: 'tags',
        oldValue: tag,
        newValue: null,
        changeType: 'removed',
        description: `Tag "${tag}" removida`
      });
    });

    // Comparar budget
    if (oldTemplate.budget && newTemplate.budget) {
      if (oldTemplate.budget.title !== newTemplate.budget.title) {
        changes.push({
          field: 'budget.title',
          oldValue: oldTemplate.budget.title,
          newValue: newTemplate.budget.title,
          changeType: 'modified',
          description: 'Título do orçamento alterado'
        });
      }

      // Comparar itens do budget
      const oldItems = oldTemplate.budget.items || [];
      const newItems = newTemplate.budget.items || [];

      if (oldItems.length !== newItems.length) {
        changes.push({
          field: 'budget.items',
          oldValue: oldItems.length,
          newValue: newItems.length,
          changeType: 'modified',
          description: `Número de itens alterado de ${oldItems.length} para ${newItems.length}`
        });
      }
    }

    return changes;
  }

  // Estatísticas de versões
  static getVersionStats(): {
    totalVersions: number;
    templatesWithVersions: number;
    averageVersionsPerTemplate: number;
    mostVersionedTemplate: { templateId: string; versions: number } | null;
    recentVersions: TemplateVersion[];
  } {
    try {
      const allVersions = this.getAllVersions();
      const templateIds = [...new Set(allVersions.map(v => v.templateId))];
      
      const versionCounts = templateIds.map(id => ({
        templateId: id,
        versions: allVersions.filter(v => v.templateId === id).length
      }));

      const mostVersioned = versionCounts.reduce((max, current) => 
        current.versions > (max?.versions || 0) ? current : max, null
      );

      const recentVersions = allVersions
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);

      return {
        totalVersions: allVersions.length,
        templatesWithVersions: templateIds.length,
        averageVersionsPerTemplate: templateIds.length > 0 ? allVersions.length / templateIds.length : 0,
        mostVersionedTemplate: mostVersioned,
        recentVersions
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas de versões:', error);
      return {
        totalVersions: 0,
        templatesWithVersions: 0,
        averageVersionsPerTemplate: 0,
        mostVersionedTemplate: null,
        recentVersions: []
      };
    }
  }

  // Funções auxiliares
  private static getAllVersions(): TemplateVersion[] {
    try {
      const stored = localStorage.getItem(this.VERSIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Erro ao obter todas as versões:', error);
      return [];
    }
  }

  private static generateVersionId(): string {
    return `version_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Limpeza e manutenção
  static cleanupOldVersions(keepVersions: number = 10): void {
    try {
      const allVersions = this.getAllVersions();
      const templateIds = [...new Set(allVersions.map(v => v.templateId))];
      
      const cleanedVersions: TemplateVersion[] = [];

      templateIds.forEach(templateId => {
        const templateVersions = allVersions
          .filter(v => v.templateId === templateId)
          .sort((a, b) => b.version - a.version);
        
        // Manter apenas as versões mais recentes
        const versionsToKeep = templateVersions.slice(0, keepVersions);
        cleanedVersions.push(...versionsToKeep);
      });

      localStorage.setItem(this.VERSIONS_KEY, JSON.stringify(cleanedVersions));
    } catch (error) {
      console.error('Erro ao limpar versões antigas:', error);
    }
  }

  static exportVersionHistory(templateId?: string): string {
    try {
      const versions = templateId 
        ? this.getTemplateVersions(templateId)
        : this.getAllVersions();

      const exportData = {
        versions,
        exportedAt: new Date().toISOString(),
        templateId: templateId || 'all',
        version: '1.0'
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Erro ao exportar histórico:', error);
      return '';
    }
  }
}

export default VersionHistoryManager;
