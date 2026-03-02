/**
 * Serviço de Verificação de Documentos
 * Verifica documentos enviados durante o check-in digital
 */

export type DocumentType = 'rg' | 'cpf' | 'cnh' | 'passport' | 'selfie' | 'proof_address' | 'other';

export interface DocumentVerificationResult {
  isValid: boolean;
  confidence: number; // 0-100
  extractedData?: {
    name?: string;
    documentNumber?: string;
    birthDate?: string;
    issueDate?: string;
    expiryDate?: string;
    [key: string]: unknown;
  };
  errors?: string[];
  warnings?: string[];
}

export interface DocumentFile {
  url: string;
  type: DocumentType;
  name?: string;
  size?: number;
  mimeType?: string;
}

/**
 * Verifica um único documento
 */
export async function verifyDocument(
  documentUrl: string,
  documentType: DocumentType
): Promise<DocumentVerificationResult> {
  try {
    // TODO: Integrar com serviço real de verificação de documentos
    // Por enquanto, implementação mock
    
    // Simular verificação básica
    const result: DocumentVerificationResult = {
      isValid: true,
      confidence: 85,
      extractedData: {},
      warnings: []
    };

    // Validações básicas por tipo
    switch (documentType) {
      case 'rg':
        result.extractedData = {
          documentNumber: '123456789',
          name: 'Nome Extraído',
          birthDate: '1990-01-01'
        };
        result.confidence = 90;
        break;
      
      case 'cpf':
        result.extractedData = {
          documentNumber: '123.456.789-00'
        };
        result.confidence = 95;
        break;
      
      case 'cnh':
        result.extractedData = {
          documentNumber: '12345678901',
          name: 'Nome Extraído',
          birthDate: '1990-01-01',
          expiryDate: '2030-01-01'
        };
        result.confidence = 88;
        break;
      
      case 'passport':
        result.extractedData = {
          documentNumber: 'AB123456',
          name: 'Nome Extraído',
          birthDate: '1990-01-01',
          expiryDate: '2030-01-01'
        };
        result.confidence = 92;
        break;
      
      case 'selfie':
        // Verificação de selfie (face matching)
        result.confidence = 80;
        result.warnings = ['Verificação facial recomendada'];
        break;
      
      case 'proof_address':
        result.extractedData = {
          address: 'Endereço Extraído'
        };
        result.confidence = 75;
        break;
      
      default:
        result.confidence = 70;
        result.warnings = ['Tipo de documento não especificado'];
    }

    // Validações adicionais
    if (result.confidence < 70) {
      result.isValid = false;
      result.errors = ['Confiança muito baixa na verificação'];
    }

    return result;
  } catch (error) {
    console.error('Erro ao verificar documento:', error);
    return {
      isValid: false,
      confidence: 0,
      errors: ['Erro ao processar documento']
    };
  }
}

/**
 * Verifica múltiplos documentos
 */
export async function verifyMultipleDocuments(
  documents: DocumentFile[]
): Promise<Map<string, DocumentVerificationResult>> {
  const results = new Map<string, DocumentVerificationResult>();

  // Verificar cada documento em paralelo
  const verificationPromises = documents.map(async (doc) => {
    const result = await verifyDocument(doc.url, doc.type);
    results.set(doc.url, result);
  });

  await Promise.all(verificationPromises);

  return results;
}

/**
 * Valida formato de CPF
 */
export function validateCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  
  if (cleanCPF.length !== 11) {
    return false;
  }

  // Verificar se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleanCPF)) {
    return false;
  }

  // Validar dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleanCPF.charAt(9))) {
    return false;
  }

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleanCPF.charAt(10))) {
    return false;
  }

  return true;
}

/**
 * Valida formato de RG
 */
export function validateRG(rg: string): boolean {
  const cleanRG = rg.replace(/[^\d]/g, '');
  return cleanRG.length >= 7 && cleanRG.length <= 9;
}

/**
 * Extrai dados de um documento usando OCR (mock)
 */
export async function extractDocumentData(
  documentUrl: string,
  documentType: DocumentType
): Promise<Record<string, unknown>> {
  // TODO: Integrar com serviço real de OCR
  // Por enquanto, retorna dados mock
  
  const mockData: Record<string, Record<string, unknown>> = {
    rg: {
      documentNumber: '123456789',
      name: 'Nome Completo',
      birthDate: '1990-01-01',
      issueDate: '2010-01-01',
      issuingAuthority: 'SSP'
    },
    cpf: {
      documentNumber: '123.456.789-00'
    },
    cnh: {
      documentNumber: '12345678901',
      name: 'Nome Completo',
      birthDate: '1990-01-01',
      category: 'B',
      expiryDate: '2030-01-01'
    },
    passport: {
      documentNumber: 'AB123456',
      name: 'Nome Completo',
      birthDate: '1990-01-01',
      nationality: 'BR',
      expiryDate: '2030-01-01'
    }
  };

  return mockData[documentType] || {};
}
