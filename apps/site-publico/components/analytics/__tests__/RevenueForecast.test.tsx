/**
 * Testes unitários para RevenueForecast
 */

import { render, screen, waitFor } from '@testing-library/react';
import { RevenueForecast } from '../RevenueForecast';

global.fetch = jest.fn();

describe('RevenueForecast', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('deve renderizar componente corretamente', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          historical: [],
          forecasts: [],
          average_revenue: 0,
          growth_rate: 0,
          months_ahead: 12,
        },
      }),
    });

    render(<RevenueForecast />);

    await waitFor(() => {
      expect(screen.getByText(/previsão de receita/i)).toBeInTheDocument();
    });
  });

  it('deve exibir erro quando falhar ao carregar', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Erro de rede'));

    render(<RevenueForecast />);

    await waitFor(() => {
      expect(screen.getByText(/erro/i)).toBeInTheDocument();
    });
  });
});

