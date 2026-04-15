import { db } from '../../../../backend/src/db/drizzle';
import { pricingOtaRates, pricingCompetitors } from '../db/schema';
import { OtaRate } from '../types';
import { eq } from 'drizzle-orm';

function simulatePrice(basePrice: number = 250): number {
  const variation = 0.7 + Math.random() * 0.6; // 70% a 130% do base
  return Math.round(basePrice * variation * 100) / 100;
}

function simulateAvailability(): boolean {
  return Math.random() > 0.15; // 85% disponível
}

export class OtaScraperService {
  async scrapeBooking(competitorId: string, checkIn: string, checkOut: string): Promise<OtaRate | null> {
    try {
      const competitor = await db
        .select()
        .from(pricingCompetitors)
        .where(eq(pricingCompetitors.id, competitorId))
        .limit(1);

      if (!competitor[0]) {
        throw new Error(`Competitor with ID ${competitorId} not found`);
      }

      // Simulate scraping delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      const basePrice = 250; // In production, this would come from competitor metadata or historical data
      const price = simulatePrice(basePrice);
      const availability = simulateAvailability();

      const rateData = {
        competitorId,
        platform: 'booking' as const,
        checkInDate: new Date(checkIn),
        checkOutDate: new Date(checkOut),
        price,
        originalPrice: availability ? price * 1.1 : null, // Simulate discount
        currency: 'BRL',
        availability,
        occupancyEstimate: availability ? Math.floor(Math.random() * 100) : null,
        scrapeStatus: 'completed' as const,
        source: 'scraper',
        metadata: {
          roomType: 'Standard Room',
          cancellationPolicy: 'Free cancellation until 24h before check-in',
          breakfast: true,
          rating: competitor[0].starRating || 4.0
        }
      };

      const result = await db
        .insert(pricingOtaRates)
        .values(rateData)
        .returning();

      // Update competitor last scraped timestamp
      await db
        .update(pricingCompetitors)
        .set({ lastScrapedAt: new Date() })
        .where(eq(pricingCompetitors.id, competitorId));

      return result[0];
    } catch (error) {
      console.error('Error scraping Booking:', error);

      // Record failed scrape
      await db.insert(pricingOtaRates).values({
        competitorId,
        platform: 'booking',
        checkInDate: new Date(checkIn),
        checkOutDate: new Date(checkOut),
        price: 0,
        currency: 'BRL',
        availability: false,
        scrapeStatus: 'failed',
        source: 'scraper',
        metadata: { error: error.message }
      });

      throw error;
    }
  }

  async scrapeExpedia(competitorId: string, checkIn: string, checkOut: string): Promise<OtaRate | null> {
    try {
      const competitor = await db
        .select()
        .from(pricingCompetitors)
        .where(eq(pricingCompetitors.id, competitorId))
        .limit(1);

      if (!competitor[0]) {
        throw new Error(`Competitor with ID ${competitorId} not found`);
      }

      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1500));

      const basePrice = 245;
      const price = simulatePrice(basePrice);
      const availability = simulateAvailability();

      const rateData = {
        competitorId,
        platform: 'expedia' as const,
        checkInDate: new Date(checkIn),
        checkOutDate: new Date(checkOut),
        price,
        originalPrice: availability ? price * 1.08 : null,
        currency: 'BRL',
        availability,
        occupancyEstimate: availability ? Math.floor(Math.random() * 100) : null,
        scrapeStatus: 'completed' as const,
        source: 'scraper',
        metadata: {
          roomType: 'Deluxe Room',
          cancellationPolicy: 'Free cancellation until 48h before check-in',
          breakfast: false,
          rating: competitor[0].starRating || 4.2
        }
      };

      const result = await db
        .insert(pricingOtaRates)
        .values(rateData)
        .returning();

      await db
        .update(pricingCompetitors)
        .set({ lastScrapedAt: new Date() })
        .where(eq(pricingCompetitors.id, competitorId));

