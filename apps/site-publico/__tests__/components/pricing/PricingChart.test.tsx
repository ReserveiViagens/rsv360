/**
 * ✅ FASE 5 - ETAPA 5.3: Testes Frontend - PricingChart Component
 * Testes para o componente de gráfico de preços
 * 
 * @module __tests__/components/pricing/PricingChart.test
 */

import { render, screen, waitFor } from '@testing-library/react';
import PricingChart from '@/components/pricing/PricingChart';

// Mock do html2canvas (usado no export)
jest.mock('html2canvas', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue({
    toBlob: jest.fn((callback) => {
      const blob = new Blob(['test'], { type: 'image/png' });
      callback(blob);
    })
  })
}));

// Mock do toast
jest.mock('sonner', () => ({
  toast: {
    loading: jest.fn(),
    success: jest.fn(),
    error: jest.fn()
  }
}));

describe('PricingChart', () => {
  const mockData = [
    { date: '2025-01-01', price: 100, suggestedPrice: 110, demand: 80 },
    { date: '2025-01-02', price: 105, suggestedPrice: 115, demand: 85 },
    { date: '2025-01-03', price: 110, suggestedPrice: 120, demand: 90 }
  ];

  it('should render chart with data', () => {
    // Act
    render(<PricingChart propertyId="prop-123" data={mockData} />);

    // Assert
    expect(screen.getByText('Gráfico de Preços')).toBeInTheDocument();
    expect(screen.getByText('Comparação entre preço real e preço sugerido por IA')).toBeInTheDocument();
  });

  it('should display loading state', () => {
    // Act
    render(<PricingChart propertyId="prop-123" data={[]} isLoading={true} />);

    // Assert
    expect(screen.getByText('Gráfico de Preços')).toBeInTheDocument();
  });

  it('should display empty state when no data', () => {
    // Act
    render(<PricingChart propertyId="prop-123" data={[]} />);

    // Assert
    expect(screen.getByText('Nenhum dado disponível para o período selecionado')).toBeInTheDocument();
  });

  it('should calculate and display statistics', () => {
    // Act
    render(<PricingChart propertyId="prop-123" data={mockData} />);

    // Assert
    // Verifica se as estatísticas são exibidas
    expect(screen.getByText(/Preço Médio Real/i)).toBeInTheDocument();
    expect(screen.getByText(/Preço Médio Sugerido/i)).toBeInTheDocument();
    expect(screen.getByText(/Diferença/i)).toBeInTheDocument();
  });

  it('should export chart as PNG', async () => {
    // Arrange
    const { container } = render(<PricingChart propertyId="prop-123" data={mockData} />);
    
    // Mock createObjectURL e download
    global.URL.createObjectURL = jest.fn(() => 'blob:url');
    global.URL.revokeObjectURL = jest.fn();
    
    const createElementSpy = jest.spyOn(document, 'createElement');
    const mockLink = {
      href: '',
      download: '',
      click: jest.fn(),
      remove: jest.fn()
    };
    createElementSpy.mockReturnValue(mockLink as any);

    // Act
    const exportButton = screen.getByText('Exportar');
    exportButton.click();

    // Assert
    await waitFor(() => {
      expect(createElementSpy).toHaveBeenCalledWith('a');
    });
  });
});

