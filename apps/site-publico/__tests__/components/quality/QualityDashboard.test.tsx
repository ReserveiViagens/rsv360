/**
 * ✅ FASE 5 - ETAPA 5.3: Testes Frontend - QualityDashboard Component
 * Testes para o componente de dashboard de qualidade
 * 
 * @module __tests__/components/quality/QualityDashboard.test
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import QualityDashboard from '@/components/quality/QualityDashboard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock do hook
jest.mock('@/hooks/useQualityDashboard', () => ({
  useQualityDashboard: jest.fn()
}));

// Mock do jspdf (usado no export)
jest.mock('jspdf', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    text: jest.fn(),
    save: jest.fn()
  }))
}));

const mockUseQualityDashboard = require('@/hooks/useQualityDashboard').useQualityDashboard;

describe('QualityDashboard', () => {
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

  const mockQualityData = {
    overallScore: 85,
    metrics: {
      responseTime: 90,
      cancellationRate: 95,
      rating: 88,
      reviewsCount: 80,
      amenities: 85,
      houseRules: 90
    },
    badges: [],
    recommendations: [
      { id: 1, priority: 'high', impact: 10, action: 'Improve response time' }
    ]
  };

  it('should render dashboard with quality score', () => {
    // Arrange
    mockUseQualityDashboard.mockReturnValue({
      qualityData: mockQualityData,
      isLoading: false,
      error: null
    });

    // Act
    render(<QualityDashboard hostId={1} />, { wrapper });

    // Assert
    expect(screen.getByText(/Score de Qualidade/i)).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
  });

  it('should display loading state', () => {
    // Arrange
    mockUseQualityDashboard.mockReturnValue({
      qualityData: null,
      isLoading: true,
      error: null
    });

    // Act
    render(<QualityDashboard hostId={1} />, { wrapper });

    // Assert
    expect(screen.getByText(/Carregando/i)).toBeInTheDocument();
  });

  it('should render radar chart with metrics', () => {
    // Arrange
    mockUseQualityDashboard.mockReturnValue({
      qualityData: mockQualityData,
      isLoading: false,
      error: null
    });

    // Act
    const { container } = render(<QualityDashboard hostId={1} />, { wrapper });

    // Assert
    expect(screen.getByText(/Comparação com Top Hosts/i)).toBeInTheDocument();
    const radarChart = container.querySelector('[data-testid="radar-chart"]');
    expect(radarChart).toBeInTheDocument();
  });

  it('should display recommendations', () => {
    // Arrange
    mockUseQualityDashboard.mockReturnValue({
      qualityData: mockQualityData,
      isLoading: false,
      error: null
    });

    // Act
    render(<QualityDashboard hostId={1} />, { wrapper });

    // Assert
    expect(screen.getByText(/Recomendações/i)).toBeInTheDocument();
    expect(screen.getByText('Improve response time')).toBeInTheDocument();
  });

  it('should export to PDF', async () => {
    // Arrange
    mockUseQualityDashboard.mockReturnValue({
      qualityData: mockQualityData,
      isLoading: false,
      error: null
    });

    // Act
    render(<QualityDashboard hostId={1} />, { wrapper });

    const exportButton = screen.getByText('Exportar PDF');
    fireEvent.click(exportButton);

    // Assert
    await waitFor(() => {
      const jsPDF = require('jspdf').default;
      expect(jsPDF).toHaveBeenCalled();
    });
  });

  it('should display next badge progress', () => {
    // Arrange
    const dataWithBadge = {
      ...mockQualityData,
      nextBadge: {
        id: 1,
        name: 'Super Host',
        progress: 75
      }
    };

    mockUseQualityDashboard.mockReturnValue({
      qualityData: dataWithBadge,
      isLoading: false,
      error: null
    });

    // Act
    render(<QualityDashboard hostId={1} />, { wrapper });

    // Assert
    expect(screen.getByText(/Próximo Badge/i)).toBeInTheDocument();
    expect(screen.getByText('Super Host')).toBeInTheDocument();
    expect(screen.getByText(/75%/i)).toBeInTheDocument();
  });

  it('should handle error state', () => {
    // Arrange
    mockUseQualityDashboard.mockReturnValue({
      qualityData: null,
      isLoading: false,
      error: new Error('Failed to load')
    });

    // Act
    render(<QualityDashboard hostId={1} />, { wrapper });

    // Assert
    expect(screen.getByText(/Erro ao carregar dados/i)).toBeInTheDocument();
  });

  it('should display comparison with top hosts', () => {
    // Arrange
    const dataWithComparison = {
      ...mockQualityData,
      topHostsAverage: {
        responseTime: 95,
        cancellationRate: 98,
        rating: 92
      }
    };

    mockUseQualityDashboard.mockReturnValue({
      qualityData: dataWithComparison,
      isLoading: false,
      error: null
    });

    // Act
    render(<QualityDashboard hostId={1} />, { wrapper });

    // Assert
    expect(screen.getByText(/Comparação com Top Hosts/i)).toBeInTheDocument();
  });
});

