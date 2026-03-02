'use client'

import React, { useState } from 'react'
import { DollarSign, AlertCircle } from 'lucide-react'
import { Leilao } from '../../services/api/leiloesApi'

interface LanceFormProps {
  leilao: Leilao
  onSubmit: (amount: number) => Promise<void>
  isLoading?: boolean
}

export function LanceForm({ leilao, onSubmit, isLoading = false }: LanceFormProps) {
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const amountNum = parseFloat(amount.replace(',', '.'))

    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Valor inválido')
      return
    }

    if (amountNum <= leilao.current_price) {
      setError(`Lance deve ser maior que R$ ${leilao.current_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
      return
    }

    try {
      await onSubmit(amountNum)
      setAmount('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer lance')
    }
  }

  const minAmount = leilao.current_price + 0.01

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4">Fazer Lance</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Valor do Lance
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={amount}
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d,]/g, '')
                setAmount(value)
                setError('')
              }}
              placeholder={`Mínimo: R$ ${minAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Preço atual: R$ {leilao.current_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !amount}
          className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Enviando...' : 'Fazer Lance'}
        </button>
      </form>
    </div>
  )
}

