/**
 * ✅ TESTES: HOST BADGE COMPONENT
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { HostBadge } from '@/components/quality/HostBadge';
import type { BadgeData } from '@/components/quality/HostBadge';

// Mock do framer-motion diretamente no teste
jest.mock('framer-motion', () => {
  const React = require('react');
  const FRAMER_PROPS = ['initial', 'animate', 'whileHover', 'whileTap', 'transition', 'exit', 'variants'];
  const createMotion = (Component) => React.forwardRef((props, ref) => {
    const filtered = { ...props };
    FRAMER_PROPS.forEach(p => delete filtered[p]);
    const { children, ...rest } = filtered;
    return React.createElement(Component, { ...rest, ref }, children);
  });
  return {
    motion: {
      div: createMotion('div'),
      span: createMotion('span'),
    },
    AnimatePresence: ({ children }) => children,
  };
});

// Mock do next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

const mockBadge: BadgeData = {
  id: '1',
  name: 'Super Host',
  description: 'Host com excelente avaliação',
  category: 'quality',
  rarity: 'legendary',
};

describe('HostBadge Component', () => {
  it('deve renderizar badge ganho', () => {
    const { container } = render(
      <HostBadge
        badge={mockBadge}
        earned={true}
        size="md"
      />
    );

    // Verificar se o texto aparece (pode aparecer múltiplas vezes - no card e no tooltip)
    expect(screen.getAllByText('Super Host').length).toBeGreaterThan(0);
  });

  it('deve renderizar badge não ganho com progresso', () => {
    const { container } = render(
      <HostBadge
        badge={mockBadge}
        earned={false}
        progress={75}
        size="md"
      />
    );

    // Verificar se o texto aparece
    expect(screen.getAllByText('Super Host').length).toBeGreaterThan(0);
  });

  it('deve aplicar classes corretas baseado na raridade', () => {
    const { container } = render(
      <HostBadge
        badge={mockBadge}
        earned={true}
        size="md"
      />
    );

    const card = container.querySelector('.bg-yellow-100');
    expect(card).not.toBeNull();
    expect(card).toBeTruthy();
  });
});

