/**
 * Testes unitários para CompetitorBenchmark
 */

import { render, screen, waitFor } from '@testing-library/react';
import { CompetitorBenchmark } from '../CompetitorBenchmark';

global.fetch = jest.fn();

describe('CompetitorBenchmark', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('deve renderizar componente corretamente', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          property: {
            id: 1,
            name: 'Propriedade Teste',
            current_price: 100,
            avg_booking_value: 100,
            total_bookings: 10,
            avg_rating: 4.5,
          },
          competitors: [],
          benchmarking: {
            market_avg_price: 100,
            price_position: 'competitive',
            price_difference_percent: 0,
            recommendation: 'Preço bem posicionado',
          },
        },
      }),
    });

    render(<CompetitorBenchmark propertyId={1} />);

    await waitFor(() => {
      expect(screen.getByText(/benchmark de concorrentes/i)).toBeInTheDocument();
    });
  });
});

