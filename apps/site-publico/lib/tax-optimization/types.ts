/**
 * Tipos para o módulo Tributação Otimizada
 */

export type TaxRegime = 'simples' | 'presumido' | 'real';

export interface TaxDeduction {
  id: number;
  description: string;
  amount: number;
  category?: string;
  ai_confidence?: number;
  approved_by_user: boolean;
  period_start?: string;
  period_end?: string;
  created_at: string;
  updated_at: string;
}

export interface TaxSimulation {
  gross_revenue: number;
  deductions: number;
  taxable_base: number;
  regime: TaxRegime;
  rate_pct: number;
  tax_amount: number;
  perse_applicable: boolean;
  perse_savings?: number;
}

export interface PerseStatus {
  eligible: boolean;
  enrolled: boolean;
  cnae?: string;
  message?: string;
}

export interface GoyazesProject {
  title: string;
  description: string;
  budget: number;
  period: string;
}
