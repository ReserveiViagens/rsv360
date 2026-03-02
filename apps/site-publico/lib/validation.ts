/**
 * ✅ VALIDAÇÕES ROBUSTAS
 * 
 * Sistema de validação centralizado com:
 * - Validação de dados
 * - Validação de tipos
 * - Validação de formatos
 * - Mensagens de erro claras
 */

import { createValidationError } from './error-handler';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validar email
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validar CPF
 */
export function validateCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/\D/g, '');
  
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

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
 * Validar CNPJ
 */
export function validateCNPJ(cnpj: string): boolean {
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  
  if (cleanCNPJ.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;

  let length = cleanCNPJ.length - 2;
  let numbers = cleanCNPJ.substring(0, length);
  const digits = cleanCNPJ.substring(length);
  let sum = 0;
  let pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;

  length = length + 1;
  numbers = cleanCNPJ.substring(0, length);
  sum = 0;
  pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;

  return true;
}

/**
 * Validar telefone brasileiro
 */
export function validatePhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
}

/**
 * Validar CEP
 */
export function validateCEP(cep: string): boolean {
  const cleanCEP = cep.replace(/\D/g, '');
  return cleanCEP.length === 8;
}

/**
 * Validar data
 */
export function validateDate(date: string, format: 'YYYY-MM-DD' | 'DD/MM/YYYY' = 'YYYY-MM-DD'): boolean {
  if (format === 'YYYY-MM-DD') {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;
  } else {
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(date)) return false;
  }

  const d = new Date(date);
  return d instanceof Date && !isNaN(d.getTime());
}

/**
 * Validar data futura
 */
export function validateFutureDate(date: string): boolean {
  if (!validateDate(date)) return false;
  return new Date(date) > new Date();
}

/**
 * Validar data passada
 */
export function validatePastDate(date: string): boolean {
  if (!validateDate(date)) return false;
  return new Date(date) < new Date();
}

/**
 * Validar range de datas
 */
export function validateDateRange(startDate: string, endDate: string): boolean {
  if (!validateDate(startDate) || !validateDate(endDate)) return false;
  return new Date(startDate) <= new Date(endDate);
}

/**
 * Validar URL
 */
export function validateURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validar valor monetário
 */
export function validateMoney(value: number | string): boolean {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return !isNaN(numValue) && numValue >= 0;
}

/**
 * Validar string não vazia
 */
export function validateRequired(value: any, fieldName: string): void {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    throw createValidationError(`Campo obrigatório: ${fieldName}`);
  }
}

/**
 * Validar comprimento de string
 */
export function validateLength(value: string, min: number, max: number, fieldName: string): void {
  if (value.length < min || value.length > max) {
    throw createValidationError(
      `Campo ${fieldName} deve ter entre ${min} e ${max} caracteres`
    );
  }
}

/**
 * Validar número em range
 */
export function validateRange(value: number, min: number, max: number, fieldName: string): void {
  if (value < min || value > max) {
    throw createValidationError(
      `Campo ${fieldName} deve estar entre ${min} e ${max}`
    );
  }
}

/**
 * Validar objeto com schema
 */
export function validateSchema<T extends Record<string, any>>(
  data: any,
  schema: {
    [K in keyof T]: {
      required?: boolean;
      type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date' | 'email' | 'url' | 'cpf' | 'cnpj' | 'phone' | 'cep';
      min?: number;
      max?: number;
      custom?: (value: any) => boolean | string;
    };
  }
): ValidationResult {
  const errors: string[] = [];

  for (const [key, rules] of Object.entries(schema)) {
    const value = data[key];

    // Validar obrigatório
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`Campo ${key} é obrigatório`);
      continue;
    }

    // Se não obrigatório e vazio, pular outras validações
    if (!rules.required && (value === undefined || value === null || value === '')) {
      continue;
    }

    // Validar tipo
    if (rules.type === 'string' && typeof value !== 'string') {
      errors.push(`Campo ${key} deve ser uma string`);
      continue;
    }
    if (rules.type === 'number' && typeof value !== 'number') {
      errors.push(`Campo ${key} deve ser um número`);
      continue;
    }
    if (rules.type === 'boolean' && typeof value !== 'boolean') {
      errors.push(`Campo ${key} deve ser um booleano`);
      continue;
    }
    if (rules.type === 'array' && !Array.isArray(value)) {
      errors.push(`Campo ${key} deve ser um array`);
      continue;
    }
    if (rules.type === 'object' && (typeof value !== 'object' || Array.isArray(value))) {
      errors.push(`Campo ${key} deve ser um objeto`);
      continue;
    }

    // Validações específicas por tipo
    if (rules.type === 'email' && !validateEmail(value)) {
      errors.push(`Campo ${key} deve ser um email válido`);
    }
    if (rules.type === 'url' && !validateURL(value)) {
      errors.push(`Campo ${key} deve ser uma URL válida`);
    }
    if (rules.type === 'cpf' && !validateCPF(value)) {
      errors.push(`Campo ${key} deve ser um CPF válido`);
    }
    if (rules.type === 'cnpj' && !validateCNPJ(value)) {
      errors.push(`Campo ${key} deve ser um CNPJ válido`);
    }
    if (rules.type === 'phone' && !validatePhone(value)) {
      errors.push(`Campo ${key} deve ser um telefone válido`);
    }
    if (rules.type === 'cep' && !validateCEP(value)) {
      errors.push(`Campo ${key} deve ser um CEP válido`);
    }

    // Validar comprimento (strings)
    if (rules.type === 'string') {
      if (rules.min && value.length < rules.min) {
        errors.push(`Campo ${key} deve ter no mínimo ${rules.min} caracteres`);
      }
      if (rules.max && value.length > rules.max) {
        errors.push(`Campo ${key} deve ter no máximo ${rules.max} caracteres`);
      }
    }

    // Validar range (números)
    if (rules.type === 'number') {
      if (rules.min !== undefined && value < rules.min) {
        errors.push(`Campo ${key} deve ser no mínimo ${rules.min}`);
      }
      if (rules.max !== undefined && value > rules.max) {
        errors.push(`Campo ${key} deve ser no máximo ${rules.max}`);
      }
    }

    // Validação customizada
    if (rules.custom) {
      const customResult = rules.custom(value);
      if (customResult !== true) {
        errors.push(typeof customResult === 'string' ? customResult : `Campo ${key} é inválido`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

