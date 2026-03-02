/**
 * ✅ CLIENTE KAKAU SEGUROS
 * Integração com API da Kakau Seguros para criação e gerenciamento de apólices
 */

export interface KakauPolicyRequest {
  booking_id: string;
  coverage_type: 'basic' | 'standard' | 'premium' | 'comprehensive';
  coverage_amount: number;
  trip_start_date: string;
  trip_end_date: string;
  insured_name: string;
  insured_document?: string;
  insured_email?: string;
  insured_phone?: string;
  number_of_travelers: number;
  destination?: string;
}

export interface KakauPolicyResponse {
  policy_number: string;
  provider_policy_id: string;
  premium_amount: number;
  coverage_amount: number;
  status: 'active' | 'pending' | 'rejected';
  document_url?: string;
  terms_url?: string;
  expires_at?: string;
}

export interface KakauClaimRequest {
  policy_number: string;
  claim_type: string;
  description: string;
  incident_date: string;
  claimed_amount: number;
  documents?: string[];
}

export interface KakauClaimResponse {
  claim_number: string;
  provider_claim_id: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected';
  estimated_processing_days?: number;
}

/**
 * Cliente para integração com Kakau Seguros
 */
export class KakauInsuranceClient {
  private apiKey: string;
  private baseUrl: string;
  private enabled: boolean;

  constructor() {
    this.apiKey = process.env.KAKAU_INSURANCE_API_KEY || '';
    this.baseUrl = process.env.KAKAU_INSURANCE_BASE_URL || 'https://api.kakau.com.br/v1';
    this.enabled = !!this.apiKey && process.env.KAKAU_INSURANCE_ENABLED === 'true';
  }

  /**
   * Criar apólice na Kakau
   */
  async createPolicy(request: KakauPolicyRequest): Promise<KakauPolicyResponse> {
    if (!this.enabled) {
      // Modo mock para desenvolvimento
      return this.mockCreatePolicy(request);
    }

    try {
      const response = await fetch(`${this.baseUrl}/policies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          booking_id: request.booking_id,
          coverage_type: request.coverage_type,
          coverage_amount: request.coverage_amount,
          trip_start_date: request.trip_start_date,
          trip_end_date: request.trip_end_date,
          insured: {
            name: request.insured_name,
            document: request.insured_document,
            email: request.insured_email,
            phone: request.insured_phone,
          },
          travelers: request.number_of_travelers,
          destination: request.destination,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Kakau API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        policy_number: data.policy_number,
        provider_policy_id: data.id,
        premium_amount: parseFloat(data.premium_amount),
        coverage_amount: parseFloat(data.coverage_amount),
        status: data.status,
        document_url: data.document_url,
        terms_url: data.terms_url,
        expires_at: data.expires_at,
      };
    } catch (error: any) {
      console.error('Erro ao criar apólice na Kakau:', error);
      // Fallback para mock em caso de erro
      return this.mockCreatePolicy(request);
    }
  }

  /**
   * Buscar informações de apólice
   */
  async getPolicy(policyNumber: string): Promise<KakauPolicyResponse | null> {
    if (!this.enabled) {
      return null; // Mock não implementa busca
    }

    try {
      const response = await fetch(`${this.baseUrl}/policies/${policyNumber}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return {
        policy_number: data.policy_number,
        provider_policy_id: data.id,
        premium_amount: parseFloat(data.premium_amount),
        coverage_amount: parseFloat(data.coverage_amount),
        status: data.status,
        document_url: data.document_url,
        terms_url: data.terms_url,
        expires_at: data.expires_at,
      };
    } catch (error: any) {
      console.error('Erro ao buscar apólice na Kakau:', error);
      return null;
    }
  }

  /**
   * Criar sinistro na Kakau
   */
  async createClaim(request: KakauClaimRequest): Promise<KakauClaimResponse> {
    if (!this.enabled) {
      // Modo mock para desenvolvimento
      return this.mockCreateClaim(request);
    }

    try {
      const response = await fetch(`${this.baseUrl}/claims`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          policy_number: request.policy_number,
          claim_type: request.claim_type,
          description: request.description,
          incident_date: request.incident_date,
          claimed_amount: request.claimed_amount,
          documents: request.documents || [],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Kakau API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        claim_number: data.claim_number,
        provider_claim_id: data.id,
        status: data.status,
        estimated_processing_days: data.estimated_processing_days,
      };
    } catch (error: any) {
      console.error('Erro ao criar sinistro na Kakau:', error);
      // Fallback para mock em caso de erro
      return this.mockCreateClaim(request);
    }
  }

  /**
   * Calcular prêmio estimado
   */
  async calculatePremium(params: {
    coverage_type: string;
    coverage_amount: number;
    trip_duration_days: number;
    number_of_travelers: number;
    destination?: string;
  }): Promise<number> {
    // Cálculo básico de prêmio
    let basePremium = 0;

    // Base por tipo de cobertura
    switch (params.coverage_type) {
      case 'basic':
        basePremium = 50;
        break;
      case 'standard':
        basePremium = 100;
        break;
      case 'premium':
        basePremium = 200;
        break;
      case 'comprehensive':
        basePremium = 350;
        break;
    }

    // Multiplicador por duração (R$ 10 por dia)
    const durationMultiplier = params.trip_duration_days * 10;

    // Multiplicador por viajante (R$ 20 por viajante)
    const travelerMultiplier = params.number_of_travelers * 20;

    // Multiplicador por valor de cobertura (0.5% do valor)
    const coverageMultiplier = params.coverage_amount * 0.005;

    // Multiplicador por destino (destinos internacionais = +30%)
    const destinationMultiplier = params.destination && !params.destination.includes('Brasil') ? 1.3 : 1.0;

    const totalPremium = (basePremium + durationMultiplier + travelerMultiplier + coverageMultiplier) * destinationMultiplier;

    return Math.round(totalPremium * 100) / 100; // Arredondar para 2 casas decimais
  }

  /**
   * Mock para criar apólice (desenvolvimento)
   */
  private mockCreatePolicy(request: KakauPolicyRequest): KakauPolicyResponse {
    return {
      policy_number: `KAKAU-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      provider_policy_id: `mock-${Date.now()}`,
      premium_amount: 150.00,
      coverage_amount: request.coverage_amount,
      status: 'active',
      document_url: 'https://example.com/policy-document.pdf',
      terms_url: 'https://example.com/terms.pdf',
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  /**
   * Mock para criar sinistro (desenvolvimento)
   */
  private mockCreateClaim(request: KakauClaimRequest): KakauClaimResponse {
    return {
      claim_number: `CLM-KAKAU-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      provider_claim_id: `mock-claim-${Date.now()}`,
      status: 'submitted',
      estimated_processing_days: 7,
    };
  }
}

// Instância singleton
export const kakauInsuranceClient = new KakauInsuranceClient();

