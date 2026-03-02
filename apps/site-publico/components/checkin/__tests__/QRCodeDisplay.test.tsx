/**
 * Testes Unitários para QRCodeDisplay
 */

import { render, screen } from '@testing-library/react';
import { QRCodeDisplay } from '../QRCodeDisplay';

describe('QRCodeDisplay', () => {
  it('deve renderizar QR code quando fornecido', () => {
    render(
      <QRCodeDisplay
        qrCode="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        checkInCode="CHK-123456"
      />
    );

    expect(screen.getByText(/CHK-123456/i)).toBeInTheDocument();
  });

  it('deve exibir mensagem quando QR code não está disponível', () => {
    render(
      <QRCodeDisplay
        qrCode={null}
        checkInCode="CHK-123456"
      />
    );

    expect(screen.getByText(/qr code não disponível/i)).toBeInTheDocument();
  });

  it('deve permitir download do QR code', () => {
    render(
      <QRCodeDisplay
        qrCode="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        checkInCode="CHK-123456"
      />
    );

    expect(screen.getByRole('button', { name: /baixar/i })).toBeInTheDocument();
  });
});

