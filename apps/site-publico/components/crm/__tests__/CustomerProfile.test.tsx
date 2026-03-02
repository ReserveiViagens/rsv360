/**
 * Testes Unitários - CustomerProfile Component
 */

import { render, screen, waitFor } from '@testing-library/react';
import { CustomerProfile } from '../CustomerProfile';

// Mock do fetch
global.fetch = jest.fn();

describe('CustomerProfile', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('deve renderizar o componente corretamente', async () => {
    const mockCustomer = {
      id: 1,
      user_name: 'João Silva',
      user_email: 'joao@example.com',
      loyalty_tier: 'gold',
      total_spent: 5000,
      total_bookings: 5,
      engagement_score: 75,
      churn_risk_score: 20,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockCustomer,
      }),
    });

    render(<CustomerProfile customerId={1} />);

    await waitFor(() => {
      expect(screen.getByText(/perfil do cliente/i)).toBeInTheDocument();
    });
  });

  it('deve exibir informações do cliente quando dados estão disponíveis', async () => {
    const mockCustomer = {
      id: 1,
      user_name: 'João Silva',
      user_email: 'joao@example.com',
      loyalty_tier: 'gold',
      total_spent: 5000,
      total_bookings: 5,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockCustomer,
      }),
    });

    render(<CustomerProfile customerId={1} />);

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
      expect(screen.getByText('joao@example.com')).toBeInTheDocument();
    });
  });

  it('deve exibir erro quando cliente não é encontrado', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({
        success: false,
        error: 'Cliente não encontrado',
      }),
    });

    render(<CustomerProfile customerId={999} />);

    await waitFor(() => {
      expect(screen.getByText(/erro/i)).toBeInTheDocument();
    });
  });
});

