/**
 * ✅ TESTES: VOTING PANEL COMPONENT
 * Testes unitários para componente VotingPanel
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import { VotingPanel } from '@/components/group-travel/VotingPanel';

// Mock de fetch
global.fetch = jest.fn();

// Mock de toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock de auth
jest.mock('@/lib/auth', () => ({
  getUser: () => ({ id: 1, email: 'test@test.com' }),
  getToken: () => 'mock-token',
}));

// Mock do radix-ui-progress
jest.mock('@radix-ui/react-progress', () => {
  const React = require('react');
  const Root = React.forwardRef((props, ref) => {
    const { children, ...rest } = props;
    return React.createElement('div', { ...rest, ref }, children);
  });
  Root.displayName = 'ProgressRoot';
  const Indicator = React.forwardRef((props, ref) => {
    const { children, ...rest } = props;
    return React.createElement('div', { ...rest, ref }, children);
  });
  Indicator.displayName = 'ProgressIndicator';
  return { Root, Indicator };
});

describe('VotingPanel Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it('deve renderizar corretamente', async () => {
    const mockItems = [
      {
        id: 1,
        wishlist_id: 1,
        item_name: 'Test Property',
        votes_up: 5,
        votes_down: 1,
        votes_maybe: 2,
        total_votes: 8,
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockItems }),
    });

    const { container } = render(<VotingPanel wishlistId={1} />);

    await waitFor(() => {
      // Verificar se o componente renderiza
      const panelText = screen.queryByText(/Painel/i) ||
                       screen.queryByText(/Votação/i) ||
                       container.textContent?.includes('Painel');
      expect(panelText).toBeTruthy();
    }, { timeout: 3000 });
  });

  it('deve exibir loading inicial', () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

    const { container } = render(<VotingPanel wishlistId={1} />);

    // Verificar se há indicador de loading
    const loadingText = screen.queryByText(/Carregando/i) ||
                       container.textContent?.includes('Carregando');
    expect(loadingText).toBeTruthy();
  });

  it('deve exibir mensagem quando não há itens', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [] }),
    });

    const { container } = render(<VotingPanel wishlistId={1} />);

    await waitFor(() => {
      // Verificar se há mensagem de "nenhum item"
      const noItemsText = screen.queryByText(/Nenhum/i) ||
                         screen.queryByText(/item/i) ||
                         container.textContent?.includes('Nenhum');
      expect(noItemsText).toBeTruthy();
    }, { timeout: 3000 });
  });
});

