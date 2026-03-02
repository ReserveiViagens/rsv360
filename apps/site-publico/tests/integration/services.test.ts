/**
 * ✅ TESTES DE INTEGRAÇÃO - SERVIÇOS
 * 
 * Testes para serviços principais:
 * - Smart Pricing Service
 * - Google Calendar Service
 * - Eventbrite Service
 * - Airbnb Service
 * - Cloudbeds Service
 */

import { describe, it, expect, beforeAll, jest } from '@jest/globals';
import {
  mockGoogleCalendarEvents,
  mockEventbriteEvents,
  mockAirbnbOAuth,
  mockAirbnbReservations,
  mockCloudbedsOAuth,
  mockCloudbedsBookings,
  mockLocalEvents,
  mockCompetitorPrices,
  mockFetch,
  setupFetchMocks,
} from '../mocks/api-mocks';

// Mock de dependências
jest.mock('../../lib/db');
jest.mock('../../lib/credentials-service');

// Setup fetch mocks
beforeAll(() => {
  setupFetchMocks();
});

describe('Services Integration Tests', () => {
  describe('Smart Pricing Service', () => {
    it('should calculate price with all factors', async () => {
      const { calculateSmartPrice } = await import('../../lib/smart-pricing-service');
      
      const checkIn = new Date();
      checkIn.setDate(checkIn.getDate() + 30);
      const checkOut = new Date(checkIn);
      checkOut.setDate(checkOut.getDate() + 3);

      const result = await calculateSmartPrice({
        propertyId: 1,
        basePrice: 100,
        checkIn,
        checkOut,
        location: 'Caldas Novas, GO',
      });

      expect(result).toHaveProperty('finalPrice');
      expect(result).toHaveProperty('factors');
      expect(result.finalPrice).toBeGreaterThan(0);
      expect(result.factors.basePrice).toBe(100);
    });

    it('should apply event multipliers', async () => {
      const { calculateSmartPrice } = await import('../../lib/smart-pricing-service');
      
      // Mock eventos locais
      (global.fetch as jest.Mock) = mockFetch({ events: mockLocalEvents });
      
      const checkIn = new Date('2025-07-15');
      const checkOut = new Date('2025-07-18');
      
      const result = await calculateSmartPrice({
        propertyId: 1,
        basePrice: 100,
        checkIn,
        checkOut,
        location: 'Caldas Novas, GO',
      });

      expect(result.finalPrice).toBeGreaterThan(100); // Deve aplicar multiplicador de evento
      expect(result.factors).toHaveProperty('eventMultiplier');
    });

    it('should apply competitor price adjustments', async () => {
      const { calculateSmartPrice } = await import('../../lib/smart-pricing-service');
      
      // Mock preços de competidores
      (global.fetch as jest.Mock) = mockFetch({ prices: mockCompetitorPrices });
      
      const checkIn = new Date('2025-02-01');
      const checkOut = new Date('2025-02-04');
      
      const result = await calculateSmartPrice({
        propertyId: 1,
        basePrice: 200,
        checkIn,
        checkOut,
        location: 'Caldas Novas, GO',
      });

      expect(result.factors).toHaveProperty('competitorAdjustment');
    });
  });

  describe('Google Calendar Service', () => {
    it('should fetch events from Google Calendar', async () => {
      // Mock credentials
      process.env.GOOGLE_CLIENT_ID = 'test-client-id';
      process.env.GOOGLE_CLIENT_SECRET = 'test-secret';
      
      // Mock Google Calendar API response
      (global.fetch as jest.Mock) = mockFetch(mockGoogleCalendarEvents);
      
      const { fetchGoogleCalendarEvents } = await import('../../lib/google-calendar-service');
      
      const events = await fetchGoogleCalendarEvents('Caldas Novas, GO', new Date(), new Date());
      
      expect(Array.isArray(events)).toBe(true);
      expect(events.length).toBeGreaterThan(0);
    });

    it('should sync events to database', async () => {
      // Mock API responses
      (global.fetch as jest.Mock) = mockFetch(mockGoogleCalendarEvents);
      
      const { syncGoogleCalendarEvents } = await import('../../lib/google-calendar-service');
      
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      const events = await syncGoogleCalendarEvents(
        'Caldas Novas, GO',
        startDate,
        endDate
      );

      expect(Array.isArray(events)).toBe(true);
    });
  });

  describe('Eventbrite Service', () => {
    it('should fetch events from Eventbrite', async () => {
      // Mock API key
      process.env.EVENTBRITE_API_KEY = 'test-api-key';
      
      // Mock Eventbrite API response
      (global.fetch as jest.Mock) = mockFetch(mockEventbriteEvents);
      
      const { fetchEventbriteEvents } = await import('../../lib/eventbrite-service');
      
      const events = await fetchEventbriteEvents('Caldas Novas, GO', new Date(), new Date());
      
      expect(Array.isArray(events)).toBe(true);
    });

    it('should sync events to database', async () => {
      // Mock API responses
      (global.fetch as jest.Mock) = mockFetch(mockEventbriteEvents);
      
      const { syncEventbriteEvents } = await import('../../lib/eventbrite-service');
      
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      const events = await syncEventbriteEvents(
        'Caldas Novas, GO',
        startDate,
        endDate
      );

      expect(Array.isArray(events)).toBe(true);
    });
  });

  describe('Airbnb Service', () => {
    it('should authenticate with OAuth2', async () => {
      // Mock OAuth2 flow
      (global.fetch as jest.Mock) = mockFetch(mockAirbnbOAuth);
      
      const { authenticateAirbnb } = await import('../../lib/airbnb-service');
      
      const result = await authenticateAirbnb({
        api_key: 'test-key',
        api_secret: 'test-secret',
        access_token: '',
      });
      
      expect(result).toHaveProperty('access_token');
      expect(result.access_token).toBe(mockAirbnbOAuth.access_token);
    });

    it('should fetch reservations', async () => {
      // Mock API responses
      (global.fetch as jest.Mock) = mockFetch(mockAirbnbReservations);
      
      const { fetchAirbnbBookings } = await import('../../lib/airbnb-service');
      
      const reservations = await fetchAirbnbBookings({
        api_key: 'test-key',
        access_token: 'test-token',
      });
      
      expect(Array.isArray(reservations)).toBe(true);
    });
  });

  describe('Cloudbeds Service', () => {
    it('should authenticate with OAuth2', async () => {
      // Mock OAuth2 flow
      (global.fetch as jest.Mock) = mockFetch(mockCloudbedsOAuth);
      
      const { authenticateCloudbeds } = await import('../../lib/cloudbeds-service');
      
      const result = await authenticateCloudbeds({
        api_key: 'test-key',
        api_secret: 'test-secret',
        access_token: '',
      });
      
      expect(result).toHaveProperty('access_token');
      expect(result.access_token).toBe(mockCloudbedsOAuth.access_token);
    });

    it('should sync reservations', async () => {
      // Mock API responses
      (global.fetch as jest.Mock) = mockFetch(mockCloudbedsBookings);
      
      const { fetchCloudbedsBookings } = await import('../../lib/cloudbeds-service');
      
      const bookings = await fetchCloudbedsBookings({
        api_key: 'test-key',
        access_token: 'test-token',
      });
      
      expect(Array.isArray(bookings)).toBe(true);
    });
  });
});

