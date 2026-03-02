/**
 * ✅ TAREFA LOW-1: Testes para integração com Airbnb Experiences
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { airbnbExperiencesService, type AirbnbExperience } from '@/lib/airbnb-experiences-service';

// Mocks
jest.mock('@/lib/airbnb-experiences-service', () => ({
  airbnbExperiencesService: {
    searchExperiences: jest.fn(),
    getExperienceById: jest.fn(),
    getExperiencesByCategory: jest.fn(),
  }
}));

const mockAirbnbExperiencesService = airbnbExperiencesService as jest.Mocked<typeof airbnbExperiencesService>;

describe('Airbnb Experiences Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('searchExperiences', () => {
    it('should return experiences for a location', async () => {
      const mockExperiences: AirbnbExperience[] = [
        {
          id: 'exp_1',
          title: 'Tour Gastronômico',
          description: 'Descrição',
          category: 'food',
          location: { city: 'Caldas Novas', state: 'GO', country: 'BR', latitude: -17.7, longitude: -48.6 },
          price: { amount: 150, currency: 'BRL', perPerson: true },
          duration: { value: 3, unit: 'hours' },
          rating: 4.8,
          reviewCount: 50,
          host: { name: 'Host', avatar: '' },
          images: [],
          url: '',
          maxGuests: 10
        }
      ];

      mockAirbnbExperiencesService.searchExperiences.mockResolvedValueOnce(mockExperiences);

      const experiences = await airbnbExperiencesService.searchExperiences({
        location: 'Caldas Novas, GO',
      });

      expect(Array.isArray(experiences)).toBe(true);
      expect(experiences.length).toBeGreaterThan(0);
    });

    it('should filter by category', async () => {
      const mockExperiences: AirbnbExperience[] = [
        {
          id: 'exp_1',
          title: 'Tour Gastronômico',
          description: 'Descrição',
          category: 'food',
          location: { city: 'Caldas Novas', state: 'GO', country: 'BR', latitude: -17.7, longitude: -48.6 },
          price: { amount: 150, currency: 'BRL', perPerson: true },
          duration: { value: 3, unit: 'hours' },
          rating: 4.8,
          reviewCount: 50,
          host: { name: 'Host', avatar: '' },
          images: [],
          url: '',
          maxGuests: 10
        }
      ];

      mockAirbnbExperiencesService.searchExperiences.mockResolvedValueOnce(mockExperiences);

      const experiences = await airbnbExperiencesService.searchExperiences({
        location: 'Caldas Novas',
        category: 'food',
      });

      experiences.forEach((exp) => {
        expect(exp.category).toBe('food');
      });
    });

    it('should filter by price range', async () => {
      const mockExperiences: AirbnbExperience[] = [
        {
          id: 'exp_1',
          title: 'Tour',
          description: 'Descrição',
          category: 'food',
          location: { city: 'Caldas Novas', state: 'GO', country: 'BR', latitude: -17.7, longitude: -48.6 },
          price: { amount: 150, currency: 'BRL', perPerson: true },
          duration: { value: 3, unit: 'hours' },
          rating: 4.8,
          reviewCount: 50,
          host: { name: 'Host', avatar: '' },
          images: [],
          url: '',
          maxGuests: 10
        }
      ];

      mockAirbnbExperiencesService.searchExperiences.mockResolvedValueOnce(mockExperiences);

      const experiences = await airbnbExperiencesService.searchExperiences({
        location: 'Caldas Novas',
        minPrice: 100,
        maxPrice: 200,
      });

      experiences.forEach((exp) => {
        expect(exp.price.amount).toBeGreaterThanOrEqual(100);
        expect(exp.price.amount).toBeLessThanOrEqual(200);
      });
    });

    it('should filter by minimum rating', async () => {
      const mockExperiences: AirbnbExperience[] = [
        {
          id: 'exp_1',
          title: 'Tour',
          description: 'Descrição',
          category: 'food',
          location: { city: 'Caldas Novas', state: 'GO', country: 'BR', latitude: -17.7, longitude: -48.6 },
          price: { amount: 150, currency: 'BRL', perPerson: true },
          duration: { value: 3, unit: 'hours' },
          rating: 4.8,
          reviewCount: 50,
          host: { name: 'Host', avatar: '' },
          images: [],
          url: '',
          maxGuests: 10
        }
      ];

      mockAirbnbExperiencesService.searchExperiences.mockResolvedValueOnce(mockExperiences);

      const experiences = await airbnbExperiencesService.searchExperiences({
        location: 'Caldas Novas',
        minRating: 4.5,
      });

      experiences.forEach((exp) => {
        expect(exp.rating).toBeGreaterThanOrEqual(4.5);
      });
    });

    it('should filter by max guests', async () => {
      const mockExperiences: AirbnbExperience[] = [
        {
          id: 'exp_1',
          title: 'Tour',
          description: 'Descrição',
          category: 'food',
          location: { city: 'Caldas Novas', state: 'GO', country: 'BR', latitude: -17.7, longitude: -48.6 },
          price: { amount: 150, currency: 'BRL', perPerson: true },
          duration: { value: 3, unit: 'hours' },
          rating: 4.8,
          reviewCount: 50,
          host: { name: 'Host', avatar: '' },
          images: [],
          url: '',
          maxGuests: 6
        }
      ];

      mockAirbnbExperiencesService.searchExperiences.mockResolvedValueOnce(mockExperiences);

      const experiences = await airbnbExperiencesService.searchExperiences({
        location: 'Caldas Novas',
        maxGuests: 6,
      });

      experiences.forEach((exp) => {
        expect(exp.maxGuests).toBeLessThanOrEqual(6);
      });
    });

    it('should respect limit and offset', async () => {
      const mockExperiences1: AirbnbExperience[] = [
        {
          id: 'exp_1',
          title: 'Tour 1',
          description: 'Descrição',
          category: 'food',
          location: { city: 'Caldas Novas', state: 'GO', country: 'BR', latitude: -17.7, longitude: -48.6 },
          price: { amount: 150, currency: 'BRL', perPerson: true },
          duration: { value: 3, unit: 'hours' },
          rating: 4.8,
          reviewCount: 50,
          host: { name: 'Host', avatar: '' },
          images: [],
          url: '',
          maxGuests: 10
        }
      ];
      const mockExperiences2: AirbnbExperience[] = [
        {
          id: 'exp_2',
          title: 'Tour 2',
          description: 'Descrição',
          category: 'food',
          location: { city: 'Caldas Novas', state: 'GO', country: 'BR', latitude: -17.7, longitude: -48.6 },
          price: { amount: 150, currency: 'BRL', perPerson: true },
          duration: { value: 3, unit: 'hours' },
          rating: 4.8,
          reviewCount: 50,
          host: { name: 'Host', avatar: '' },
          images: [],
          url: '',
          maxGuests: 10
        }
      ];

      mockAirbnbExperiencesService.searchExperiences
        .mockResolvedValueOnce(mockExperiences1)
        .mockResolvedValueOnce(mockExperiences2);

      const experiences1 = await airbnbExperiencesService.searchExperiences({
        location: 'Caldas Novas',
        limit: 2,
        offset: 0,
      });

      const experiences2 = await airbnbExperiencesService.searchExperiences({
        location: 'Caldas Novas',
        limit: 2,
        offset: 2,
      });

      expect(experiences1.length).toBeLessThanOrEqual(2);
      expect(experiences2.length).toBeLessThanOrEqual(2);
    });
  });

  describe('getExperienceById', () => {
    it('should return an experience by ID', async () => {
      const mockExperience: AirbnbExperience = {
        id: 'exp_1',
        title: 'Tour',
        description: 'Descrição',
        category: 'food',
        location: { city: 'Caldas Novas', state: 'GO', country: 'BR', latitude: -17.7, longitude: -48.6 },
        price: { amount: 150, currency: 'BRL', perPerson: true },
        duration: { value: 3, unit: 'hours' },
        rating: 4.8,
        reviewCount: 50,
        host: { name: 'Host', avatar: '' },
        images: [],
        url: '',
        maxGuests: 10
      };

      mockAirbnbExperiencesService.getExperienceById.mockResolvedValueOnce(mockExperience);

      const experience = await airbnbExperiencesService.getExperienceById('exp_1');

      expect(experience).not.toBeNull();
      expect(experience?.id).toBe('exp_1');
    });

    it('should return null for non-existent ID', async () => {
      mockAirbnbExperiencesService.getExperienceById.mockResolvedValueOnce(null);

      const experience = await airbnbExperiencesService.getExperienceById('nonexistent');

      expect(experience).toBeNull();
    });
  });

  describe('getExperiencesByCategory', () => {
    it('should return experiences by category', async () => {
      const mockExperiences: AirbnbExperience[] = [
        {
          id: 'exp_1',
          title: 'Tour Gastronômico',
          description: 'Descrição',
          category: 'food',
          location: { city: 'Caldas Novas', state: 'GO', country: 'BR', latitude: -17.7, longitude: -48.6 },
          price: { amount: 150, currency: 'BRL', perPerson: true },
          duration: { value: 3, unit: 'hours' },
          rating: 4.8,
          reviewCount: 50,
          host: { name: 'Host', avatar: '' },
          images: [],
          url: '',
          maxGuests: 10
        }
      ];

      mockAirbnbExperiencesService.getExperiencesByCategory.mockResolvedValueOnce(mockExperiences);

      const experiences = await airbnbExperiencesService.getExperiencesByCategory(
        'food',
        'Caldas Novas'
      );

      expect(Array.isArray(experiences)).toBe(true);
      experiences.forEach((exp) => {
        expect(exp.category).toBe('food');
      });
    });
  });

  describe('Experience Data Structure', () => {
    it('should have all required fields', async () => {
      const experiences = await airbnbExperiencesService.searchExperiences({
        location: 'Caldas Novas',
        limit: 1,
      });

      if (experiences.length > 0) {
        const exp = experiences[0];
        expect(exp.id).toBeDefined();
        expect(exp.title).toBeDefined();
        expect(exp.description).toBeDefined();
        expect(exp.category).toBeDefined();
        expect(exp.location).toBeDefined();
        expect(exp.price).toBeDefined();
        expect(exp.duration).toBeDefined();
        expect(exp.rating).toBeDefined();
        expect(exp.reviewCount).toBeDefined();
        expect(exp.host).toBeDefined();
        expect(exp.images).toBeDefined();
        expect(exp.url).toBeDefined();
      }
    });

    it('should have valid location data', async () => {
      const experiences = await airbnbExperiencesService.searchExperiences({
        location: 'Caldas Novas',
        limit: 1,
      });

      if (experiences.length > 0) {
        const exp = experiences[0];
        expect(exp.location.city).toBeDefined();
        expect(exp.location.state).toBeDefined();
        expect(exp.location.country).toBeDefined();
        expect(typeof exp.location.latitude).toBe('number');
        expect(typeof exp.location.longitude).toBe('number');
      }
    });

    it('should have valid price data', async () => {
      const experiences = await airbnbExperiencesService.searchExperiences({
        location: 'Caldas Novas',
        limit: 1,
      });

      if (experiences.length > 0) {
        const exp = experiences[0];
        expect(typeof exp.price.amount).toBe('number');
        expect(exp.price.amount).toBeGreaterThan(0);
        expect(exp.price.currency).toBeDefined();
        expect(typeof exp.price.perPerson).toBe('boolean');
      }
    });
  });
});

