/**
 * Testes Unitários para CheckinRequestForm
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CheckinRequestForm } from '../CheckinRequestForm';
import { useRouter } from 'next/navigation';

// Mock do useRouter
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

// Mock do fetch
global.fetch = jest.fn();

describe('CheckinRequestForm', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
    refresh: jest.fn()
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('deve renderizar o formulário corretamente', () => {
    render(
      <CheckinRequestForm
        bookingId={1}
        propertyId={1}
      />
    );

    expect(screen.getByText(/solicitar check-in/i)).toBeInTheDocument();
  });

  it('deve exibir erro quando usuário não está autenticado', async () => {
    render(
      <CheckinRequestForm
        bookingId={1}
        propertyId={1}
      />
    );

    const submitButton = screen.getByRole('button', { name: /solicitar check-in/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/você precisa estar autenticado/i)).toBeInTheDocument();
    });
  });

  it('deve criar check-in com sucesso quando autenticado', async () => {
    localStorage.setItem('token', 'test-token');

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1 })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            id: 1,
            booking_id: 1,
            property_id: 1,
            status: 'pending'
          }
        })
      });

    const onSuccess = jest.fn();

    render(
      <CheckinRequestForm
        bookingId={1}
        propertyId={1}
        onSuccess={onSuccess}
      />
    );

    const submitButton = screen.getByRole('button', { name: /solicitar check-in/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(1);
    });
  });

  it('deve exibir erro quando API retorna erro', async () => {
    localStorage.setItem('token', 'test-token');

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1 })
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Erro ao criar check-in' })
      });

    render(
      <CheckinRequestForm
        bookingId={1}
        propertyId={1}
      />
    );

    const submitButton = screen.getByRole('button', { name: /solicitar check-in/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/erro ao criar check-in/i)).toBeInTheDocument();
    });
  });
});

