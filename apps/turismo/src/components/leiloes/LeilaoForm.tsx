'use client'

import React, { useState, useEffect } from 'react'
import { Save, X } from 'lucide-react'
import { Leilao } from '../../services/api/leiloesApi'

interface LeilaoFormProps {
  leilao?: Leilao
  onSubmit: (data: Partial<Leilao>) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

export function LeilaoForm({ leilao, onSubmit, onCancel, isLoading = false }: LeilaoFormProps) {
  const [formData, setFormData] = useState({
    title: leilao?.title || '',
    description: leilao?.description || '',
    starting_price: leilao?.starting_price?.toString() || '',
    reserve_price: leilao?.reserve_price?.toString() || '',
    start_date: leilao?.start_date ? new Date(leilao.start_date).toISOString().slice(0, 16) : '',
    end_date: leilao?.end_date ? new Date(leilao.end_date).toISOString().slice(0, 16) : '',
    type: leilao?.type || 'auction',
    status: leilao?.status || 'scheduled',
    discount_percentage: leilao?.discount_percentage?.toString() || '',
    max_participants: leilao?.max_participants?.toString() || '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório'
    }

    if (!formData.starting_price || parseFloat(formData.starting_price) <= 0) {
      newErrors.starting_price = 'Preço inicial deve ser maior que zero'
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Data de início é obrigatória'
    }

    if (!formData.end_date) {
      newErrors.end_date = 'Data de término é obrigatória'
    }

    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date)
      const end = new Date(formData.end_date)
      if (end <= start) {
        newErrors.end_date = 'Data de término deve ser posterior à data de início'
      }
    }

    if (formData.type === 'flash_deal') {
      if (formData.discount_percentage) {
        const discount = parseFloat(formData.discount_percentage)
        if (discount < 0 || discount > 100) {
          newErrors.discount_percentage = 'Desconto deve estar entre 0 e 100%'
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) return

    const submitData: any = {
      title: formData.title,
      description: formData.description || null,
      starting_price: parseFloat(formData.starting_price),
      reserve_price: formData.reserve_price ? parseFloat(formData.reserve_price) : null,
      start_date: new Date(formData.start_date).toISOString(),
      end_date: new Date(formData.end_date).toISOString(),
      type: formData.type,
      status: formData.status,
    }

    if (formData.type === 'flash_deal') {
      submitData.discount_percentage = formData.discount_percentage ? parseInt(formData.discount_percentage) : null
      submitData.max_participants = formData.max_participants ? parseInt(formData.max_participants) : null
    }

    await onSubmit(submitData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.title ? 'border-red-500' : ''
            }`}
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo *
          </label>
          <select
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="auction">Leilão</option>
            <option value="flash_deal">Flash Deal</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preço Inicial *
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.starting_price}
            onChange={(e) => handleChange('starting_price', e.target.value)}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.starting_price ? 'border-red-500' : ''
            }`}
          />
          {errors.starting_price && <p className="mt-1 text-sm text-red-600">{errors.starting_price}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preço de Reserva (opcional)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.reserve_price}
            onChange={(e) => handleChange('reserve_price', e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data/Hora de Início *
          </label>
          <input
            type="datetime-local"
            value={formData.start_date}
            onChange={(e) => handleChange('start_date', e.target.value)}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.start_date ? 'border-red-500' : ''
            }`}
          />
          {errors.start_date && <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data/Hora de Término *
          </label>
          <input
            type="datetime-local"
            value={formData.end_date}
            onChange={(e) => handleChange('end_date', e.target.value)}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.end_date ? 'border-red-500' : ''
            }`}
          />
          {errors.end_date && <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>}
        </div>

        {formData.type === 'flash_deal' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Desconto (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.discount_percentage}
                onChange={(e) => handleChange('discount_percentage', e.target.value)}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.discount_percentage ? 'border-red-500' : ''
                }`}
              />
              {errors.discount_percentage && <p className="mt-1 text-sm text-red-600">{errors.discount_percentage}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Máximo de Participantes
              </label>
              <input
                type="number"
                min="1"
                value={formData.max_participants}
                onChange={(e) => handleChange('max_participants', e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="scheduled">Agendado</option>
            <option value="active">Ativo</option>
            <option value="ended">Finalizado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descrição
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {isLoading ? 'Salvando...' : leilao ? 'Atualizar' : 'Criar Leilão'}
        </button>
      </div>
    </form>
  )
}