      return result[0];
    } catch (error) {
      console.error('Error scraping Expedia:', error);
      await db.insert(pricingOtaRates).values({
        competitorId,
        platform: 'expedia',
        checkInDate: new Date(checkIn),
        checkOutDate: new Date(checkOut),
        price: 0,
        currency: 'BRL',
        availability: false,
        scrapeStatus: 'failed',
        source: 'scraper',
        metadata: { error: error.message }
      });
      throw error;
    }
  }

  async scrapeAirbnb(competitorId: string, checkIn: string, checkOut: string): Promise<OtaRate | null> {
    try {
      const competitor = await db
        .select()
        .from(pricingCompetitors)
        .where(eq(pricingCompetitors.id, competitorId))
        .limit(1);

      if (!competitor[0]) {
        throw new Error(`Competitor with ID ${competitorId} not found`);
      }

      await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 1800));

      const basePrice = 280;
      const price = simulatePrice(basePrice);
      const availability = simulateAvailability();

      const rateData = {
        competitorId,
        platform: 'airbnb' as const,
        checkInDate: new Date(checkIn),
        checkOutDate: new Date(checkOut),
        price,
        originalPrice: null, // Airbnb doesn't usually show original prices
        currency: 'BRL',
        availability,
        occupancyEstimate: null, // Airbnb doesn't provide occupancy data
        scrapeStatus: 'completed' as const,
        source: 'scraper',
        metadata: {
          roomType: 'Entire apartment',
          cancellationPolicy: 'Moderate',
          breakfast: false,
          rating: competitor[0].starRating || 4.8,
          hostResponseTime: 'within an hour'
        }
      };

      const result = await db
        .insert(pricingOtaRates)
        .values(rateData)
        .returning();

      await db
        .update(pricingCompetitors)
        .set({ lastScrapedAt: new Date() })
        .where(eq(pricingCompetitors.id, competitorId));

      return result[0];
    } catch (error) {
      console.error('Error scraping Airbnb:', error);
      await db.insert(pricingOtaRates).values({
        competitorId,
        platform: 'airbnb',
        checkInDate: new Date(checkIn),
        checkOutDate: new Date(checkOut),
        price: 0,
        currency: 'BRL',
        availability: false,
        scrapeStatus: 'failed',
        source: 'scraper',
        metadata: { error: error.message }
      });
      throw error;
    }
  }

  async scrapeDecolar(competitorId: string, checkIn: string, checkOut: string): Promise<OtaRate | null> {
    try {
      const competitor = await db
        .select()
        .from(pricingCompetitors)
        .where(eq(pricingCompetitors.id, competitorId))
        .limit(1);

      if (!competitor[0]) {
        throw new Error(`Competitor with ID ${competitorId} not found`);
      }

      await new Promise(resolve => setTimeout(resolve, 900 + Math.random() * 1600));

      const basePrice = 255;
      const price = simulatePrice(basePrice);
      const availability = simulateAvailability();

      const rateData = {
        competitorId,
        platform: 'decolar' as const,
        checkInDate: new Date(checkIn),
        checkOutDate: new Date(checkOut),
        price,
        originalPrice: availability ? price * 1.12 : null,
        currency: 'BRL',
        availability,
        occupancyEstimate: availability ? Math.floor(Math.random() * 100) : null,
        scrapeStatus: 'completed' as const,
        source: 'scraper',
        metadata: {
          roomType: 'Superior Room',
          cancellationPolicy: 'Free cancellation until check-in',
          breakfast: true,
          rating: competitor[0].starRating || 4.1
        }
      };

      const result = await db
        .insert(pricingOtaRates)
        .values(rateData)
        .returning();

      await db
        .update(pricingCompetitors)
        .set({ lastScrapedAt: new Date() })
        .where(eq(pricingCompetitors.id, competitorId));

      return result[0];
    } catch (error) {
      console.error('Error scraping Decolar:', error);
      await db.insert(pricingOtaRates).values({
        competitorId,
        platform: 'decolar',
        checkInDate: new Date(checkIn),
        checkOutDate: new Date(checkOut),
        price: 0,
        currency: 'BRL',
        availability: false,
        scrapeStatus: 'failed',
        source: 'scraper',
        metadata: { error: error.message }
      });
      throw error;
    }
  }

  async scrapeHotelsCom(competitorId: string, checkIn: string, checkOut: string): Promise<OtaRate | null> {
    try {
      const competitor = await db
        .select()
        .from(pricingCompetitors)
        .where(eq(pricingCompetitors.id, competitorId))
        .limit(1);

      if (!competitor[0]) {
        throw new Error(`Competitor with ID ${competitorId} not found`);
      }

      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      const basePrice = 240;
      const price = simulatePrice(basePrice);
      const availability = simulateAvailability();

      const rateData = {
        competitorId,
        platform: 'hotels_com' as const,
        checkInDate: new Date(checkIn),
        checkOutDate: new Date(checkOut),
        price,
        originalPrice: availability ? price * 1.05 : null,
        currency: 'BRL',
        availability,
        occupancyEstimate: availability ? Math.floor(Math.random() * 100) : null,
        scrapeStatus: 'completed' as const,
        source: 'scraper',
        metadata: {
          roomType: 'Standard Room',
          cancellationPolicy: 'Free cancellation',
          breakfast: false,
          rating: competitor[0].starRating || 4.3
        }
      };

      const result = await db
        .insert(pricingOtaRates)
        .values(rateData)
        .returning();

      await db
        .update(pricingCompetitors)
        .set({ lastScrapedAt: new Date() })
        .where(eq(pricingCompetitors.id, competitorId));

      return result[0];
    } catch (error) {
      console.error('Error scraping Hotels.com:', error);
      await db.insert(pricingOtaRates).values({
        competitorId,
        platform: 'hotels_com',
        checkInDate: new Date(checkIn),
        checkOutDate: new Date(checkOut),
        price: 0,
        currency: 'BRL',
        availability: false,
        scrapeStatus: 'failed',
        source: 'scraper',
        metadata: { error: error.message }
      });
      throw error;
    }
  }

  async scrapeTrivago(competitorId: string, checkIn: string, checkOut: string): Promise<OtaRate | null> {
    try {
      const competitor = await db
        .select()
        .from(pricingCompetitors)
        .where(eq(pricingCompetitors.id, competitorId))
        .limit(1);

      if (!competitor[0]) {
        throw new Error(`Competitor with ID ${competitorId} not found`);
      }

      await new Promise(resolve => setTimeout(resolve, 1100 + Math.random() * 1900));

      const basePrice = 235;
      const price = simulatePrice(basePrice);
      const availability = simulateAvailability();

      const rateData = {
        competitorId,
        platform: 'trivago' as const,
        checkInDate: new Date(checkIn),
        checkOutDate: new Date(checkOut),
        price,
        originalPrice: availability ? price * 1.03 : null,
        currency: 'BRL',
        availability,
        occupancyEstimate: null, // Trivago aggregates, no occupancy data
        scrapeStatus: 'completed' as const,
        source: 'scraper',
        metadata: {
          roomType: 'Various',
          cancellationPolicy: 'Check individual hotels',
          breakfast: null,
          rating: competitor[0].starRating || 4.0
        }
      };

      const result = await db
        .insert(pricingOtaRates)
        .values(rateData)
        .returning();

      await db
        .update(pricingCompetitors)
        .set({ lastScrapedAt: new Date() })
        .where(eq(pricingCompetitors.id, competitorId));

      return result[0];
    } catch (error) {
      console.error('Error scraping Trivago:', error);
      await db.insert(pricingOtaRates).values({
        competitorId,
        platform: 'trivago',
        checkInDate: new Date(checkIn),
        checkOutDate: new Date(checkOut),
        price: 0,
        currency: 'BRL',
        availability: false,
        scrapeStatus: 'failed',
        source: 'scraper',
        metadata: { error: error.message }
      });
      throw error;
    }
  }

  async scrapeKayak(competitorId: string, checkIn: string, checkOut: string): Promise<OtaRate | null> {
    try {
      const competitor = await db
        .select()
        .from(pricingCompetitors)
        .where(eq(pricingCompetitors.id, competitorId))
        .limit(1);

      if (!competitor[0]) {
        throw new Error(`Competitor with ID ${competitorId} not found`);
      }

      await new Promise(resolve => setTimeout(resolve, 950 + Math.random() * 1700));

      const basePrice = 248;
      const price = simulatePrice(basePrice);
      const availability = simulateAvailability();

      const rateData = {
        competitorId,
        platform: 'kayak' as const,
        checkInDate: new Date(checkIn),
        checkOutDate: new Date(checkOut),
        price,
        originalPrice: availability ? price * 1.07 : null,
        currency: 'BRL',
        availability,
        occupancyEstimate: null,
        scrapeStatus: 'completed' as const,
        source: 'scraper',
        metadata: {
          roomType: 'Flexible',
          cancellationPolicy: 'Varies by provider',
          breakfast: null,
          rating: competitor[0].starRating || 4.2
        }
      };

      const result = await db
        .insert(pricingOtaRates)
        .values(rateData)
        .returning();

      await db
        .update(pricingCompetitors)
        .set({ lastScrapedAt: new Date() })
        .where(eq(pricingCompetitors.id, competitorId));

      return result[0];
    } catch (error) {
      console.error('Error scraping Kayak:', error);
      await db.insert(pricingOtaRates).values({
        competitorId,
        platform: 'kayak',
        checkInDate: new Date(checkIn),
        checkOutDate: new Date(checkOut),
        price: 0,
        currency: 'BRL',
        availability: false,
        scrapeStatus: 'failed',
        source: 'scraper',
        metadata: { error: error.message }
      });
      throw error;
    }
  }

  async scrapeGoogleHotels(competitorId: string, checkIn: string, checkOut: string): Promise<OtaRate | null> {
    try {
      const competitor = await db
        .select()
        .from(pricingCompetitors)
        .where(eq(pricingCompetitors.id, competitorId))
        .limit(1);

      if (!competitor[0]) {
        throw new Error(`Competitor with ID ${competitorId} not found`);
      }

      await new Promise(resolve => setTimeout(resolve, 1050 + Math.random() * 1850));

      const basePrice = 252;
      const price = simulatePrice(basePrice);
      const availability = simulateAvailability();

      const rateData = {
        competitorId,
        platform: 'google_hotels' as const,
        checkInDate: new Date(checkIn),
        checkOutDate: new Date(checkOut),
        price,
        originalPrice: availability ? price * 1.06 : null,
        currency: 'BRL',
        availability,
        occupancyEstimate: null,
        scrapeStatus: 'completed' as const,
        source: 'scraper',
        metadata: {
          roomType: 'Standard',
          cancellationPolicy: 'Free cancellation available',
          breakfast: null,
          rating: competitor[0].starRating || 4.4
        }
      };

      const result = await db
        .insert(pricingOtaRates)
        .values(rateData)
        .returning();

      await db
        .update(pricingCompetitors)
        .set({ lastScrapedAt: new Date() })
        .where(eq(pricingCompetitors.id, competitorId));

      return result[0];
    } catch (error) {
      console.error('Error scraping Google Hotels:', error);
      await db.insert(pricingOtaRates).values({
        competitorId,
        platform: 'google_hotels',
        checkInDate: new Date(checkIn),
        checkOutDate: new Date(checkOut),
        price: 0,
        currency: 'BRL',
        availability: false,
        scrapeStatus: 'failed',
        source: 'scraper',
        metadata: { error: error.message }
      });
      throw error;
    }
  }

  async scrapeAllPlatforms(
    competitorId: string,
    checkIn: string,
    checkOut: string
  ): Promise<{ results: Array<{ platform: string; status: 'fulfilled' | 'rejected'; rate?: OtaRate }>; successCount: number; failCount: number }> {
    const platforms = [
      'scrapeBooking',
      'scrapeExpedia',
      'scrapeAirbnb',
      'scrapeDecolar',
      'scrapeHotelsCom',
      'scrapeTrivago',
      'scrapeKayak',
      'scrapeGoogleHotels'
    ] as const;

    const results = await Promise.allSettled(
      platforms.map(platform =>
        this[platform](competitorId, checkIn, checkOut)
      )
    );

    const processedResults = results.map((result, index) => ({
      platform: platforms[index].replace('scrape', '').toLowerCase(),
      status: result.status,
      rate: result.status === 'fulfilled' ? result.value : undefined
    }));

    const successCount = processedResults.filter(r => r.status === 'fulfilled').length;
    const failCount = processedResults.filter(r => r.status === 'rejected').length;

    return {
      results: processedResults,
      successCount,
      failCount
    };
  }
}

export const otaScraperService = new OtaScraperService();