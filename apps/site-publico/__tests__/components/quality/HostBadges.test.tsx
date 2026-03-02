/**
 * ✅ FASE 5 - ETAPA 5.3: Testes Frontend - HostBadges Component
 * Testes para o componente de badges de host
 * 
 * @module __tests__/components/quality/HostBadges.test
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import HostBadges from '@/components/quality/HostBadges';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock do hook
jest.mock('@/hooks/useHostBadges', () => ({
  useHostBadges: jest.fn()
}));

const mockUseHostBadges = require('@/hooks/useHostBadges').useHostBadges;

describe('HostBadges', () => {
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

  const mockBadges = [
    {
      id: 1,
      badge_key: 'super_host',
      badge_name: 'Super Host',
      badge_description: 'Top rated host',
      badge_category: 'quality',
      earned: true,
      earnedAt: '2025-01-01',
      progress: 100
    },
    {
      id: 2,
      badge_key: 'quick_response',
      badge_name: 'Quick Response',
      badge_description: 'Responds within 1 hour',
      badge_category: 'performance',
      earned: false,
      progress: 75
    }
  ];

  it('should render badges grid', () => {
    // Arrange
    mockUseHostBadges.mockReturnValue({
      badges: mockBadges,
      isLoading: false,
      error: null
    });

    // Act
    render(<HostBadges hostId={1} />, { wrapper });

    // Assert
    expect(screen.getByText('Super Host')).toBeInTheDocument();
    expect(screen.getByText('Quick Response')).toBeInTheDocument();
  });

  it('should display loading state', () => {
    // Arrange
    mockUseHostBadges.mockReturnValue({
      badges: [],
      isLoading: true,
      error: null
    });

    // Act
    render(<HostBadges hostId={1} />, { wrapper });

    // Assert
    expect(screen.getByText(/Carregando/i)).toBeInTheDocument();
  });

  it('should filter badges by search', async () => {
    // Arrange
    mockUseHostBadges.mockReturnValue({
      badges: mockBadges,
      isLoading: false,
      error: null
    });

    // Act
    render(<HostBadges hostId={1} />, { wrapper });

    const searchInput = screen.getByPlaceholderText(/Buscar badges/i);
    fireEvent.change(searchInput, { target: { value: 'Super' } });

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Super Host')).toBeInTheDocument();
      expect(screen.queryByText('Quick Response')).not.toBeInTheDocument();
    });
  });

  it('should filter badges by category', async () => {
    // Arrange
    mockUseHostBadges.mockReturnValue({
      badges: mockBadges,
      isLoading: false,
      error: null
    });

    // Act
    render(<HostBadges hostId={1} />, { wrapper });

    const categorySelect = screen.getByLabelText(/Categoria/i);
    fireEvent.change(categorySelect, { target: { value: 'quality' } });

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Super Host')).toBeInTheDocument();
      expect(screen.queryByText('Quick Response')).not.toBeInTheDocument();
    });
  });

  it('should display earned badges with highlight', () => {
    // Arrange
    mockUseHostBadges.mockReturnValue({
      badges: mockBadges,
      isLoading: false,
      error: null
    });

    // Act
    render(<HostBadges hostId={1} />, { wrapper });

    // Assert
    const superHostCard = screen.getByText('Super Host').closest('[data-earned="true"]');
    expect(superHostCard).toBeInTheDocument();
  });

  it('should display progress for unearned badges', () => {
    // Arrange
    mockUseHostBadges.mockReturnValue({
      badges: mockBadges,
      isLoading: false,
      error: null
    });

    // Act
    render(<HostBadges hostId={1} />, { wrapper });

    // Assert
    expect(screen.getByText(/75%/i)).toBeInTheDocument();
  });

  it('should open modal when badge is clicked', async () => {
    // Arrange
    mockUseHostBadges.mockReturnValue({
      badges: mockBadges,
      isLoading: false,
      error: null
    });

    // Act
    render(<HostBadges hostId={1} />, { wrapper });

    const badgeCard = screen.getByText('Super Host').closest('button');
    fireEvent.click(badgeCard!);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/Detalhes do Badge/i)).toBeInTheDocument();
      expect(screen.getByText('Top rated host')).toBeInTheDocument();
    });
  });

  it('should handle error state', () => {
    // Arrange
    mockUseHostBadges.mockReturnValue({
      badges: [],
      isLoading: false,
      error: new Error('Failed to load badges')
    });

    // Act
    render(<HostBadges hostId={1} />, { wrapper });

    // Assert
    expect(screen.getByText(/Erro ao carregar badges/i)).toBeInTheDocument();
  });
});

