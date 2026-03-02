"use client"

import { useState, useEffect } from "react"
import { AlertCircle, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface FormFieldProps {
  label: string
  name: string
  type?: string
  value: string
  onChange: (value: string) => void
  validator?: (value: string) => { valid: boolean; message?: string }
  placeholder?: string
  required?: boolean
  className?: string
}

export function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  validator,
  placeholder,
  required,
  className
}: FormFieldProps) {
  const [touched, setTouched] = useState(false)
  const [validation, setValidation] = useState<{ valid: boolean; message?: string } | null>(null)

  useEffect(() => {
    if (touched && validator) {
      const result = validator(value)
      setValidation(result)
    }
  }, [value, touched, validator])

  const handleBlur = () => {
    setTouched(true)
    if (validator) {
      const result = validator(value)
      setValidation(result)
    }
  }

  const isValid = validation === null || validation.valid
  const showError = touched && !isValid

  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={name} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          id={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          className={cn(
            "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors",
            showError
              ? "border-red-500 focus:ring-red-500"
              : touched && isValid
              ? "border-green-500 focus:ring-green-500"
              : "border-gray-300 focus:ring-blue-500"
          )}
        />
        {touched && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isValid ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
          </div>
        )}
      </div>
      {showError && validation?.message && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {validation.message}
        </p>
      )}
    </div>
  )
}

// Validadores pré-definidos
export const Validators = {
  email: (value: string) => {
    if (!value) return { valid: false, message: "E-mail é obrigatório" }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return { valid: false, message: "E-mail inválido" }
    }
    return { valid: true }
  },

  phone: (value: string) => {
    if (!value) return { valid: false, message: "Telefone é obrigatório" }
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length < 10 || cleaned.length > 11) {
      return { valid: false, message: "Telefone inválido (deve ter 10 ou 11 dígitos)" }
    }
    return { valid: true }
  },

  cpf: (value: string) => {
    if (!value) return { valid: false, message: "CPF é obrigatório" }
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length !== 11) {
      return { valid: false, message: "CPF deve ter 11 dígitos" }
    }
    // Validação básica - em produção usar validação completa
    return { valid: true }
  },

  cnpj: (value: string) => {
    if (!value) return { valid: false, message: "CNPJ é obrigatório" }
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length !== 14) {
      return { valid: false, message: "CNPJ deve ter 14 dígitos" }
    }
    return { valid: true }
  },

  url: (value: string) => {
    if (!value) return { valid: true } // URL opcional
    try {
      new URL(value)
      return { valid: true }
    } catch {
      return { valid: false, message: "URL inválida" }
    }
  },

  required: (value: string) => {
    if (!value || value.trim() === '') {
      return { valid: false, message: "Este campo é obrigatório" }
    }
    return { valid: true }
  },

  minLength: (min: number) => (value: string) => {
    if (value.length < min) {
      return { valid: false, message: `Mínimo de ${min} caracteres` }
    }
    return { valid: true }
  },

  maxLength: (max: number) => (value: string) => {
    if (value.length > max) {
      return { valid: false, message: `Máximo de ${max} caracteres` }
    }
    return { valid: true }
  }
}

