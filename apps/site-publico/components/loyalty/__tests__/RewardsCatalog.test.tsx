/**
 * Testes unitários para RewardsCatalog
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { RewardsCatalog } from '../RewardsCatalog';

global.fetch = jest.fn();

describe('RewardsCatalog', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('deve renderizar catálogo de recompensas', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            {
              id: 1,
              name: 'Desconto 10%',
              description: 'Desconto em reservas',
              points_required: 1000,
              reward_type: 'discount',
              reward_value: 10,
              is_active: true,
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { current_points: 5000 },
        }),
      });

    render(<RewardsCatalog />);

    await waitFor(() => {
      expect(screen.getByText('Desconto 10%')).toBeInTheDocument();
    });
  });

  it('deve chamar onRedeem ao clicar em resgatar', async () => {
    const onRedeem = jest.fn();

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            {
              id: 1,
              name: 'Desconto 10%',
              points_required: 1000,
              reward_type: 'discount',
              is_active: true,
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { current_points: 5000 },
        }),
      });

    render(<RewardsCatalog onRedeem={onRedeem} />);

    await waitFor(() => {
      const button = screen.getByText('Resgatar');
      fireEvent.click(button);
      expect(onRedeem).toHaveBeenCalledWith(1);
    });
  });
});

