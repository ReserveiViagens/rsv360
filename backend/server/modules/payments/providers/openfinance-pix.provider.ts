import { PIXProviderInterface, CreatePIXDTO, PIXResult } from '../interfaces';

export class OpenFinancePIXProvider implements PIXProviderInterface {
  name = 'openfinance';
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;
  private certPath: string;
  private keyPath: string;
  private accessToken: string | null = null;

  constructor() {
    this.baseUrl = process.env.PIX_BASE_URL || 'https://api.pix.bcb.gov.br';
    this.clientId = process.env.PIX_CLIENT_ID!;
    this.clientSecret = process.env.PIX_CLIENT_SECRET!;
    this.certPath = process.env.PIX_CERT_PATH!;
    this.keyPath = process.env.PIX_KEY_PATH!;
  }

  async createPIXCharge(data: CreatePIXDTO): Promise<PIXResult> {
    await this.authenticate();

    const expiresIn = data.expiresIn || 3600; // 1 hour default
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    const payload = {
      calendario: {
        expiracao: expiresIn,
      },
      devedor: {
        cpf: '12345678900', // Get from customer
        nome: 'Customer Name',
      },
      valor: {
        original: data.amount.toFixed(2),
      },
      chave: process.env.PIX_KEY || 'chave@pix.com',
      solicitacaoPagador: data.description,
    };

    const response = await this.makeRequest('/cob', 'PUT', payload);

    const qrCode = await this.generateQRCode(response.brcode);

    return {
      id: response.txid,
      externalId: response.txid,
      qrCode: response.brcode,
      qrCodeBase64: qrCode,
      expiresAt,
      status: 'pending',
      metadata: response,
    };
  }

  async getPIXCharge(externalId: string): Promise<PIXResult> {
    await this.authenticate();

    const response = await this.makeRequest(`/cob/${externalId}`, 'GET');

    const qrCode = await this.generateQRCode(response.brcode);

    return {
      id: response.txid,
      externalId: response.txid,
      qrCode: response.brcode,
      qrCodeBase64: qrCode,
      expiresAt: new Date(response.calendario.criacao + response.calendario.expiracao * 1000),
      status: response.status,
      metadata: response,
    };
  }

  async cancelPIXCharge(externalId: string): Promise<PIXResult> {
    // PIX charges cannot be cancelled directly, but we can mark as cancelled
    const charge = await this.getPIXCharge(externalId);
    return {
      ...charge,
      status: 'cancelled',
    };
  }

  async generateQRCode(pixCode: string): Promise<string> {
    const QRCode = require('qrcode');
    return await QRCode.toDataURL(pixCode);
  }

  private async authenticate(): Promise<void> {
    if (this.accessToken) return;

    const response = await fetch(`${this.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        scope: 'cob.read cob.write pix.read pix.write',
      }),
      // agent: this.createHttpsAgent(), // TODO: Implement mTLS for production
    });

    const data = await response.json();
    this.accessToken = data.access_token;
  }

  private async makeRequest(endpoint: string, method: string, body?: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`,
      },
      body: body ? JSON.stringify(body) : undefined,
      // agent: this.createHttpsAgent(), // TODO: Implement mTLS for production
    });

    return await response.json();
  }

  private createHttpsAgent(): any {
    // For mTLS, need to load certificates
    // This is a placeholder - actual implementation would use https.Agent with cert and key
    const https = require('https');
    return new https.Agent({
      cert: require('fs').readFileSync(this.certPath),
      key: require('fs').readFileSync(this.keyPath),
      rejectUnauthorized: false, // In production, set to true
    });
  }
}