/**
 * Testes unitários para DemandHeatmap
 */

import { render, screen, waitFor } from '@testing-library/react';
import { DemandHeatmap } from '../DemandHeatmap';

global.fetch = jest.fn();

describe('DemandHeatmap', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('deve renderizar componente corretamente', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          heatmap: [],
          max_demand: 0,
          date_range: {
            start: '2024-01-01',
            end: '2024-12-31',
          },
        },
      }),
    });

    render(<DemandHeatmap />);

    await waitFor(() => {
      expect(screen.getByText(/heatmap de demanda/i)).toBeInTheDocument();
    });
  });
});

