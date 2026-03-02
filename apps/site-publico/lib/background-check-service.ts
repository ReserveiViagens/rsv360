/**
 * ✅ TAREFA MEDIUM-4: Serviço de Background Check
 * Integração com providers de verificação de antecedentes (Serasa, ClearSale, etc.)
 */

import { queryDatabase } from './db';

export interface BackgroundCheckRequest {
  user_id: number;
  cpf: string;
  full_name: string;
  birth_date?: Date | string;
  check_type?: 'basic' | 'criminal' | 'credit' | 'full';
  provider?: 'serasa' | 'clearsale' | 'mock';
}

export interface BackgroundCheckResult {
  id: number;
  user_id: number;
  provider: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'rejected';
  check_type: string;
  cpf: string;
  full_name: string;
  score?: number;
  risk_level?: 'low' | 'medium' | 'high';
  result_data?: any;
  requested_at: Date;
  completed_at?: Date;
  expires_at?: Date;
}

export interface BackgroundCheckProvider {
  name: string;
  enabled: boolean;
  check_types: string[];
  cost_per_check: number;
}

class BackgroundCheckService {
  /**
   * Solicitar background check
   */
  async requestCheck(request: BackgroundCheckRequest): Promise<BackgroundCheckResult> {
    const {
      user_id,
      cpf,
      full_name,
      birth_date,
      check_type = 'basic',
      provider = 'serasa',
    } = request;

    // Validar CPF
    if (!this.isValidCPF(cpf)) {
      throw new Error('CPF inválido');
    }

    // Verificar se provider está habilitado
    const providerConfig = await this.getProvider(provider);
    if (!providerConfig || !providerConfig.enabled) {
      throw new Error(`Provider ${provider} não está disponível`);
    }

    // Verificar se tipo de check é suportado
    if (!providerConfig.check_types.includes(check_type)) {
      throw new Error(`Tipo de check ${check_type} não é suportado pelo provider ${provider}`);
    }

    // Verificar se já existe check recente válido
    const existingCheck = await this.getLatestValidCheck(user_id, provider, check_type);
    if (existingCheck && existingCheck.expires_at && new Date(existingCheck.expires_at) > new Date()) {
      return existingCheck;
    }

    // Criar registro de check
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 90); // Válido por 90 dias

    const result = await queryDatabase(
      `INSERT INTO background_checks (
        user_id, provider, check_type, cpf, full_name, birth_date,
        status, requested_by, expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        user_id,
        provider,
        check_type,
        cpf.replace(/\D/g, ''), // Remove formatação
        full_name,
        birth_date ? new Date(birth_date).toISOString().split('T')[0] : null,
        'pending',
        user_id,
        expiresAt.toISOString(),
      ]
    );

    const check = result[0];

    // Registrar no histórico
    await this.logHistory(check.id, 'requested', null, 'pending', user_id);

    // Processar check (assíncrono)
    this.processCheck(check.id, provider, check_type, cpf, full_name, birth_date).catch(
      (error) => {
        console.error('Erro ao processar background check:', error);
      }
    );

    return this.mapToResult(check);
  }

  /**
   * Processar check com provider
   */
  private async processCheck(
    checkId: number,
    provider: string,
    checkType: string,
    cpf: string,
    fullName: string,
    birthDate?: Date | string
  ): Promise<void> {
    try {
      // Atualizar status para processing
      await queryDatabase(
        `UPDATE background_checks SET status = 'processing', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [checkId]
      );

      await this.logHistory(checkId, 'status_changed', 'pending', 'processing', null);

      // Chamar provider específico
      let result: any;
      switch (provider) {
        case 'serasa':
          result = await this.checkWithSerasa(cpf, fullName, birthDate, checkType);
          break;
        case 'clearsale':
          result = await this.checkWithClearSale(cpf, fullName, birthDate, checkType);
          break;
        case 'mock':
          result = await this.checkWithMock(cpf, fullName, birthDate, checkType);
          break;
        default:
          throw new Error(`Provider ${provider} não implementado`);
      }

      // Calcular score e risk level
      const score = this.calculateScore(result);
      const riskLevel = this.calculateRiskLevel(score);

      // Atualizar check com resultado
      await queryDatabase(
        `UPDATE background_checks 
         SET status = 'completed',
             score = $1,
             risk_level = $2,
             result_data = $3,
             request_id = $4,
             completed_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $5`,
        [score, riskLevel, JSON.stringify(result), result.request_id || null, checkId]
      );

