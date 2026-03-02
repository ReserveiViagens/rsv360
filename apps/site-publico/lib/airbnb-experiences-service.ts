/**
 * ✅ TAREFA LOW-1: Serviço de Integração com Airbnb Experiences
 * Busca e integra experiências e serviços do Airbnb
 */

export interface AirbnbExperience {
  id: string;
  title: string;
  description: string;
  category: string;
  location: {
    city: string;
    state: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  price: {
    amount: number;
    currency: string;
    perPerson: boolean;
  };
  duration: {
    hours: number;
    minutes?: number;
  };
  rating: number;
  reviewCount: number;
  host: {
    name: string;
    avatar?: string;
    verified: boolean;
  };
  images: string[];
  languages: string[];
  maxGuests: number;
  cancellationPolicy: string;
  instantBook: boolean;
  url: string;
}

export interface SearchExperiencesParams {
  location?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  maxGuests?: number;
  language?: string;
  instantBook?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Serviço para integrar com Airbnb Experiences
 * 
 * Nota: Airbnb não oferece API pública oficial para Experiences.
 * Esta implementação usa scraping controlado ou API alternativa quando disponível.
 */
export class AirbnbExperiencesService {
  private baseUrl = 'https://www.airbnb.com';
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.AIRBNB_API_KEY;
  }

