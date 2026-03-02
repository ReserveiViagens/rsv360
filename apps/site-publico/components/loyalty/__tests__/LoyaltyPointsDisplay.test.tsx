/**
 * Testes unitários para LoyaltyPointsDisplay
 */

import { render, screen, waitFor } from '@testing-library/react';
import { LoyaltyPointsDisplay } from '../LoyaltyPointsDisplay';

// Mock das APIs
global.fetch = jest.fn();

describe('LoyaltyPointsDisplay', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('deve renderizar pontos do usuário', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            id: 1,
            user_id: 1,
            current_points: 5000,
            lifetime_points: 10000,
            points_redeemed: 5000,
            tier: 'gold',
            tier_points_required: 5000,
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            { id: 1, name: 'Bronze', min_points: 0, max_points: 999 },
            { id: 2, name: 'Silver', min_points: 1000, max_points: 4999 },
            { id: 3, name: 'Gold', min_points: 5000, max_points: 14999 },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { transactions: [] },
        }),
      });

    render(<LoyaltyPointsDisplay />);

    await waitFor(() => {
      expect(screen.getByText('5.000')).toBeInTheDocument();
    });
  });

  it('deve exibir erro quando falhar ao carregar', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Erro de rede'));

    render(<LoyaltyPointsDisplay />);

    await waitFor(() => {
      expect(screen.getByText(/erro/i)).toBeInTheDocument();
    });
  });
});

