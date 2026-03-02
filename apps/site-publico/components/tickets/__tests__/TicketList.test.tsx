/**
 * Testes Unitários para TicketList
 */

import { render, screen, waitFor } from '@testing-library/react';
import { TicketList } from '../TicketList';

// Mock do fetch
global.fetch = jest.fn();

// Mock do WebSocket
global.WebSocket = jest.fn().mockImplementation(() => ({
  onopen: null,
  onmessage: null,
  onerror: null,
  onclose: null,
  close: jest.fn()
}));

describe('TicketList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('token', 'test-token');
  });

  it('deve renderizar a lista de tickets', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [],
        pagination: {
          total: 0,
          limit: 20,
          offset: 0,
          has_more: false
        }
      })
    });

    render(<TicketList />);

    await waitFor(() => {
      expect(screen.getByText(/tickets/i)).toBeInTheDocument();
    });
  });

  it('deve exibir tickets quando disponíveis', async () => {
    const mockTickets = [
      {
        id: 1,
        ticket_number: 'TKT-001',
        subject: 'Test Ticket',
        status: 'open',
        priority: 'high',
        created_at: '2025-12-03T10:00:00Z'
      }
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: mockTickets,
        pagination: {
          total: 1,
          limit: 20,
          offset: 0,
          has_more: false
        }
      })
    });

    render(<TicketList />);

    await waitFor(() => {
      expect(screen.getByText(/TKT-001/i)).toBeInTheDocument();
    });
  });
});

