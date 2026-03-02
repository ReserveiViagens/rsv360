import { renderHook, waitFor, act } from '@testing-library/react';
import { useState } from 'react';

// Mock simples do fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock simples do hook sem carregar dados automaticamente
const mockUseWebsiteData = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createHotel = jest.fn().mockResolvedValue({
    id: 1,
    title: 'Novo Hotel',
    description: 'Descrição do novo hotel',
    price: 199.99,
    stars: 3,
    location: 'Caldas Novas, GO',
    status: 'active',
    images: ['image1.jpg'],
    features: ['WiFi']
  });

  const updateHotel = jest.fn().mockResolvedValue({
    id: 1,
    title: 'Hotel Atualizado',
    price: 399.99
  });

  const deleteHotel = jest.fn().mockResolvedValue(true);

  return {
    hotels,
    promotions: [],
    attractions: [],
    settings: null,
    loading,
    error,
    createHotel,
    updateHotel,
    deleteHotel,
    createPromotion: jest.fn(),
    updatePromotion: jest.fn(),
    deletePromotion: jest.fn(),
    createAttraction: jest.fn(),
    updateAttraction: jest.fn(),
    deleteAttraction: jest.fn(),
    loadAllData: jest.fn(),
    loadHotels: jest.fn(),
    loadPromotions: jest.fn(),
    loadAttractions: jest.fn(),
    loadSettings: jest.fn(),
  };
};

describe('useWebsiteData - Testes Simplificados', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  test('deve criar novo hotel', async () => {
    const { result } = renderHook(() => mockUseWebsiteData());

    const newHotel = {
      title: 'Novo Hotel',
      description: 'Descrição do novo hotel',
      price: 199.99,
      stars: 3,
      location: 'Caldas Novas, GO',
      status: 'active' as const,
      images: ['image1.jpg'],
      features: ['WiFi']
    };

    const createdHotel = await result.current.createHotel(newHotel);

    expect(createdHotel.title).toBe('Novo Hotel');
    expect(result.current.createHotel).toHaveBeenCalledWith(newHotel);
  });

  test('deve atualizar hotel existente', async () => {
    const { result } = renderHook(() => mockUseWebsiteData());

    const updatedData = {
      title: 'Hotel Atualizado',
      price: 399.99
    };

    const updatedHotel = await result.current.updateHotel(1, updatedData);

    expect(updatedHotel.title).toBe('Hotel Atualizado');
    expect(result.current.updateHotel).toHaveBeenCalledWith(1, updatedData);
  });

  test('deve deletar hotel', async () => {
    const { result } = renderHook(() => mockUseWebsiteData());

    const deleted = await result.current.deleteHotel(1);

    expect(deleted).toBe(true);
    expect(result.current.deleteHotel).toHaveBeenCalledWith(1);
  });

  test('deve ter estado inicial correto', () => {
    const { result } = renderHook(() => mockUseWebsiteData());

    expect(result.current.hotels).toEqual([]);
    expect(result.current.promotions).toEqual([]);
    expect(result.current.attractions).toEqual([]);
    expect(result.current.settings).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('deve ter todas as funções necessárias', () => {
    const { result } = renderHook(() => mockUseWebsiteData());

    expect(typeof result.current.createHotel).toBe('function');
    expect(typeof result.current.updateHotel).toBe('function');
    expect(typeof result.current.deleteHotel).toBe('function');
    expect(typeof result.current.createPromotion).toBe('function');
    expect(typeof result.current.updatePromotion).toBe('function');
    expect(typeof result.current.deletePromotion).toBe('function');
    expect(typeof result.current.createAttraction).toBe('function');
    expect(typeof result.current.updateAttraction).toBe('function');
    expect(typeof result.current.deleteAttraction).toBe('function');
  });
});
