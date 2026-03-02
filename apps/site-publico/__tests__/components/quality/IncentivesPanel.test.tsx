/**
 * ✅ FASE 5 - ETAPA 5.3: Testes Frontend - IncentivesPanel Component
 * Testes para o componente de incentivos e gamificação
 * 
 * @module __tests__/components/quality/IncentivesPanel.test
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import IncentivesPanel from '@/components/quality/IncentivesPanel';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock do hook
jest.mock('@/hooks/useHostIncentives', () => ({
  useHostIncentives: jest.fn()
}));

const mockUseHostIncentives = require('@/hooks/useHostIncentives').useHostIncentives;

describe('IncentivesPanel', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  const mockIncentives = {
    leaderboardPosition: 5,
    totalHosts: 100,
    points: 2500,
    currentLevel: 3,
    nextLevel: 4,
    pointsToNextLevel: 500,
    activeMissions: [
      {
        id: 1,
        name: 'Complete 10 bookings',
        description: 'Get 10 bookings this month',
        reward: { type: 'points', amount: 500 },
        progress: 7,
        target: 10,
        deadline: '2025-12-31'
      }
    ],
    availableRewards: [
      {
        id: 1,
        name: 'Homepage Feature',
        cost: 500,
        description: 'Featured on homepage for 1 week'
      },
      {
        id: 2,
        name: '10% Fee Discount',
        cost: 1000,
        description: '10% discount on fees for 1 month'
      }
    ],
    rewardHistory: [
      {
        id: 1,
        name: 'Homepage Feature',
        redeemedAt: '2025-11-01',
        status: 'active'
      }
    ]
  };

  it('should render leaderboard position', () => {
    // Arrange
    mockUseHostIncentives.mockReturnValue({
      incentives: mockIncentives,
      isLoading: false,
      error: null
    });

    // Act
    render(<IncentivesPanel hostId={1} />, { wrapper });

    // Assert
    expect(screen.getByText(/Posição no Ranking/i)).toBeInTheDocument();
    expect(screen.getByText('#5')).toBeInTheDocument();
    expect(screen.getByText(/de 100 hosts/i)).toBeInTheDocument();
  });

  it('should display points and level', () => {
    // Arrange
    mockUseHostIncentives.mockReturnValue({
      incentives: mockIncentives,
      isLoading: false,
      error: null
    });

    // Act
    render(<IncentivesPanel hostId={1} />, { wrapper });

    // Assert
    expect(screen.getByText('2,500')).toBeInTheDocument();
    expect(screen.getByText(/Nível 3/i)).toBeInTheDocument();
    expect(screen.getByText(/500 pontos para o próximo nível/i)).toBeInTheDocument();
  });

  it('should display active missions', () => {
    // Arrange
    mockUseHostIncentives.mockReturnValue({
      incentives: mockIncentives,
      isLoading: false,
      error: null
    });

    // Act
    render(<IncentivesPanel hostId={1} />, { wrapper });

    // Assert
    expect(screen.getByText(/Missões Ativas/i)).toBeInTheDocument();
    expect(screen.getByText('Complete 10 bookings')).toBeInTheDocument();
    expect(screen.getByText(/7 de 10/i)).toBeInTheDocument();
    expect(screen.getByText(/500 pontos/i)).toBeInTheDocument();
  });

  it('should display available rewards', () => {
    // Arrange
    mockUseHostIncentives.mockReturnValue({
      incentives: mockIncentives,
      isLoading: false,
      error: null
    });

    // Act
    render(<IncentivesPanel hostId={1} />, { wrapper });

    // Assert
    expect(screen.getByText(/Recompensas Disponíveis/i)).toBeInTheDocument();
    expect(screen.getByText('Homepage Feature')).toBeInTheDocument();
    expect(screen.getByText('10% Fee Discount')).toBeInTheDocument();
  });

  it('should allow redeeming rewards', async () => {
    // Arrange
    const redeemReward = jest.fn();
    mockUseHostIncentives.mockReturnValue({
      incentives: mockIncentives,
      isLoading: false,
      error: null,
      redeemReward
    });

    // Act
    render(<IncentivesPanel hostId={1} />, { wrapper });

    const redeemButton = screen.getAllByText('Resgatar')[0];
    fireEvent.click(redeemButton);

    // Assert
    await waitFor(() => {
      expect(redeemReward).toHaveBeenCalledWith(1);
    });
  });

  it('should disable redeem button if insufficient points', () => {
    // Arrange
    const insufficientPoints = {
      ...mockIncentives,
      points: 400, // Less than reward cost (500)
      availableRewards: [
        {
          id: 1,
          name: 'Homepage Feature',
          cost: 500,
          description: 'Featured on homepage'
        }
      ]
    };

    mockUseHostIncentives.mockReturnValue({
      incentives: insufficientPoints,
      isLoading: false,
      error: null
    });

    // Act
    render(<IncentivesPanel hostId={1} />, { wrapper });

    // Assert
    const redeemButton = screen.getByText('Resgatar');
    expect(redeemButton).toBeDisabled();
  });

  it('should display reward history', () => {
    // Arrange
    mockUseHostIncentives.mockReturnValue({
      incentives: mockIncentives,
      isLoading: false,
      error: null
    });

    // Act
    render(<IncentivesPanel hostId={1} />, { wrapper });

    // Assert
    expect(screen.getByText(/Histórico de Recompensas/i)).toBeInTheDocument();
    expect(screen.getByText('Homepage Feature')).toBeInTheDocument();
    expect(screen.getByText(/Ativo/i)).toBeInTheDocument();
  });

  it('should display progress bar for next level', () => {
    // Arrange
    mockUseHostIncentives.mockReturnValue({
      incentives: mockIncentives,
      isLoading: false,
      error: null
    });

    // Act
    const { container } = render(<IncentivesPanel hostId={1} />, { wrapper });

    // Assert
    const progressBar = container.querySelector('[data-testid="level-progress"]');
    expect(progressBar).toBeInTheDocument();
  });

  it('should display loading state', () => {
    // Arrange
    mockUseHostIncentives.mockReturnValue({
      incentives: null,
      isLoading: true,
      error: null
    });

    // Act
    render(<IncentivesPanel hostId={1} />, { wrapper });

    // Assert
    expect(screen.getByText(/Carregando/i)).toBeInTheDocument();
  });

  it('should handle error state', () => {
    // Arrange
    mockUseHostIncentives.mockReturnValue({
      incentives: null,
      isLoading: false,
      error: new Error('Failed to load incentives')
    });

    // Act
    render(<IncentivesPanel hostId={1} />, { wrapper });

    // Assert
    expect(screen.getByText(/Erro ao carregar incentivos/i)).toBeInTheDocument();
  });
});

