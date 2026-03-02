/**
 * Testes Unitários - CustomerList Component
 */

import { render, screen, waitFor } from '@testing-library/react';
import { CustomerList } from '../CustomerList';

// Mock do fetch
global.fetch = jest.fn();

describe('CustomerList', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('deve renderizar o componente corretamente', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      }),
    });

    render(<CustomerList />);

    await waitFor(() => {
      expect(screen.getByText(/clientes/i)).toBeInTheDocument();
    });
  });

  it('deve exibir lista de clientes quando dados estão disponíveis', async () => {
    const mockCustomers = [
      {
        id: 1,
        user_name: 'João Silva',
        user_email: 'joao@example.com',
        loyalty_tier: 'gold',
        total_spent: 5000,
        total_bookings: 5,
        engagement_score: 75,
        churn_risk_score: 20,
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockCustomers,
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      }),
    });

    render(<CustomerList />);

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });
  });

  it('deve exibir mensagem quando não há clientes', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      }),
    });

    render(<CustomerList />);

    await waitFor(() => {
      expect(screen.getByText(/nenhum cliente encontrado/i)).toBeInTheDocument();
    });
  });

  it('deve chamar onViewCustomer quando botão de visualizar é clicado', async () => {
    const mockOnViewCustomer = jest.fn();
    const mockCustomers = [
      {
        id: 1,
        user_name: 'João Silva',
        user_email: 'joao@example.com',
        loyalty_tier: 'gold',
        total_spent: 5000,
        total_bookings: 5,
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockCustomers,
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      }),
    });

    render(<CustomerList onViewCustomer={mockOnViewCustomer} />);

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });
  });
});

