/**
 * Serviço de Geração de QR Codes
 * Gera QR codes para check-in digital e códigos de acesso
 */

import QRCode from 'qrcode';

export interface QRCodeOptions {
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  type?: 'image/png' | 'image/jpeg' | 'image/webp' | 'svg';
  quality?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  width?: number;
}

export interface QRCodeData {
  checkinId: number;
  checkInCode: string;
  bookingId: number;
  propertyId: number;
  userId: number;
  timestamp: number;
}

/**
 * Gera QR code para check-in
 */
export async function generateCheckinQRCode(
  checkinId: number,
  checkInCode: string,
  bookingId: number,
  propertyId: number,
  userId: number,
  options?: QRCodeOptions
): Promise<{ qrCode: string; qrCodeUrl: string }> {
  const data: QRCodeData = {
    checkinId,
    checkInCode,
    bookingId,
    propertyId,
    userId,
    timestamp: Date.now()
  };

  const qrData = JSON.stringify(data);
  
  const defaultOptions: QRCodeOptions = {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    quality: 0.92,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    width: 300,
    ...options
  };

  try {
    // Gerar QR code como base64
    const qrCode = await QRCode.toDataURL(qrData, defaultOptions);
    
    // Gerar QR code como SVG (para melhor qualidade)
    const qrCodeSvg = await QRCode.toString(qrData, {
      type: 'svg',
      errorCorrectionLevel: defaultOptions.errorCorrectionLevel || 'M',
      margin: defaultOptions.margin || 1,
      color: defaultOptions.color
    });

    return {
      qrCode: qrCode,
      qrCodeUrl: `data:image/svg+xml;base64,${Buffer.from(qrCodeSvg).toString('base64')}`
    };
  } catch (error) {
    console.error('Erro ao gerar QR code:', error);
    throw new Error('Falha ao gerar QR code');
  }
}

/**
 * Gera QR code para código de acesso (smart lock, etc)
 */
export async function generateAccessQRCode(
  accessCode: string,
  expiresAt?: Date,
  options?: QRCodeOptions
): Promise<{ qrCode: string; qrCodeUrl: string }> {
  const data = {
    accessCode,
    expiresAt: expiresAt?.toISOString(),
    timestamp: Date.now()
  };

  const qrData = JSON.stringify(data);
  
  const defaultOptions: QRCodeOptions = {
    errorCorrectionLevel: 'H', // Alta correção para códigos de acesso
    type: 'image/png',
    quality: 0.92,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    width: 300,
    ...options
  };

  try {
    const qrCode = await QRCode.toDataURL(qrData, defaultOptions);
    const qrCodeSvg = await QRCode.toString(qrData, {
      type: 'svg',
      errorCorrectionLevel: defaultOptions.errorCorrectionLevel || 'H',
      margin: defaultOptions.margin || 2,
      color: defaultOptions.color
    });

    return {
      qrCode: qrCode,
      qrCodeUrl: `data:image/svg+xml;base64,${Buffer.from(qrCodeSvg).toString('base64')}`
    };
  } catch (error) {
    console.error('Erro ao gerar QR code de acesso:', error);
    throw new Error('Falha ao gerar QR code de acesso');
  }
}

/**
 * Decodifica dados de um QR code
 */
export function decodeQRCodeData(qrData: string): QRCodeData | null {
  try {
    const data = JSON.parse(qrData) as QRCodeData;
    
    // Validar estrutura
    if (
      typeof data.checkinId === 'number' &&
      typeof data.checkInCode === 'string' &&
      typeof data.bookingId === 'number' &&
      typeof data.propertyId === 'number' &&
      typeof data.userId === 'number' &&
      typeof data.timestamp === 'number'
    ) {
      return data;
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao decodificar QR code:', error);
    return null;
  }
}

/**
 * Valida se um QR code ainda é válido
 */
export function validateQRCodeData(data: QRCodeData, maxAge: number = 24 * 60 * 60 * 1000): boolean {
  const now = Date.now();
  const age = now - data.timestamp;
  
  return age <= maxAge;
}
