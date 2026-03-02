import { renderHook, waitFor } from '@testing-library/react';
import { useWebsiteData } from '../useWebsiteData';

// Mock do fetch
global.fetch = jest.fn();

describe('useWebsiteData', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('deve carregar dados iniciais corretamente', async () => {
    const mockData = {
      content: [
        {
          id: 1,
          title: 'Hotel Teste',
          description: 'Descrição do hotel',
          price: 299.99,
          stars: 4,
          location: 'Caldas Novas, GO',
          status: 'active',
          images: ['image1.jpg'],
          features: ['WiFi', 'Piscina']
        }
      ]
    };

    // Mock das 4 chamadas de API (hotéis, promoções, atrações, configurações)
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ settings: {} }),
      });

    const { result } = renderHook(() => useWebsiteData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.hotels).toHaveLength(1);
    expect(result.current.hotels[0].title).toBe('Hotel Teste');
  });

  test('deve criar novo hotel', async () => {
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

    const mockResponse = {
      content: { id: 2, ...newHotel }
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useWebsiteData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const createdHotel = await result.current.createHotel(newHotel);

    expect(createdHotel.title).toBe('Novo Hotel');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/website/content'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          page_type: 'hotels',
          ...newHotel
        })
      })
    );
  });

  test('deve atualizar hotel existente', async () => {
    const updatedData = {
      title: 'Hotel Atualizado',
      price: 399.99
    };

    const mockResponse = {
      content: { id: 1, ...updatedData }
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useWebsiteData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const updatedHotel = await result.current.updateHotel(1, updatedData);

    expect(updatedHotel.title).toBe('Hotel Atualizado');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/website/content/1'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify(updatedData)
      })
    );
  });

  test('deve deletar hotel', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const { result } = renderHook(() => useWebsiteData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const deleted = await result.current.deleteHotel(1);

    expect(deleted).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/website/content/1'),
      expect.objectContaining({
        method: 'DELETE'
      })
    );
  });

  test('deve lidar com erros de API', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(() => useWebsiteData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Erro ao carregar dados do sistema');
  });

  test('deve carregar promoções', async () => {
    const mockPromotions = {
      content: [
        {
          id: 1,
          title: 'Promoção Teste',
          description: 'Descrição da promoção',
          discount: 20,
          validUntil: '2025-12-31',
          status: 'active'
        }
      ]
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPromotions,
    });

    const { result } = renderHook(() => useWebsiteData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.promotions).toHaveLength(1);
    expect(result.current.promotions[0].title).toBe('Promoção Teste');
  });

  test('deve carregar atrações', async () => {
    const mockAttractions = {
      content: [
        {
          id: 1,
          title: 'Atração Teste',
          description: 'Descrição da atração',
          price: 50.00,
          location: 'Caldas Novas, GO',
          status: 'active'
        }
      ]
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockAttractions,
    });

    const { result } = renderHook(() => useWebsiteData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.attractions).toHaveLength(1);
    expect(result.current.attractions[0].title).toBe('Atração Teste');
  });

  test('deve carregar configurações do site', async () => {
    const mockSettings = {
      settings: {
        site_info: {
          title: 'Reservei Viagens',
          tagline: 'Parques, Hotéis & Atrações'
        },
        contact_info: {
          phones: ['(64) 99319-7555'],
          email: 'reservas@reserveiviagens.com.br'
        }
      }
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSettings,
    });

    const { result } = renderHook(() => useWebsiteData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.settings).toBeTruthy();
    expect(result.current.settings?.site_info.title).toBe('Reservei Viagens');
  });
});
