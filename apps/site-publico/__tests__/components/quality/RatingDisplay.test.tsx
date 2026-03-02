/**
 * ✅ FASE 5 - ETAPA 5.3: Testes Frontend - RatingDisplay Component
 * Testes para o componente de exibição de ratings
 * 
 * @module __tests__/components/quality/RatingDisplay.test
 */

import { render, screen, waitFor } from '@testing-library/react';
import RatingDisplay from '@/components/quality/RatingDisplay';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock do hook
jest.mock('@/hooks/useHostRatings', () => ({
  useHostRatings: jest.fn()
}));

const mockUseHostRatings = require('@/hooks/useHostRatings').useHostRatings;

describe('RatingDisplay', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false }
      }
    });
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  const mockRatings = {
    overall: 4.8,
    totalReviews: 150,
    breakdown: {
      cleanliness: 4.9,
      communication: 4.8,
      checkIn: 4.7,
      accuracy: 4.9,
      location: 4.8,
      value: 4.6
    },
    distribution: {
      5: 100,
      4: 35,
      3: 10,
      2: 3,
      1: 2
    },
    trend: [
      { month: '2025-01', rating: 4.5 },
      { month: '2025-02', rating: 4.6 },
      { month: '2025-03', rating: 4.8 }
    ],
    highlights: {
      positive: [
        'Great location and clean property',
        'Excellent communication',
        'Perfect for families'
      ],
      improvements: [
        'Could improve check-in process',
        'More amenities would be nice'
      ]
    }
  };

  it('should render overall rating', () => {
    // Arrange
    mockUseHostRatings.mockReturnValue({
      ratings: mockRatings,
      isLoading: false,
      error: null
    });

    // Act
    render(<RatingDisplay hostId={1} />, { wrapper });

    // Assert
    expect(screen.getByText('4.8')).toBeInTheDocument();
    expect(screen.getByText(/150 avaliações/i)).toBeInTheDocument();
  });

  it('should display loading state', () => {
    // Arrange
    mockUseHostRatings.mockReturnValue({
      ratings: null,
      isLoading: true,
      error: null
    });

    // Act
    render(<RatingDisplay hostId={1} />, { wrapper });

    // Assert
    expect(screen.getByText(/Carregando/i)).toBeInTheDocument();
  });

  it('should display breakdown by category', () => {
    // Arrange
    mockUseHostRatings.mockReturnValue({
      ratings: mockRatings,
      isLoading: false,
      error: null
    });

    // Act
    render(<RatingDisplay hostId={1} />, { wrapper });

    // Assert
    expect(screen.getByText(/Limpeza/i)).toBeInTheDocument();
    expect(screen.getByText(/Comunicação/i)).toBeInTheDocument();
    expect(screen.getByText(/Check-in/i)).toBeInTheDocument();
    expect(screen.getByText(/Precisão/i)).toBeInTheDocument();
    expect(screen.getByText(/Localização/i)).toBeInTheDocument();
    expect(screen.getByText(/Custo-benefício/i)).toBeInTheDocument();
  });

  it('should display rating distribution chart', () => {
    // Arrange
    mockUseHostRatings.mockReturnValue({
      ratings: mockRatings,
      isLoading: false,
      error: null
    });

    // Act
    const { container } = render(<RatingDisplay hostId={1} />, { wrapper });

    // Assert
    expect(screen.getByText(/Distribuição de Avaliações/i)).toBeInTheDocument();
    expect(screen.getByText(/100 avaliações de 5 estrelas/i)).toBeInTheDocument();
    const chart = container.querySelector('[data-testid="rating-distribution-chart"]');
    expect(chart).toBeInTheDocument();
  });

  it('should display trend chart', () => {
    // Arrange
    mockUseHostRatings.mockReturnValue({
      ratings: mockRatings,
      isLoading: false,
      error: null
    });

    // Act
    const { container } = render(<RatingDisplay hostId={1} />, { wrapper });

    // Assert
    expect(screen.getByText(/Tendência/i)).toBeInTheDocument();
    const trendChart = container.querySelector('[data-testid="trend-chart"]');
    expect(trendChart).toBeInTheDocument();
  });

  it('should display positive highlights', () => {
    // Arrange
    mockUseHostRatings.mockReturnValue({
      ratings: mockRatings,
      isLoading: false,
      error: null
    });

    // Act
    render(<RatingDisplay hostId={1} />, { wrapper });

    // Assert
    expect(screen.getByText(/Pontos Positivos/i)).toBeInTheDocument();
    expect(screen.getByText('Great location and clean property')).toBeInTheDocument();
    expect(screen.getByText('Excellent communication')).toBeInTheDocument();
  });

  it('should display improvement areas', () => {
    // Arrange
    mockUseHostRatings.mockReturnValue({
      ratings: mockRatings,
      isLoading: false,
      error: null
    });

    // Act
    render(<RatingDisplay hostId={1} />, { wrapper });

    // Assert
    expect(screen.getByText(/Áreas de Melhoria/i)).toBeInTheDocument();
    expect(screen.getByText('Could improve check-in process')).toBeInTheDocument();
  });

  it('should display trend indicator', () => {
    // Arrange
    const ratingsWithTrend = {
      ...mockRatings,
      trendDirection: 'improving' as const
    };

    mockUseHostRatings.mockReturnValue({
      ratings: ratingsWithTrend,
      isLoading: false,
      error: null
    });

    // Act
    render(<RatingDisplay hostId={1} />, { wrapper });

    // Assert
    expect(screen.getByText(/Melhorando/i)).toBeInTheDocument();
  });

  it('should handle error state', () => {
    // Arrange
    mockUseHostRatings.mockReturnValue({
      ratings: null,
      isLoading: false,
      error: new Error('Failed to load ratings')
    });

    // Act
    render(<RatingDisplay hostId={1} />, { wrapper });

    // Assert
    expect(screen.getByText(/Erro ao carregar avaliações/i)).toBeInTheDocument();
  });
});

