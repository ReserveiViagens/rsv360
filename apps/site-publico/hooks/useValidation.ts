'use client';

import { useState, useCallback, useMemo } from 'react';
import { validateObject, validateField, sanitizeObject, validateSecurity } from '@/lib/validations';

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  sanitizedData: any;
}

interface UseValidationOptions {
  validationRules: any;
  sanitize?: boolean;
  securityCheck?: boolean;
  realTime?: boolean;
}

export const useValidation = (options: UseValidationOptions) => {
  const { validationRules, sanitize = true, securityCheck = true, realTime = true } = options;

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validar campo individual
  const validateFieldValue = useCallback((field: string, value: any) => {
    const rules = validationRules[field];
    if (!rules) return null;

    let error = validateField(value, rules);

    // Verificação de segurança se habilitada
    if (securityCheck && typeof value === 'string' && error === null) {
      const securityIssues = validateSecurity(value);
      if (securityIssues.length > 0) {
        error = securityIssues[0];
      }
    }

    return error;
  }, [validationRules, securityCheck]);

  // Validar objeto completo
  const validateData = useCallback((data: any): ValidationResult => {
    const validationErrors: Record<string, string> = {};

    // Validar cada campo
    Object.keys(validationRules).forEach(field => {
      const value = data[field];
      const error = validateFieldValue(field, value);

      if (error) {
        validationErrors[field] = error;
      }
    });

    // Sanitizar dados se habilitado
    const sanitizedData = sanitize ? sanitizeObject(data) : data;

    const isValid = Object.keys(validationErrors).length === 0;

    return {
      isValid,
      errors: validationErrors,
      sanitizedData
    };
  }, [validationRules, validateFieldValue, sanitize]);

  // Validar em tempo real
  const validateFieldRealTime = useCallback((field: string, value: any) => {
    if (!realTime) return;

    const error = validateFieldValue(field, value);

    setErrors(prev => {
      if (error) {
        return { ...prev, [field]: error };
      } else {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      }
    });
  }, [validateFieldValue, realTime]);

  // Marcar campo como tocado
  const touchField = useCallback((field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  // Limpar erros
  const clearErrors = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  // Limpar erro de campo específico
  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  // Verificar se campo tem erro
  const hasError = useCallback((field: string) => {
    return !!errors[field];
  }, [errors]);

  // Verificar se campo foi tocado
  const isTouched = useCallback((field: string) => {
    return !!touched[field];
  }, [touched]);

  // Verificar se campo deve mostrar erro
  const shouldShowError = useCallback((field: string) => {
    return isTouched(field) && hasError(field);
  }, [isTouched, hasError]);

  // Obter mensagem de erro
  const getErrorMessage = useCallback((field: string) => {
    return shouldShowError(field) ? errors[field] : '';
  }, [shouldShowError, errors]);

  // Verificar se formulário é válido
  const isFormValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  // Contar erros
  const errorCount = useMemo(() => {
    return Object.keys(errors).length;
  }, [errors]);

  // Obter campos com erro
  const fieldsWithErrors = useMemo(() => {
    return Object.keys(errors);
  }, [errors]);

  // Obter campos tocados
  const touchedFields = useMemo(() => {
    return Object.keys(touched);
  }, [touched]);

  return {
    // Estados
    errors,
    touched,
    isFormValid,
    errorCount,
    fieldsWithErrors,
    touchedFields,

    // Métodos de validação
    validateData,
    validateFieldValue,
    validateFieldRealTime,

    // Métodos de controle
    touchField,
    clearErrors,
    clearFieldError,

    // Métodos de verificação
    hasError,
    isTouched,
    shouldShowError,
    getErrorMessage
  };
};

// Hook para validação de formulário específico
export const useFormValidation = (validationRules: any, options?: Partial<UseValidationOptions>) => {
  const validation = useValidation({
    validationRules,
    sanitize: true,
    securityCheck: true,
    realTime: true,
    ...options
  });

  // Handler para mudança de campo
  const handleFieldChange = useCallback((field: string, value: any) => {
    validation.touchField(field);
    validation.validateFieldRealTime(field, value);
  }, [validation]);

  // Handler para blur de campo
  const handleFieldBlur = useCallback((field: string) => {
    validation.touchField(field);
  }, [validation]);

  // Handler para submit
  const handleSubmit = useCallback((data: any, onSubmit: (data: any) => void) => {
    const result = validation.validateData(data);

    if (result.isValid) {
      onSubmit(result.sanitizedData);
    } else {
      // Marcar todos os campos como tocados para mostrar erros
      Object.keys(validationRules).forEach(field => {
        validation.touchField(field);
      });
    }

    return result;
  }, [validation, validationRules]);

  return {
    ...validation,
    handleFieldChange,
    handleFieldBlur,
    handleSubmit
  };
};

// Hook para validação de upload de arquivos
export const useFileValidation = (rules: any) => {
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});

  const validateFile = useCallback((file: File, field: string) => {
    const error = validateField(file, rules);

    setFileErrors(prev => {
      if (error) {
        return { ...prev, [field]: error };
      } else {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      }
    });

    return !error;
  }, [rules]);

  const validateFiles = useCallback((files: File[], field: string) => {
    const errors: string[] = [];

    files.forEach((file, index) => {
      const error = validateField(file, rules);
      if (error) {
        errors.push(`Arquivo ${index + 1}: ${error}`);
      }
    });

    setFileErrors(prev => {
      if (errors.length > 0) {
        return { ...prev, [field]: errors.join('; ') };
      } else {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      }
    });

    return errors.length === 0;
  }, [rules]);

  const clearFileError = useCallback((field: string) => {
    setFileErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllFileErrors = useCallback(() => {
    setFileErrors({});
  }, []);

  return {
    fileErrors,
    validateFile,
    validateFiles,
    clearFileError,
    clearAllFileErrors
  };
};

export default useValidation;
