/**
 * ✅ FASE 5 - ETAPA 5.3: Testes Frontend - PricingCalendar Component
 * Testes para o componente de calendário de preços
 * 
 * @module __tests__/components/pricing/PricingCalendar.test
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import PricingCalendar from '@/components/pricing/PricingCalendar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock do hook
jest.mock('@/hooks/usePricingCalendar', () => ({
  usePricingCalendar: jest.fn()
}));

const mockUsePricingCalendar = require('@/hooks/usePricingCalendar').usePricingCalendar;

describe('PricingCalendar', () => {
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

  const mockPrices = [
    { date: '2025-12-15', price: 100, suggestedPrice: 110, demand: 80 },
    { date: '2025-12-16', price: 105, suggestedPrice: 115, demand: 85 },
    { date: '2025-12-17', price: 110, suggestedPrice: 120, demand: 90 }
  ];

  it('should render calendar with prices', () => {
    // Arrange
    mockUsePricingCalendar.mockReturnValue({
      prices: mockPrices,
      isLoading: false,
      error: null
    });

    // Act
    render(<PricingCalendar propertyId="prop-123" />, { wrapper });

    // Assert
    expect(screen.getByText('Calendário de Preços')).toBeInTheDocument();
  });

  it('should display loading state', () => {
    // Arrange
    mockUsePricingCalendar.mockReturnValue({
      prices: [],
      isLoading: true,
      error: null
    });

    // Act
    render(<PricingCalendar propertyId="prop-123" />, { wrapper });

    // Assert
    expect(screen.getByText(/Carregando/i)).toBeInTheDocument();
  });

  it('should display empty state when no prices', () => {
    // Arrange
    mockUsePricingCalendar.mockReturnValue({
      prices: [],
      isLoading: false,
      error: null
    });

    // Act
    render(<PricingCalendar propertyId="prop-123" />, { wrapper });

    // Assert
    expect(screen.getByText(/Nenhum preço disponível/i)).toBeInTheDocument();
  });

  it('should open modal when date is clicked', async () => {
    // Arrange
    mockUsePricingCalendar.mockReturnValue({
      prices: mockPrices,
      isLoading: false,
      error: null
    });

    // Act
    render(<PricingCalendar propertyId="prop-123" />, { wrapper });

    const dateCell = screen.getByText('15'); // December 15
    fireEvent.click(dateCell);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/Detalhes do Preço/i)).toBeInTheDocument();
      expect(screen.getByText(/R\$ 100/i)).toBeInTheDocument();
    });
  });

  it('should allow editing price', async () => {
    // Arrange
    const updatePrice = jest.fn();
    mockUsePricingCalendar.mockReturnValue({
      prices: mockPrices,
      isLoading: false,
      error: null,
      updatePrice
    });

    // Act
    render(<PricingCalendar propertyId="prop-123" />, { wrapper });

    const dateCell = screen.getByText('15');
    fireEvent.click(dateCell);

    const editButton = screen.getByText('Editar Preço');
    fireEvent.click(editButton);

    const priceInput = screen.getByLabelText(/Preço/i);
    fireEvent.change(priceInput, { target: { value: '120' } });

    const saveButton = screen.getByText('Salvar');
    fireEvent.click(saveButton);

    // Assert
    await waitFor(() => {
      expect(updatePrice).toHaveBeenCalledWith('2025-12-15', 120);
    });
  });

  it('should display color coding based on demand', () => {
    // Arrange
    mockUsePricingCalendar.mockReturnValue({
      prices: mockPrices,
      isLoading: false,
      error: null
    });

    // Act
    const { container } = render(<PricingCalendar propertyId="prop-123" />, { wrapper });

    // Assert
    // High demand dates should have different styling
    const highDemandCell = container.querySelector('[data-demand="high"]');
    expect(highDemandCell).toBeInTheDocument();
  });

  it('should filter by date range', async () => {
    // Arrange
    mockUsePricingCalendar.mockReturnValue({
      prices: mockPrices,
      isLoading: false,
      error: null
    });

    // Act
    render(<PricingCalendar propertyId="prop-123" />, { wrapper });

    const startDateInput = screen.getByLabelText(/Data Inicial/i);
    fireEvent.change(startDateInput, { target: { value: '2025-12-15' } });

    const endDateInput = screen.getByLabelText(/Data Final/i);
    fireEvent.change(endDateInput, { target: { value: '2025-12-17' } });

    // Assert
    await waitFor(() => {
      expect(mockUsePricingCalendar).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: expect.any(Date),
          endDate: expect.any(Date)
        })
      );
    });
  });
});

