/**
 * Testes unitários para RewardRedemption
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { RewardRedemption } from '../RewardRedemption';

global.fetch = jest.fn();

describe('RewardRedemption', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('deve renderizar formulário de resgate', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            id: 1,
            name: 'Desconto 10%',
            points_required: 1000,
            reward_type: 'discount',
            reward_value: 10,
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { current_points: 5000 },
        }),
      });

    render(<RewardRedemption rewardId={1} />);

    await waitFor(() => {
      expect(screen.getByText('Desconto 10%')).toBeInTheDocument();
    });
  });

  it('deve exibir erro quando pontos insuficientes', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            id: 1,
            name: 'Desconto 10%',
            points_required: 10000,
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { current_points: 1000 },
        }),
      });

    render(<RewardRedemption rewardId={1} />);

    await waitFor(() => {
      expect(screen.getByText(/pontos insuficientes/i)).toBeInTheDocument();
    });
  });
});

