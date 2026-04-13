import { CreatePIXDTO, PIXResult } from '../interfaces';

export class PIXService {
  async createPIXCharge(enterpriseId: string, data: CreatePIXDTO): Promise<PIXResult> {
    // Mock implementation for testing
    return {
      id: 'pix_mock_' + Date.now(),
      externalId: 'pix_mp_' + Date.now(),
      status: 'pending',
      qrCode: '00020101021126890014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-42661417400016BR.COM.SOFTPAY0111Test PIX520400005303986540510.005802BR5913Test Customer6009SAO PAULO62070503***6304E2CA',
      qrCodeBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      amount: data.amount,
      description: data.description,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  async getPIXCharge(id: string): Promise<PIXResult> {
    // Mock implementation for testing
    return {
      id,
      externalId: 'pix_mp_' + id,
      status: 'pending',
      qrCode: 'mock_qr_code',
      qrCodeBase64: 'mock_qr_base64',
      amount: 100.00,
      description: 'Mock PIX charge',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  async cancelPIXCharge(id: string): Promise<PIXResult> {
    // Mock implementation for testing
    return {
      id,
      externalId: 'pix_mp_' + id,
      status: 'cancelled',
      qrCode: 'mock_qr_code',
      qrCodeBase64: 'mock_qr_base64',
      amount: 100.00,
      description: 'Cancelled PIX charge',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  async generateQRCode(pixCode: string): Promise<string> {
    // Mock implementation for testing
    return 'mock_qr_code_base64';
  }

  async checkPIXStatus(id: string): Promise<string> {
    // Mock implementation for testing
    return 'pending';
  }

  async listPIXCharges(limit = 10, offset = 0): Promise<PIXResult[]> {
    // Mock implementation for testing
    return [{
      id: 'pix_mock_1',
      externalId: 'pix_mp_1',
      status: 'pending',
      qrCode: 'mock_qr_code',
      qrCodeBase64: 'mock_qr_base64',
      amount: 50.00,
      description: 'Mock PIX charge',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }];
  }
}