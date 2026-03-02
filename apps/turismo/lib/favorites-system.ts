// Sistema de Favoritos para Templates

export interface FavoriteTemplate {
  templateId: string;
  userId?: string;
  favoritedAt: string;
  category: string;
  templateName: string;
  tags: string[];
}

export interface UserPreferences {
  userId: string;
  favoriteCategories: string[];
  preferredRegions: string[];
  recentlyUsed: string[];
  notifications: {
    newTemplates: boolean;
    seasonalOffers: boolean;
    popularTemplates: boolean;
  };
}

export class FavoritesManager {
  private static FAVORITES_KEY = 'rsv360_favorites';
  private static PREFERENCES_KEY = 'rsv360_user_preferences';
  private static currentUserId = 'default_user'; // Em produção, viria do sistema de auth

  // Gerenciar favoritos
  static addToFavorites(templateId: string, templateName: string, category: string, tags: string[]): void {
    try {
      const favorites = this.getFavorites();
      
      // Verificar se já está nos favoritos
      if (favorites.some(fav => fav.templateId === templateId)) {
        return; // Já está nos favoritos
      }

      const newFavorite: FavoriteTemplate = {
        templateId,
        userId: this.currentUserId,
        favoritedAt: new Date().toISOString(),
        category,
        templateName,
        tags
      };

      favorites.push(newFavorite);
      localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites));
      
