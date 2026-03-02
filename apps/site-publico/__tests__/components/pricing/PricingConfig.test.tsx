/**
 * ✅ FASE 5 - ETAPA 5.3: Testes Frontend - PricingConfig Component
 * Testes para o componente de configuração de preços
 * 
 * @module __tests__/components/pricing/PricingConfig.test
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import PricingConfig from '@/components/pricing/PricingConfig';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock do hook
jest.mock('@/hooks/usePricingConfig', () => ({
  usePricingConfig: jest.fn()
}));

const mockUsePricingConfig = require('@/hooks/usePricingConfig').usePricingConfig;

describe('PricingConfig', () => {
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

  const mockConfig = {
    minPrice: 50,
    maxPrice: 200,
    basePrice: 100,
    changeRate: 0.1,
    eventMultiplier: 1.2,
    weatherImpact: true,
    competitorTracking: true,
    mode: 'conservative' as const
  };

  it('should render configuration form', () => {
    // Arrange
    mockUsePricingConfig.mockReturnValue({
      config: mockConfig,
      isLoading: false,
      error: null
    });

    // Act
    render(<PricingConfig propertyId="prop-123" />, { wrapper });

    // Assert
    expect(screen.getByText('Configuração de Preços')).toBeInTheDocument();
    expect(screen.getByLabelText(/Preço Mínimo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Preço Máximo/i)).toBeInTheDocument();
  });

  it('should display loading state', () => {
    // Arrange
    mockUsePricingConfig.mockReturnValue({
      config: null,
      isLoading: true,
      error: null
    });

    // Act
    render(<PricingConfig propertyId="prop-123" />, { wrapper });

    // Assert
    expect(screen.getByText(/Carregando/i)).toBeInTheDocument();
  });

  it('should update min price', async () => {
    // Arrange
    const updateConfig = jest.fn();
    mockUsePricingConfig.mockReturnValue({
      config: mockConfig,
      isLoading: false,
      error: null,
      updateConfig
    });

    // Act
    render(<PricingConfig propertyId="prop-123" />, { wrapper });

    const minPriceInput = screen.getByLabelText(/Preço Mínimo/i);
    fireEvent.change(minPriceInput, { target: { value: '60' } });

    const saveButton = screen.getByText('Salvar');
    fireEvent.click(saveButton);

    // Assert
    await waitFor(() => {
      expect(updateConfig).toHaveBeenCalledWith(
        expect.objectContaining({ minPrice: 60 })
      );
    });
  });

  it('should validate min price is less than max price', async () => {
    // Arrange
    mockUsePricingConfig.mockReturnValue({
      config: mockConfig,
      isLoading: false,
      error: null
    });

    // Act
    render(<PricingConfig propertyId="prop-123" />, { wrapper });

    const minPriceInput = screen.getByLabelText(/Preço Mínimo/i);
    fireEvent.change(minPriceInput, { target: { value: '250' } }); // Greater than max

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/Preço mínimo deve ser menor que o máximo/i)).toBeInTheDocument();
    });
  });

  it('should update change rate slider', async () => {
    // Arrange
    const updateConfig = jest.fn();
    mockUsePricingConfig.mockReturnValue({
      config: mockConfig,
      isLoading: false,
      error: null,
      updateConfig
    });

    // Act
    render(<PricingConfig propertyId="prop-123" />, { wrapper });

    const changeRateSlider = screen.getByLabelText(/Taxa de Mudança/i);
    fireEvent.change(changeRateSlider, { target: { value: '0.2' } });

    // Assert
    expect(screen.getByText(/20%/i)).toBeInTheDocument();
  });

  it('should toggle weather impact', async () => {
    // Arrange
    const updateConfig = jest.fn();
    mockUsePricingConfig.mockReturnValue({
      config: mockConfig,
      isLoading: false,
      error: null,
      updateConfig
    });

    // Act
    render(<PricingConfig propertyId="prop-123" />, { wrapper });

    const weatherToggle = screen.getByLabelText(/Impacto do Clima/i);
    fireEvent.click(weatherToggle);

    // Assert
    await waitFor(() => {
      expect(updateConfig).toHaveBeenCalledWith(
        expect.objectContaining({ weatherImpact: false })
      );
    });
  });

  it('should toggle competitor tracking', async () => {
    // Arrange
    const updateConfig = jest.fn();
    mockUsePricingConfig.mockReturnValue({
      config: mockConfig,
      isLoading: false,
      error: null,
      updateConfig
    });

    // Act
    render(<PricingConfig propertyId="prop-123" />, { wrapper });

    const competitorToggle = screen.getByLabelText(/Rastreamento de Competidores/i);
    fireEvent.click(competitorToggle);

    // Assert
    await waitFor(() => {
      expect(updateConfig).toHaveBeenCalledWith(
        expect.objectContaining({ competitorTracking: false })
      );
    });
  });

  it('should change pricing mode', async () => {
    // Arrange
    const updateConfig = jest.fn();
    mockUsePricingConfig.mockReturnValue({
      config: mockConfig,
      isLoading: false,
      error: null,
      updateConfig
    });

    // Act
    render(<PricingConfig propertyId="prop-123" />, { wrapper });

    const modeSelect = screen.getByLabelText(/Modo de Precificação/i);
    fireEvent.change(modeSelect, { target: { value: 'aggressive' } });

    // Assert
    await waitFor(() => {
      expect(updateConfig).toHaveBeenCalledWith(
        expect.objectContaining({ mode: 'aggressive' })
      );
    });
  });

  it('should reset to defaults', async () => {
    // Arrange
    const resetConfig = jest.fn();
    mockUsePricingConfig.mockReturnValue({
      config: mockConfig,
      isLoading: false,
      error: null,
      resetConfig
    });

    // Act
    render(<PricingConfig propertyId="prop-123" />, { wrapper });

    const resetButton = screen.getByText('Resetar para Padrões');
    fireEvent.click(resetButton);

    // Assert
    await waitFor(() => {
      expect(resetConfig).toHaveBeenCalled();
    });
  });

  it('should display error state', () => {
    // Arrange
    mockUsePricingConfig.mockReturnValue({
      config: null,
      isLoading: false,
      error: new Error('Failed to load config')
    });

    // Act
    render(<PricingConfig propertyId="prop-123" />, { wrapper });

    // Assert
    expect(screen.getByText(/Erro ao carregar configuração/i)).toBeInTheDocument();
  });
});

