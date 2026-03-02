import { renderHook, waitFor } from '@testing-library/react';
import { useAnalytics } from '../useAnalytics';

// Mock do fetch
global.fetch = jest.fn();

describe('useAnalytics', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('deve carregar dados de analytics iniciais', async () => {
    const mockAnalytics = {
      overview: {
        totalBookings: 150,
        totalRevenue: 45000,
        activeUsers: 75,
        conversionRate: 12.5
      },
      trends: {
        bookings: [
          { month: 'Jan', value: 20 },
          { month: 'Feb', value: 25 },
          { month: 'Mar', value: 30 }
        ],
        revenue: [
          { month: 'Jan', value: 6000 },
          { month: 'Feb', value: 7500 },
          { month: 'Mar', value: 9000 }
        ]
      },
      content: {
        popularHotels: [
          { name: 'Hotel A', bookings: 45 },
          { name: 'Hotel B', bookings: 38 }
        ],
        popularAttractions: [
          { name: 'Atração A', visits: 120 },
          { name: 'Atração B', visits: 95 }
        ]
      },
      users: {
        newUsers: 25,
        returningUsers: 50,
        userGrowth: 15.2
      },
      performance: {
        pageLoadTime: 1.2,
        bounceRate: 35.5,
        avgSessionDuration: 4.5
      }
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockAnalytics,
    });

    const { result } = renderHook(() => useAnalytics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.overview.totalBookings).toBe(150);
    expect(result.current.trends.bookings).toHaveLength(3);
    expect(result.current.content.popularHotels).toHaveLength(2);
  });

  test('deve gerar relatório personalizado', async () => {
    const mockReport = {
      report: {
        id: 'report-123',
        title: 'Relatório Mensal',
        data: {
          bookings: 150,
          revenue: 45000,
          topDestinations: ['Caldas Novas', 'Rio Quente']
        },
        generatedAt: '2025-01-09T15:43:00Z'
      }
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockReport,
    });

    const { result } = renderHook(() => useAnalytics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const report = await result.current.generateReport({
      period: 'month',
      metrics: ['bookings', 'revenue'],
      filters: { destination: 'Caldas Novas' }
    });

    expect(report.title).toBe('Relatório Mensal');
    expect(report.data.bookings).toBe(150);
  });

  test('deve exportar dados em CSV', async () => {
    const mockCsvData = 'data:text/csv;charset=utf-8,Month,Bookings,Revenue\nJan,20,6000\nFeb,25,7500';

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      blob: async () => new Blob([mockCsvData], { type: 'text/csv' }),
    });

    const { result } = renderHook(() => useAnalytics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const csvBlob = await result.current.exportData('csv', {
      period: 'year',
      metrics: ['bookings', 'revenue']
    });

    expect(csvBlob).toBeInstanceOf(Blob);
    expect(csvBlob.type).toBe('text/csv');
  });

  test('deve lidar com erros de API', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(() => useAnalytics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Erro ao carregar analytics');
  });

  test('deve atualizar dados em tempo real', async () => {
    const initialData = {
      overview: { totalBookings: 100, totalRevenue: 30000 }
    };

    const updatedData = {
      overview: { totalBookings: 105, totalRevenue: 31500 }
    };

    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => initialData,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => updatedData,
      });

    const { result } = renderHook(() => useAnalytics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.overview.totalBookings).toBe(100);

    // Simular atualização em tempo real
    await result.current.refreshData();

    await waitFor(() => {
      expect(result.current.overview.totalBookings).toBe(105);
    });
  });

  test('deve filtrar dados por período', async () => {
    const mockData = {
      overview: { totalBookings: 50 },
      trends: {
        bookings: [
          { date: '2025-01-01', value: 10 },
          { date: '2025-01-02', value: 15 },
          { date: '2025-01-03', value: 25 }
        ]
      }
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const { result } = renderHook(() => useAnalytics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const filteredData = result.current.getFilteredData('week');

    expect(filteredData.overview.totalBookings).toBe(50);
    expect(filteredData.trends.bookings).toHaveLength(3);
  });

  test('deve calcular métricas derivadas', async () => {
    const mockData = {
      overview: {
        totalBookings: 100,
        totalRevenue: 30000,
        activeUsers: 50
      }
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const { result } = renderHook(() => useAnalytics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const metrics = result.current.getDerivedMetrics();

    expect(metrics.averageBookingValue).toBe(300); // 30000 / 100
    expect(metrics.bookingsPerUser).toBe(2); // 100 / 50
  });
});
