/**
 * Validação de CPF/CNPJ
 */

/**
 * Valida CPF
 * @param cpf - CPF no formato 000.000.000-00 ou 00000000000
 * @returns true se válido
 */
export function validateCPF(cpf: string): boolean {
  // Remover caracteres não numéricos
  const cleanCpf = cpf.replace(/\D/g, '');

  // Verificar se tem 11 dígitos
  if (cleanCpf.length !== 11) {
    return false;
  }

  // Verificar se todos os dígitos são iguais (CPF inválido)
  if (/^(\d)\1{10}$/.test(cleanCpf)) {
    return false;
  }

  // Validar dígitos verificadores
  let sum = 0;
  let remainder: number;

  // Validar primeiro dígito verificador
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCpf.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf.substring(9, 10))) {
    return false;
  }

  // Validar segundo dígito verificador
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCpf.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf.substring(10, 11))) {
    return false;
  }

  return true;
}

/**
 * Valida CNPJ
 * @param cnpj - CNPJ no formato 00.000.000/0000-00 ou 00000000000000
 * @returns true se válido
 */
export function validateCNPJ(cnpj: string): boolean {
  // Remover caracteres não numéricos
  const cleanCnpj = cnpj.replace(/\D/g, '');

  // Verificar se tem 14 dígitos
  if (cleanCnpj.length !== 14) {
    return false;
  }

  // Verificar se todos os dígitos são iguais (CNPJ inválido)
  if (/^(\d)\1{13}$/.test(cleanCnpj)) {
    return false;
  }

  // Validar dígitos verificadores
  let length = cleanCnpj.length - 2;
  let numbers = cleanCnpj.substring(0, length);
  const digits = cleanCnpj.substring(length);
  let sum = 0;
  let pos = length - 7;

  // Validar primeiro dígito verificador
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) {
    return false;
  }

  // Validar segundo dígito verificador
  length = length + 1;
  numbers = cleanCnpj.substring(0, length);
  sum = 0;
  pos = length - 7;
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) {
    return false;
  }

  return true;
}

/**
 * Valida CPF ou CNPJ
 * @param document - CPF ou CNPJ
 * @returns true se válido
 */
export function validateCPFCNPJ(document: string): boolean {
  const clean = document.replace(/\D/g, '');
  
  if (clean.length === 11) {
    return validateCPF(document);
  } else if (clean.length === 14) {
    return validateCNPJ(document);
  }
  
  return false;
}

