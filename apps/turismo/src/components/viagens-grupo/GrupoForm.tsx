'use client'

import React, { useState } from 'react'
import { Save, X } from 'lucide-react'
import { Grupo } from '../../services/api/viagensGrupoApi'

interface GrupoFormProps {
  grupo?: Grupo
  onSubmit: (data: Partial<Grupo>) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

export function GrupoForm({ grupo, onSubmit, onCancel, isLoading = false }: GrupoFormProps) {
  const [formData, setFormData] = useState({
    nome: grupo?.nome || '',
    destino: grupo?.destino || '',
    descricao: grupo?.descricao || '',
    data_prevista: grupo?.data_prevista ? grupo.data_prevista.split('T')[0] : '',
    limite_participantes: grupo?.limite_participantes?.toString() || '',
    privacidade: grupo?.privacidade || 'publico',
    status: grupo?.status || 'formando',
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

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório'
    }

    if (!formData.destino.trim()) {
      newErrors.destino = 'Destino é obrigatório'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) return

    const submitData: any = {
      nome: formData.nome,
      destino: formData.destino,
      descricao: formData.descricao || null,
      data_prevista: formData.data_prevista || null,
      limite_participantes: formData.limite_participantes ? parseInt(formData.limite_participantes) : null,
      privacidade: formData.privacidade,
      status: formData.status,
    }

    await onSubmit(submitData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome do Grupo *
          </label>
          <input
            type="text"
            value={formData.nome}
            onChange={(e) => handleChange('nome', e.target.value)}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.nome ? 'border-red-500' : ''
            }`}
          />
          {errors.nome && <p className="mt-1 text-sm text-red-600">{errors.nome}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Destino *
          </label>
          <input
            type="text"
            value={formData.destino}
            onChange={(e) => handleChange('destino', e.target.value)}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.destino ? 'border-red-500' : ''
            }`}
          />
          {errors.destino && <p className="mt-1 text-sm text-red-600">{errors.destino}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data Prevista
          </label>
          <input
            type="date"
            value={formData.data_prevista}
            onChange={(e) => handleChange('data_prevista', e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Limite de Participantes
          </label>
          <input
            type="number"
            min="1"
            value={formData.limite_participantes}
            onChange={(e) => handleChange('limite_participantes', e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Ilimitado se vazio"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Privacidade
          </label>
          <select
            value={formData.privacidade}
            onChange={(e) => handleChange('privacidade', e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="publico">Público</option>
            <option value="privado">Privado</option>
            <option value="somente_convite">Somente Convite</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="formando">Formando</option>
            <option value="confirmado">Confirmado</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="concluido">Concluído</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descrição
        </label>
        <textarea
          value={formData.descricao}
          onChange={(e) => handleChange('descricao', e.target.value)}
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
          {isLoading ? 'Salvando...' : grupo ? 'Atualizar' : 'Criar Grupo'}
        </button>
      </div>
    </form>
  )
}

