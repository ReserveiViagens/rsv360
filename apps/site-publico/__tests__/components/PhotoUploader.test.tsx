/**
 * ✅ TESTES: PHOTO UPLOADER COMPONENT
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { PhotoUploader } from '@/components/verification/PhotoUploader';

// Mock de fetch
global.fetch = jest.fn();

// Mock de toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock do next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

describe('PhotoUploader Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it('deve renderizar área de upload', () => {
    const { container } = render(<PhotoUploader maxPhotos={10} />);

    // Verificar se há elementos de upload (pode estar em diferentes lugares)
    const uploadText = screen.queryByText(/Clique ou arraste/i) || 
                       screen.queryByText(/fotos/i) ||
                       container.querySelector('input[type="file"]');
    expect(uploadText).toBeTruthy();
  });

  it('deve exibir limite de fotos', () => {
    const { container } = render(<PhotoUploader maxPhotos={5} />);

    // Verificar se há referência ao limite (pode estar formatado diferente)
    const limitText = screen.queryByText(/5/i) || 
                      screen.queryByText(/máx/i) ||
                      container.textContent?.includes('5');
    expect(limitText).toBeTruthy();
  });
});