      await this.logHistory(checkId, 'status_changed', 'processing', 'completed', null);
    } catch (error: any) {
      // Marcar como failed
      await queryDatabase(
        `UPDATE background_checks 
         SET status = 'failed',
             notes = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [error.message || 'Erro ao processar check', checkId]
      );

      await this.logHistory(checkId, 'status_changed', 'processing', 'failed', null, error.message);
    }
  }

  /**
   * Integração com Serasa (mock - implementar com API real)
   */
  private async checkWithSerasa(
    cpf: string,
    fullName: string,
    birthDate?: Date | string,
    checkType?: string
  ): Promise<any> {
    // TODO: Implementar integração real com API Serasa
    // Por enquanto, retorna mock
    return this.checkWithMock(cpf, fullName, birthDate, checkType);
  }

  /**
   * Integração com ClearSale (mock - implementar com API real)
   */
  private async checkWithClearSale(
    cpf: string,
    fullName: string,
    birthDate?: Date | string,
    checkType?: string
  ): Promise<any> {
    // TODO: Implementar integração real com API ClearSale
    // Por enquanto, retorna mock
    return this.checkWithMock(cpf, fullName, birthDate, checkType);
  }

  /**
   * Mock check para desenvolvimento
   */
  private async checkWithMock(
    cpf: string,
    fullName: string,
    birthDate?: Date | string,
    checkType?: string
  ): Promise<any> {
    // Simular delay de API
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Gerar resultado mock baseado em CPF (determinístico para testes)
    const cpfLastDigit = parseInt(cpf.slice(-1));
    const score = 800 + (cpfLastDigit * 20); // Score entre 800-980
    const hasCriminalRecord = cpfLastDigit % 3 === 0; // 33% chance
    const creditScore = 600 + (cpfLastDigit * 30);

    return {
      request_id: `MOCK-${Date.now()}-${cpf.slice(-4)}`,
      cpf: cpf.replace(/\D/g, ''),
      full_name: fullName,
      birth_date: birthDate,
      check_type: checkType,
      criminal_record: {
        has_record: hasCriminalRecord,
        records: hasCriminalRecord ? ['Crime leve - 2015'] : [],
      },
      credit_score: checkType === 'credit' || checkType === 'full' ? creditScore : null,
      credit_status: creditScore > 700 ? 'good' : creditScore > 500 ? 'fair' : 'poor',
      identity_verified: true,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Calcular score de confiança (0-1000)
   */
  private calculateScore(result: any): number {
    let score = 1000;

    // Penalizar por antecedentes criminais
    if (result.criminal_record?.has_record) {
      score -= 500;
    }

    // Ajustar baseado em score de crédito
    if (result.credit_score) {
      if (result.credit_score < 500) {
        score -= 200;
      } else if (result.credit_score < 700) {
        score -= 100;
      }
    }

    // Penalizar se identidade não verificada
    if (!result.identity_verified) {
      score -= 300;
    }

    return Math.max(0, Math.min(1000, score));
  }

  /**
   * Calcular nível de risco
   */
  private calculateRiskLevel(score: number): 'low' | 'medium' | 'high' {
    if (score >= 800) return 'low';
    if (score >= 500) return 'medium';
    return 'high';
  }

  /**
   * Obter check mais recente válido
   */
  async getLatestValidCheck(
    userId: number,
    provider?: string,
    checkType?: string
  ): Promise<BackgroundCheckResult | null> {
    let query = `
      SELECT * FROM background_checks
      WHERE user_id = $1
        AND status = 'completed'
        AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
    `;
    const params: any[] = [userId];

    if (provider) {
      query += ` AND provider = $${params.length + 1}`;
      params.push(provider);
    }

    if (checkType) {
      query += ` AND check_type = $${params.length + 1}`;
      params.push(checkType);
    }

    query += ` ORDER BY completed_at DESC LIMIT 1`;

    const result = await queryDatabase(query, params);
    return result.length > 0 ? this.mapToResult(result[0]) : null;
  }

  /**
   * Obter check por ID
   */
  async getCheck(checkId: number): Promise<BackgroundCheckResult | null> {
    const result = await queryDatabase(
      `SELECT * FROM background_checks WHERE id = $1`,
      [checkId]
    );
    return result.length > 0 ? this.mapToResult(result[0]) : null;
  }

  /**
   * Listar checks de um usuário
   */
  async getUserChecks(userId: number): Promise<BackgroundCheckResult[]> {
    const result = await queryDatabase(
      `SELECT * FROM background_checks 
       WHERE user_id = $1 
       ORDER BY requested_at DESC`,
      [userId]
    );
    return result.map((row) => this.mapToResult(row));
  }

  /**
   * Obter provider
   */
  async getProvider(providerName: string): Promise<BackgroundCheckProvider | null> {
    const result = await queryDatabase(
      `SELECT * FROM background_check_providers WHERE provider_name = $1`,
      [providerName]
    );
    return result.length > 0
      ? {
          name: result[0].provider_name,
          enabled: result[0].enabled,
          check_types: result[0].check_types || [],
          cost_per_check: parseFloat(result[0].cost_per_check || '0'),
        }
      : null;
  }

  /**
   * Listar providers disponíveis
   */
  async listProviders(): Promise<BackgroundCheckProvider[]> {
    const result = await queryDatabase(
      `SELECT * FROM background_check_providers WHERE enabled = true ORDER BY provider_name`
    );
    return result.map((row) => ({
      name: row.provider_name,
      enabled: row.enabled,
      check_types: row.check_types || [],
      cost_per_check: parseFloat(row.cost_per_check || '0'),
    }));
  }

  /**
   * Registrar no histórico
   */
  private async logHistory(
    checkId: number,
    action: string,
    oldStatus: string | null,
    newStatus: string | null,
    performedBy: number | null,
    notes?: string
  ): Promise<void> {
    await queryDatabase(
      `INSERT INTO background_check_history 
       (check_id, action, old_status, new_status, performed_by, notes)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [checkId, action, oldStatus, newStatus, performedBy, notes || null]
    );
  }

  /**
   * Validar CPF
   */
  private isValidCPF(cpf: string): boolean {
    const cleanCPF = cpf.replace(/\D/g, '');
    if (cleanCPF.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false; // Todos os dígitos iguais

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cleanCPF.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cleanCPF.charAt(10))) return false;

    return true;
  }

  /**
   * Mapear resultado do banco para interface
   */
  private mapToResult(row: any): BackgroundCheckResult {
    return {
      id: row.id,
      user_id: row.user_id,
      provider: row.provider,
      status: row.status,
      check_type: row.check_type,
      cpf: row.cpf,
      full_name: row.full_name,
      score: row.score,
      risk_level: row.risk_level,
      result_data: row.result_data,
      requested_at: row.requested_at,
      completed_at: row.completed_at,
      expires_at: row.expires_at,
    };
  }
}

export const backgroundCheckService = new BackgroundCheckService();

