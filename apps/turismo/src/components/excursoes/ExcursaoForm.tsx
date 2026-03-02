'use client'

import React, { useState } from 'react'
import { Save, X } from 'lucide-react'
import { Excursao } from '../../services/api/excursoesApi'

interface ExcursaoFormProps {
  excursao?: Excursao
  onSubmit: (data: Partial<Excursao>) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

export function ExcursaoForm({ excursao, onSubmit, onCancel, isLoading = false }: ExcursaoFormProps) {
  const [formData, setFormData] = useState({
    nome: excursao?.nome || '',
    destino: excursao?.destino || '',
    descricao: excursao?.descricao || '',
    data_inicio: excursao?.data_inicio ? excursao.data_inicio.split('T')[0] : '',
    data_fim: excursao?.data_fim ? excursao.data_fim.split('T')[0] : '',
    preco: excursao?.preco?.toString() || '',
    vagas_totais: excursao?.vagas_totais?.toString() || '',
    status: excursao?.status || 'planejamento',
    inclui_transporte: excursao?.inclui_transporte || false,
    inclui_hospedagem: excursao?.inclui_hospedagem || false,
    inclui_refeicoes: excursao?.inclui_refeicoes || false,
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

    if (!formData.preco || parseFloat(formData.preco) <= 0) {
      newErrors.preco = 'Preço deve ser maior que zero'
    }

    if (!formData.vagas_totais || parseInt(formData.vagas_totais) <= 0) {
      newErrors.vagas_totais = 'Vagas totais deve ser maior que zero'
    }

    if (!formData.data_inicio) {
      newErrors.data_inicio = 'Data de início é obrigatória'
    }

    if (!formData.data_fim) {
      newErrors.data_fim = 'Data de término é obrigatória'
    }

    if (formData.data_inicio && formData.data_fim) {
      const start = new Date(formData.data_inicio)
      const end = new Date(formData.data_fim)
      if (end <= start) {
        newErrors.data_fim = 'Data de término deve ser posterior à data de início'
      }
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
      data_inicio: formData.data_inicio,
      data_fim: formData.data_fim,
      preco: parseFloat(formData.preco),
      vagas_totais: parseInt(formData.vagas_totais),
      status: formData.status,
      inclui_transporte: formData.inclui_transporte,
      inclui_hospedagem: formData.inclui_hospedagem,
      inclui_refeicoes: formData.inclui_refeicoes,
    }

    await onSubmit(submitData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome *
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
            Data de Início *
          </label>
          <input
            type="date"
            value={formData.data_inicio}
            onChange={(e) => handleChange('data_inicio', e.target.value)}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.data_inicio ? 'border-red-500' : ''
            }`}
          />
          {errors.data_inicio && <p className="mt-1 text-sm text-red-600">{errors.data_inicio}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data de Término *
          </label>
          <input
            type="date"
            value={formData.data_fim}
            onChange={(e) => handleChange('data_fim', e.target.value)}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.data_fim ? 'border-red-500' : ''
            }`}
          />
          {errors.data_fim && <p className="mt-1 text-sm text-red-600">{errors.data_fim}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preço *
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.preco}
            onChange={(e) => handleChange('preco', e.target.value)}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.preco ? 'border-red-500' : ''
            }`}
          />
          {errors.preco && <p className="mt-1 text-sm text-red-600">{errors.preco}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vagas Totais *
          </label>
          <input
            type="number"
            min="1"
            value={formData.vagas_totais}
            onChange={(e) => handleChange('vagas_totais', e.target.value)}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.vagas_totais ? 'border-red-500' : ''
            }`}
          />
          {errors.vagas_totais && <p className="mt-1 text-sm text-red-600">{errors.vagas_totais}</p>}
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
            <option value="planejamento">Em Planejamento</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="concluida">Concluída</option>
            <option value="cancelada">Cancelada</option>
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

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-700 mb-3">O que está incluído:</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.inclui_transporte}
              onChange={(e) => handleChange('inclui_transporte', e.target.checked)}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <span className="text-sm text-gray-700">Transporte</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.inclui_hospedagem}
              onChange={(e) => handleChange('inclui_hospedagem', e.target.checked)}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <span className="text-sm text-gray-700">Hospedagem</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.inclui_refeicoes}
              onChange={(e) => handleChange('inclui_refeicoes', e.target.checked)}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <span className="text-sm text-gray-700">Refeições</span>
          </label>
        </div>
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
          {isLoading ? 'Salvando...' : excursao ? 'Atualizar' : 'Criar Excursão'}
        </button>
      </div>
    </form>
  )
}

