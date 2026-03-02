/**
 * Testes Unitários para TicketForm
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TicketForm } from '../TicketForm';

// Mock do fetch
global.fetch = jest.fn();

describe('TicketForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('token', 'test-token');
  });

  it('deve renderizar o formulário corretamente', () => {
    render(<TicketForm onSuccess={() => {}} />);

    expect(screen.getByLabelText(/assunto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument();
  });

  it('deve criar ticket com dados válidos', async () => {
    const onSuccess = jest.fn();

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          id: 1,
          ticket_number: 'TKT-001',
          subject: 'Test Ticket',
          status: 'open'
        }
      })
    });

    render(<TicketForm onSuccess={onSuccess} />);

    await userEvent.type(screen.getByLabelText(/assunto/i), 'Test Ticket');
    await userEvent.type(screen.getByLabelText(/descrição/i), 'Test Description');
    await userEvent.click(screen.getByRole('button', { name: /criar/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('deve exibir erro quando dados são inválidos', async () => {
    render(<TicketForm onSuccess={() => {}} />);

    await userEvent.click(screen.getByRole('button', { name: /criar/i }));

    await waitFor(() => {
      expect(screen.getByText(/obrigatório/i)).toBeInTheDocument();
    });
  });
});