      // Atualizar preferências do usuário
      this.updateUserPreferences(category, tags);
    } catch (error) {
      console.error('Erro ao adicionar aos favoritos:', error);
    }
  }

  static removeFromFavorites(templateId: string): void {
    try {
      const favorites = this.getFavorites();
      const filtered = favorites.filter(fav => fav.templateId !== templateId);
      localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Erro ao remover dos favoritos:', error);
    }
  }

  static getFavorites(userId?: string): FavoriteTemplate[] {
    try {
      const stored = localStorage.getItem(this.FAVORITES_KEY);
      const allFavorites: FavoriteTemplate[] = stored ? JSON.parse(stored) : [];
      
      const targetUserId = userId || this.currentUserId;
      return allFavorites.filter(fav => fav.userId === targetUserId);
    } catch (error) {
      console.error('Erro ao obter favoritos:', error);
      return [];
    }
  }

  static isFavorite(templateId: string): boolean {
    const favorites = this.getFavorites();
    return favorites.some(fav => fav.templateId === templateId);
  }

  static getFavoritesByCategory(category: string): FavoriteTemplate[] {
    const favorites = this.getFavorites();
    return favorites.filter(fav => fav.category === category);
  }

  static getFavoritesByTags(tags: string[]): FavoriteTemplate[] {
    const favorites = this.getFavorites();
    return favorites.filter(fav => 
      fav.tags.some(tag => tags.includes(tag))
    );
  }

  static getFavoritesCount(): number {
    return this.getFavorites().length;
  }

  static getMostFavoritedCategories(): { category: string; count: number }[] {
    const favorites = this.getFavorites();
    const categoryCount: { [key: string]: number } = {};

    favorites.forEach(fav => {
      categoryCount[fav.category] = (categoryCount[fav.category] || 0) + 1;
    });

    return Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }

  // Gerenciar preferências do usuário
  static updateUserPreferences(category: string, tags: string[]): void {
    try {
      const preferences = this.getUserPreferences();
      
      // Atualizar categorias favoritas
      if (!preferences.favoriteCategories.includes(category)) {
        preferences.favoriteCategories.push(category);
      }

      // Atualizar regiões preferidas baseado nas tags
      const regionTags = tags.filter(tag => 
        ['caldas-novas', 'bonito', 'gramado', 'fernando-noronha'].includes(tag)
      );
      
      regionTags.forEach(region => {
        if (!preferences.preferredRegions.includes(region)) {
          preferences.preferredRegions.push(region);
        }
      });

      localStorage.setItem(this.PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Erro ao atualizar preferências:', error);
    }
  }

  static getUserPreferences(): UserPreferences {
    try {
      const stored = localStorage.getItem(this.PREFERENCES_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Erro ao obter preferências:', error);
    }

    // Preferências padrão
    const defaultPreferences: UserPreferences = {
      userId: this.currentUserId,
      favoriteCategories: [],
      preferredRegions: [],
      recentlyUsed: [],
      notifications: {
        newTemplates: true,
        seasonalOffers: true,
        popularTemplates: false
      }
    };

    localStorage.setItem(this.PREFERENCES_KEY, JSON.stringify(defaultPreferences));
    return defaultPreferences;
  }

  static updateNotificationPreferences(notifications: UserPreferences['notifications']): void {
    try {
      const preferences = this.getUserPreferences();
      preferences.notifications = notifications;
      localStorage.setItem(this.PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Erro ao atualizar preferências de notificação:', error);
    }
  }

  static addToRecentlyUsed(templateId: string): void {
    try {
      const preferences = this.getUserPreferences();
      
      // Remover se já existe
      preferences.recentlyUsed = preferences.recentlyUsed.filter(id => id !== templateId);
      
      // Adicionar no início
      preferences.recentlyUsed.unshift(templateId);
      
      // Manter apenas os últimos 10
      preferences.recentlyUsed = preferences.recentlyUsed.slice(0, 10);
      
      localStorage.setItem(this.PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Erro ao adicionar aos recentes:', error);
    }
  }

  static getRecentlyUsed(): string[] {
    const preferences = this.getUserPreferences();
    return preferences.recentlyUsed;
  }

  // Recomendações baseadas em favoritos
  static getRecommendedTemplates(allTemplates: any[]): any[] {
    const preferences = this.getUserPreferences();
    const favorites = this.getFavorites();

    if (favorites.length === 0) {
      // Se não há favoritos, recomendar os mais populares
      return allTemplates
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, 6);
    }

    // Recomendar baseado em categorias e tags favoritas
    const favoriteCategories = preferences.favoriteCategories;
    const favoriteTags = favorites.flatMap(fav => fav.tags);
    const uniqueTags = [...new Set(favoriteTags)];

    return allTemplates
      .filter(template => 
        favoriteCategories.includes(template.category) ||
        template.tags.some((tag: string) => uniqueTags.includes(tag))
      )
      .filter(template => !favorites.some(fav => fav.templateId === template.id))
      .sort((a, b) => {
        // Priorizar templates com mais tags em comum
        const aCommonTags = a.tags.filter((tag: string) => uniqueTags.includes(tag)).length;
        const bCommonTags = b.tags.filter((tag: string) => uniqueTags.includes(tag)).length;
        
        if (aCommonTags !== bCommonTags) {
          return bCommonTags - aCommonTags;
        }
        
        return b.usageCount - a.usageCount;
      })
      .slice(0, 6);
  }

  // Estatísticas dos favoritos
  static getFavoritesStats(): {
    totalFavorites: number;
    favoritesByCategory: { [key: string]: number };
    favoritesByRegion: { [key: string]: number };
    recentFavorites: FavoriteTemplate[];
  } {
    const favorites = this.getFavorites();
    
    const favoritesByCategory: { [key: string]: number } = {};
    const favoritesByRegion: { [key: string]: number } = {};

    favorites.forEach(fav => {
      // Contar por categoria
      favoritesByCategory[fav.category] = (favoritesByCategory[fav.category] || 0) + 1;
      
      // Contar por região (baseado nas tags)
      const regionTags = fav.tags.filter(tag => 
        ['caldas-novas', 'bonito', 'gramado', 'fernando-noronha'].includes(tag)
      );
      
      regionTags.forEach(region => {
        favoritesByRegion[region] = (favoritesByRegion[region] || 0) + 1;
      });
    });

    // Favoritos recentes (últimos 5)
    const recentFavorites = favorites
      .sort((a, b) => new Date(b.favoritedAt).getTime() - new Date(a.favoritedAt).getTime())
      .slice(0, 5);

    return {
      totalFavorites: favorites.length,
      favoritesByCategory,
      favoritesByRegion,
      recentFavorites
    };
  }

  // Exportar/Importar favoritos
  static exportFavorites(): string {
    const favorites = this.getFavorites();
    const preferences = this.getUserPreferences();
    
    const exportData = {
      favorites,
      preferences,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    return JSON.stringify(exportData, null, 2);
  }

  static importFavorites(jsonData: string): boolean {
    try {
      const importData = JSON.parse(jsonData);
      
      if (importData.favorites && Array.isArray(importData.favorites)) {
        localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(importData.favorites));
      }
      
      if (importData.preferences) {
        localStorage.setItem(this.PREFERENCES_KEY, JSON.stringify(importData.preferences));
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao importar favoritos:', error);
      return false;
    }
  }

  // Limpar dados
  static clearAllFavorites(): void {
    localStorage.removeItem(this.FAVORITES_KEY);
  }

  static clearUserPreferences(): void {
    localStorage.removeItem(this.PREFERENCES_KEY);
  }
}

export default FavoritesManager;
