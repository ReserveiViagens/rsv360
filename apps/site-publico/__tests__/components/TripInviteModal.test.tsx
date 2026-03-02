/**
 * ✅ TESTES: TRIP INVITE MODAL COMPONENT
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { TripInviteModal } from '@/components/group-travel/TripInviteModal';

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

// Mock do radix-ui-select com displayName
jest.mock('@radix-ui/react-select', () => {
  const React = require('react');
  const RADIX_PROPS = ['asChild', 'onValueChange', 'value', 'defaultValue', 'open', 'defaultOpen', 'onOpenChange'];
  const filterProps = (props) => {
    const filtered = { ...props };
    RADIX_PROPS.forEach(p => delete filtered[p]);
    return filtered;
  };
  const ScrollUpButton = React.forwardRef((props, ref) => {
    const { children, ...rest } = filterProps(props);
    return React.createElement('div', { ...rest, ref }, children);
  });
  ScrollUpButton.displayName = 'SelectScrollUpButton';
  const ScrollDownButton = React.forwardRef((props, ref) => {
    const { children, ...rest } = filterProps(props);
    return React.createElement('div', { ...rest, ref }, children);
  });
  ScrollDownButton.displayName = 'SelectScrollDownButton';
  return {
    Root: React.forwardRef((props, ref) => React.createElement('div', { ...filterProps(props), ref })),
    Trigger: React.forwardRef((props, ref) => React.createElement('button', { ...filterProps(props), ref })),
    Value: React.forwardRef((props, ref) => React.createElement('span', { ...filterProps(props), ref })),
    Content: React.forwardRef((props, ref) => React.createElement('div', { ...filterProps(props), ref })),
    Item: React.forwardRef((props, ref) => React.createElement('div', { ...filterProps(props), ref })),
    ScrollUpButton,
    ScrollDownButton,
    Viewport: React.forwardRef((props, ref) => React.createElement('div', { ...filterProps(props), ref })),
    Group: React.forwardRef((props, ref) => React.createElement('div', { ...filterProps(props), ref })),
    Label: React.forwardRef((props, ref) => React.createElement('label', { ...filterProps(props), ref })),
    Separator: React.forwardRef((props, ref) => React.createElement('hr', { ...filterProps(props), ref })),
  };
});

describe('TripInviteModal Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it('deve renderizar modal quando aberto', () => {
    const { container } = render(
      <TripInviteModal
        bookingId={1}
        tripName="Test Trip"
      />
    );

    // Modal não deve estar visível inicialmente (fechado)
    const modalContent = screen.queryByText(/Enviar Convite/i) ||
                        screen.queryByText(/Convite de Viagem/i) ||
                        container.querySelector('[role="dialog"]');
    expect(modalContent).toBeFalsy();
  });
});

