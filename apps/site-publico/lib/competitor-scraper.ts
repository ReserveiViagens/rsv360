/**
 * Serviço de Scraping de Competidores
 * Coleta preços de Airbnb, Booking.com e outras plataformas
 */

import { queryDatabase } from './db';
import type { CompetitorPrice } from './smart-pricing-service';

export interface ScrapingConfig {
  propertyId: number;
  location: string;
  latitude?: number;
  longitude?: number;
  checkIn: Date;
  checkOut: Date;
  platforms: ('airbnb' | 'booking' | 'expedia' | 'vrbo')[];
  enabled: boolean;
}

export interface ScrapingResult {
  platform: string;
  success: boolean;
  prices: CompetitorPrice[];
  error?: string;
  scrapedAt: Date;
}

/**
 * Scraper base abstrato
 */
abstract class BaseScraper {
  abstract platform: string;
  
  /**
   * Scrapear preços (implementação específica por plataforma)
   */
  abstract scrape(config: ScrapingConfig): Promise<CompetitorPrice[]>;
  
  /**
   * Validar se scraping é permitido (rate limiting, etc)
   */
  protected async canScrape(): Promise<boolean> {
    // Verificar rate limiting
    const lastScrape = await queryDatabase(
      `SELECT scraped_at FROM competitor_prices 
       WHERE competitor_name = $1 
       ORDER BY scraped_at DESC LIMIT 1`,
      [this.platform]
    );
    
    if (lastScrape.length > 0) {
      const lastScrapeTime = new Date(lastScrape[0].scraped_at);
      const hoursSinceLastScrape = (Date.now() - lastScrapeTime.getTime()) / (1000 * 60 * 60);
      
      // Limitar a 1 scrape por hora por plataforma
      if (hoursSinceLastScrape < 1) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Salvar preços coletados
   */
  protected async savePrices(
    propertyId: number,
    prices: CompetitorPrice[]
  ): Promise<void> {
    for (const price of prices) {
      await queryDatabase(
        `INSERT INTO competitor_prices 
         (item_id, competitor_name, price, currency, availability_status, scraped_at)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
         ON CONFLICT (item_id, competitor_name, DATE(scraped_at))
         DO UPDATE SET 
           price = $3,
           availability_status = $4,
           scraped_at = CURRENT_TIMESTAMP`,
        [
          propertyId,
          price.competitor_name,
          price.price,
          price.currency,
          price.availability_status,
        ]
      );
    }
  }
}

/**
 * Scraper para Airbnb (Mock - em produção usar API oficial ou scraping real)
 */
class AirbnbScraper extends BaseScraper {
  platform = 'airbnb';
  
  async scrape(config: ScrapingConfig): Promise<CompetitorPrice[]> {
    if (!(await this.canScrape())) {
      // Retornar preços já coletados
      return await this.getCachedPrices(config.propertyId);
    }
    
    try {
      // TODO: Implementar scraping real do Airbnb
      // Por enquanto, retornar dados mock baseados em padrões conhecidos
      const prices = await this.scrapeMock(config);
      
      // Salvar preços
      await this.savePrices(config.propertyId, prices);
      
      return prices;
    } catch (error: any) {
      console.error(`Erro ao scrapear Airbnb:`, error);
      // Fallback para dados em cache
      return await this.getCachedPrices(config.propertyId);
    }
  }
  
  /**
   * Scraping mock (simular dados reais)
   */
  private async scrapeMock(config: ScrapingConfig): Promise<CompetitorPrice[]> {
    // Buscar preço base da propriedade
    const property = await queryDatabase(
      `SELECT base_price FROM properties WHERE id = $1`,
      [config.propertyId]
    );
    
    const basePrice = parseFloat(property[0]?.base_price || '100');
    
    // Simular variação de preços do Airbnb (geralmente 10-30% mais caro)
    const airbnbPrice = basePrice * (1 + Math.random() * 0.2 + 0.1);
    
    return [
      {
        id: 0,
        competitor_name: 'airbnb',
        price: Math.round(airbnbPrice * 100) / 100,
        currency: 'BRL',
        availability_status: Math.random() > 0.3 ? 'available' : 'limited',
        scraped_at: new Date().toISOString(),
      },
    ];
  }
  
  private async getCachedPrices(propertyId: number): Promise<CompetitorPrice[]> {
    const cached = await queryDatabase(
      `SELECT * FROM competitor_prices 
       WHERE item_id = $1 AND competitor_name = 'airbnb'
       ORDER BY scraped_at DESC LIMIT 5`,
      [propertyId]
    );
    
    return cached as CompetitorPrice[];
  }
}

/**
 * Scraper para Booking.com (Mock - em produção usar API oficial ou scraping real)
 */
class BookingScraper extends BaseScraper {
  platform = 'booking';
  
  async scrape(config: ScrapingConfig): Promise<CompetitorPrice[]> {
    if (!(await this.canScrape())) {
      return await this.getCachedPrices(config.propertyId);
    }
    
    try {
      const prices = await this.scrapeMock(config);
      await this.savePrices(config.propertyId, prices);
      return prices;
    } catch (error: any) {
      console.error(`Erro ao scrapear Booking.com:`, error);
      return await this.getCachedPrices(config.propertyId);
    }
  }
  
  private async scrapeMock(config: ScrapingConfig): Promise<CompetitorPrice[]> {
    const property = await queryDatabase(
      `SELECT base_price FROM properties WHERE id = $1`,
      [config.propertyId]
    );
    
    const basePrice = parseFloat(property[0]?.base_price || '100');
    
    // Booking.com geralmente tem preços similares ou ligeiramente mais baratos
    const bookingPrice = basePrice * (1 + Math.random() * 0.1 - 0.05);
    
    return [
      {
        id: 0,
        competitor_name: 'booking',
        price: Math.round(bookingPrice * 100) / 100,
        currency: 'BRL',
        availability_status: Math.random() > 0.2 ? 'available' : 'limited',
        scraped_at: new Date().toISOString(),
      },
    ];
  }
  
  private async getCachedPrices(propertyId: number): Promise<CompetitorPrice[]> {
    const cached = await queryDatabase(
      `SELECT * FROM competitor_prices 
       WHERE item_id = $1 AND competitor_name = 'booking'
       ORDER BY scraped_at DESC LIMIT 5`,
      [propertyId]
    );
    
    return cached as CompetitorPrice[];
  }
}

/**
 * Scraper para Expedia (Mock)
 */
class ExpediaScraper extends BaseScraper {
  platform = 'expedia';
  
  async scrape(config: ScrapingConfig): Promise<CompetitorPrice[]> {
    if (!(await this.canScrape())) {
      return await this.getCachedPrices(config.propertyId);
    }
    
    try {
      const prices = await this.scrapeMock(config);
      await this.savePrices(config.propertyId, prices);
      return prices;
    } catch (error: any) {
      console.error(`Erro ao scrapear Expedia:`, error);
      return await this.getCachedPrices(config.propertyId);
    }
  }
  
  private async scrapeMock(config: ScrapingConfig): Promise<CompetitorPrice[]> {
    const property = await queryDatabase(
      `SELECT base_price FROM properties WHERE id = $1`,
      [config.propertyId]
    );
    
    const basePrice = parseFloat(property[0]?.base_price || '100');
    const expediaPrice = basePrice * (1 + Math.random() * 0.15);
    
    return [
      {
        id: 0,
        competitor_name: 'expedia',
        price: Math.round(expediaPrice * 100) / 100,
        currency: 'BRL',
        availability_status: 'available',
        scraped_at: new Date().toISOString(),
      },
    ];
  }
  
  private async getCachedPrices(propertyId: number): Promise<CompetitorPrice[]> {
    const cached = await queryDatabase(
      `SELECT * FROM competitor_prices 
       WHERE item_id = $1 AND competitor_name = 'expedia'
       ORDER BY scraped_at DESC LIMIT 5`,
      [propertyId]
    );
    
    return cached as CompetitorPrice[];
  }
}

/**
 * Scraper para VRBO (Mock)
 */
class VRBOScraper extends BaseScraper {
  platform = 'vrbo';
  
  async scrape(config: ScrapingConfig): Promise<CompetitorPrice[]> {
    if (!(await this.canScrape())) {
      return await this.getCachedPrices(config.propertyId);
    }
    
    try {
      const prices = await this.scrapeMock(config);
      await this.savePrices(config.propertyId, prices);
      return prices;
    } catch (error: any) {
      console.error(`Erro ao scrapear VRBO:`, error);
      return await this.getCachedPrices(config.propertyId);
    }
  }
  
  private async scrapeMock(config: ScrapingConfig): Promise<CompetitorPrice[]> {
    const property = await queryDatabase(
      `SELECT base_price FROM properties WHERE id = $1`,
      [config.propertyId]
    );
    
    const basePrice = parseFloat(property[0]?.base_price || '100');
    const vrboPrice = basePrice * (1 + Math.random() * 0.25 + 0.05);
    
    return [
      {
        id: 0,
        competitor_name: 'vrbo',
        price: Math.round(vrboPrice * 100) / 100,
        currency: 'BRL',
        availability_status: Math.random() > 0.4 ? 'available' : 'limited',
        scraped_at: new Date().toISOString(),
      },
    ];
  }
  
  private async getCachedPrices(propertyId: number): Promise<CompetitorPrice[]> {
    const cached = await queryDatabase(
      `SELECT * FROM competitor_prices 
       WHERE item_id = $1 AND competitor_name = 'vrbo'
       ORDER BY scraped_at DESC LIMIT 5`,
      [propertyId]
    );
    
    return cached as CompetitorPrice[];
  }
}

/**
 * Serviço principal de scraping
 */
export class CompetitorScraperService {
  private scrapers: Map<string, BaseScraper> = new Map();
  
  constructor() {
    this.scrapers.set('airbnb', new AirbnbScraper());
    this.scrapers.set('booking', new BookingScraper());
    this.scrapers.set('expedia', new ExpediaScraper());
    this.scrapers.set('vrbo', new VRBOScraper());
  }
  
  /**
   * Scrapear preços de múltiplas plataformas
   */
  async scrapeCompetitors(config: ScrapingConfig): Promise<ScrapingResult[]> {
    const results: ScrapingResult[] = [];
    
    for (const platform of config.platforms) {
      const scraper = this.scrapers.get(platform);
      if (!scraper) {
        results.push({
          platform,
          success: false,
          prices: [],
          error: `Scraper não encontrado para ${platform}`,
          scrapedAt: new Date(),
        });
        continue;
      }
      
      try {
        const prices = await scraper.scrape(config);
        results.push({
          platform,
          success: true,
          prices,
          scrapedAt: new Date(),
        });
      } catch (error: any) {
        results.push({
          platform,
          success: false,
          prices: [],
          error: error.message,
          scrapedAt: new Date(),
        });
      }
    }
    
    return results;
  }
  
  /**
   * Scrapear preços de uma plataforma específica
   */
  async scrapePlatform(
    platform: string,
    config: ScrapingConfig
  ): Promise<CompetitorPrice[]> {
    const scraper = this.scrapers.get(platform);
    if (!scraper) {
      throw new Error(`Scraper não encontrado para ${platform}`);
    }
    
    return await scraper.scrape(config);
  }
  
  /**
   * Obter preços em cache (sem scraping)
   */
  async getCachedPrices(
    propertyId: number,
    platforms?: string[]
  ): Promise<CompetitorPrice[]> {
    let query = `SELECT * FROM competitor_prices WHERE item_id = $1`;
    const params: any[] = [propertyId];
    
    if (platforms && platforms.length > 0) {
      query += ` AND competitor_name = ANY($2)`;
      params.push(platforms);
    }
    
    query += ` ORDER BY scraped_at DESC LIMIT 20`;
    
    return await queryDatabase(query, params) as CompetitorPrice[];
  }
}

// Instância singleton
export const competitorScraperService = new CompetitorScraperService();