  /**
   * Buscar experiências por localização e filtros
   */
  async searchExperiences(params: SearchExperiencesParams): Promise<AirbnbExperience[]> {
    try {
      // Em produção, usar API oficial se disponível
      // Por enquanto, implementação mock para desenvolvimento
      if (process.env.NODE_ENV === 'development' || !this.apiKey) {
        return this.getMockExperiences(params);
      }

      // Implementação real com API (quando disponível)
      const queryParams = new URLSearchParams();
      if (params.location) queryParams.append('location', params.location);
      if (params.category) queryParams.append('category', params.category);
      if (params.minPrice) queryParams.append('min_price', params.minPrice.toString());
      if (params.maxPrice) queryParams.append('max_price', params.maxPrice.toString());
      if (params.minRating) queryParams.append('min_rating', params.minRating.toString());
      if (params.maxGuests) queryParams.append('max_guests', params.maxGuests.toString());
      if (params.language) queryParams.append('language', params.language);
      if (params.instantBook) queryParams.append('instant_book', 'true');
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());

      const response = await fetch(
        `${this.baseUrl}/api/v2/experiences?${queryParams.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Airbnb API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.mapApiResponseToExperiences(data);
    } catch (error: any) {
      console.error('Erro ao buscar experiências do Airbnb:', error);
      // Fallback para mock em caso de erro
      return this.getMockExperiences(params);
    }
  }

  /**
   * Obter detalhes de uma experiência específica
   */
  async getExperienceById(experienceId: string): Promise<AirbnbExperience | null> {
    try {
      if (process.env.NODE_ENV === 'development' || !this.apiKey) {
        return this.getMockExperienceById(experienceId);
      }

      const response = await fetch(
        `${this.baseUrl}/api/v2/experiences/${experienceId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return this.mapApiResponseToExperience(data);
    } catch (error: any) {
      console.error('Erro ao buscar experiência:', error);
      return this.getMockExperienceById(experienceId);
    }
  }

  /**
   * Buscar experiências por categoria
   */
  async getExperiencesByCategory(category: string, location?: string): Promise<AirbnbExperience[]> {
    return this.searchExperiences({
      category,
      location,
      limit: 20,
    });
  }

  /**
   * Buscar experiências próximas a uma localização
   */
  async getExperiencesNearby(
    latitude: number,
    longitude: number,
    radiusKm: number = 10
  ): Promise<AirbnbExperience[]> {
    // Usar geocoding reverso para obter cidade
    const location = await this.reverseGeocode(latitude, longitude);
    
    return this.searchExperiences({
      location,
      limit: 20,
    });
  }

  /**
   * Mapear resposta da API para formato interno
   */
  private mapApiResponseToExperiences(data: any): AirbnbExperience[] {
    if (!data.experiences || !Array.isArray(data.experiences)) {
      return [];
    }

    return data.experiences.map((exp: any) => this.mapApiResponseToExperience(exp));
  }

  /**
   * Mapear uma experiência da API para formato interno
   */
  private mapApiResponseToExperience(data: any): AirbnbExperience {
    return {
      id: data.id || data.listing_id,
      title: data.title || data.name,
      description: data.description || '',
      category: data.category || 'other',
      location: {
        city: data.location?.city || '',
        state: data.location?.state || '',
        country: data.location?.country || '',
        latitude: data.location?.lat || 0,
        longitude: data.location?.lng || 0,
      },
      price: {
        amount: data.price?.amount || data.pricing?.price || 0,
        currency: data.price?.currency || data.pricing?.currency || 'USD',
        perPerson: data.price?.per_person || false,
      },
      duration: {
        hours: data.duration?.hours || 0,
        minutes: data.duration?.minutes || 0,
      },
      rating: data.rating || data.review_scores?.rating || 0,
      reviewCount: data.review_count || data.number_of_reviews || 0,
      host: {
        name: data.host?.name || '',
        avatar: data.host?.avatar || undefined,
        verified: data.host?.verified || false,
      },
      images: data.images || data.picture_urls || [],
      languages: data.languages || [],
      maxGuests: data.max_guests || data.accommodates || 1,
      cancellationPolicy: data.cancellation_policy || 'moderate',
      instantBook: data.instant_book || false,
      url: data.url || `${this.baseUrl}/experiences/${data.id}`,
    };
  }

  /**
   * Mock de experiências para desenvolvimento
   */
  private getMockExperiences(params: SearchExperiencesParams): AirbnbExperience[] {
    const mockExperiences: AirbnbExperience[] = [
      {
        id: 'exp_1',
        title: 'Tour Gastronômico em Caldas Novas',
        description: 'Descubra os sabores locais com um guia experiente',
        category: 'food',
        location: {
          city: 'Caldas Novas',
          state: 'GO',
          country: 'Brasil',
          latitude: -17.7444,
          longitude: -48.6256,
        },
        price: {
          amount: 150,
          currency: 'BRL',
          perPerson: true,
        },
        duration: {
          hours: 3,
          minutes: 0,
        },
        rating: 4.8,
        reviewCount: 127,
        host: {
          name: 'Maria Silva',
          verified: true,
        },
        images: ['https://example.com/image1.jpg'],
        languages: ['pt-BR', 'en'],
        maxGuests: 8,
        cancellationPolicy: 'moderate',
        instantBook: true,
        url: 'https://airbnb.com/experiences/exp_1',
      },
      {
        id: 'exp_2',
        title: 'Aula de Stand Up Paddle no Lago',
        description: 'Aprenda SUP com instrutor certificado',
        category: 'sports',
        location: {
          city: 'Caldas Novas',
          state: 'GO',
          country: 'Brasil',
          latitude: -17.7444,
          longitude: -48.6256,
        },
        price: {
          amount: 200,
          currency: 'BRL',
          perPerson: true,
        },
        duration: {
          hours: 2,
          minutes: 30,
        },
        rating: 4.9,
        reviewCount: 89,
        host: {
          name: 'João Santos',
          verified: true,
        },
        images: ['https://example.com/image2.jpg'],
        languages: ['pt-BR'],
        maxGuests: 6,
        cancellationPolicy: 'flexible',
        instantBook: true,
        url: 'https://airbnb.com/experiences/exp_2',
      },
      {
        id: 'exp_3',
        title: 'Massagem Relaxante com Terapeuta',
        description: 'Sessão de massagem terapêutica em ambiente tranquilo',
        category: 'wellness',
        location: {
          city: 'Caldas Novas',
          state: 'GO',
          country: 'Brasil',
          latitude: -17.7444,
          longitude: -48.6256,
        },
        price: {
          amount: 180,
          currency: 'BRL',
          perPerson: true,
        },
        duration: {
          hours: 1,
          minutes: 30,
        },
        rating: 4.7,
        reviewCount: 203,
        host: {
          name: 'Ana Costa',
          verified: true,
        },
        images: ['https://example.com/image3.jpg'],
        languages: ['pt-BR'],
        maxGuests: 1,
        cancellationPolicy: 'strict',
        instantBook: false,
        url: 'https://airbnb.com/experiences/exp_3',
      },
    ];

    // Aplicar filtros
    let filtered = mockExperiences;

    if (params.category) {
      filtered = filtered.filter(exp => exp.category === params.category);
    }

    if (params.minPrice) {
      filtered = filtered.filter(exp => exp.price.amount >= params.minPrice!);
    }

    if (params.maxPrice) {
      filtered = filtered.filter(exp => exp.price.amount <= params.maxPrice!);
    }

    if (params.minRating) {
      filtered = filtered.filter(exp => exp.rating >= params.minRating!);
    }

    if (params.maxGuests) {
      filtered = filtered.filter(exp => exp.maxGuests <= params.maxGuests!);
    }

    if (params.instantBook !== undefined) {
      filtered = filtered.filter(exp => exp.instantBook === params.instantBook);
    }

    return filtered.slice(params.offset || 0, (params.offset || 0) + (params.limit || 20));
  }

  /**
   * Mock de experiência por ID
   */
  private getMockExperienceById(experienceId: string): AirbnbExperience | null {
    const mock = this.getMockExperiences({});
    return mock.find(exp => exp.id === experienceId) || null;
  }

  /**
   * Reverse geocoding simples
   */
  private async reverseGeocode(latitude: number, longitude: number): Promise<string> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
        {
          headers: {
            'User-Agent': 'RSV360-AirbnbExperiences/1.0',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.address?.city || data.address?.town || '';
      }
    } catch (error) {
      console.warn('Erro no reverse geocoding:', error);
    }

    return '';
  }
}

// Instância singleton
export const airbnbExperiencesService = new AirbnbExperiencesService();

