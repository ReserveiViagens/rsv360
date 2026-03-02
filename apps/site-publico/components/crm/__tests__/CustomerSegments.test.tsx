/**
 * Testes Unitários - CustomerSegments Component
 */

import { render, screen, waitFor } from '@testing-library/react';
import { CustomerSegments } from '../CustomerSegments';

// Mock do fetch
global.fetch = jest.fn();

describe('CustomerSegments', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('deve renderizar o componente corretamente', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: [],
      }),
    });

    render(<CustomerSegments />);

    await waitFor(() => {
      expect(screen.getByText(/segmentos/i)).toBeInTheDocument();
    });
  });

  it('deve exibir lista de segmentos quando dados estão disponíveis', async () => {
    const mockSegments = [
      {
        id: 1,
        name: 'VIP',
        description: 'Clientes VIP',
        customer_count: 10,
        is_active: true,
        is_auto_update: true,
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockSegments,
      }),
    });

    render(<CustomerSegments />);

    await waitFor(() => {
      expect(screen.getByText('VIP')).toBeInTheDocument();
    });
  });

  it('deve exibir distribuição de segmentos', async () => {
    const mockSegments = [
      {
        id: 1,
        name: 'VIP',
        customer_count: 10,
      },
      {
        id: 2,
        name: 'Regular',
        customer_count: 20,
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockSegments,
      }),
    });

    render(<CustomerSegments />);

    await waitFor(() => {
      expect(screen.getByText('VIP')).toBeInTheDocument();
      expect(screen.getByText('Regular')).toBeInTheDocument();
    });
  });
});

