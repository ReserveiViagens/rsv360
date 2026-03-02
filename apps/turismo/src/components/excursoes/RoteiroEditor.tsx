'use client'

import React, { useState } from 'react'
import { Plus, Trash2, Save } from 'lucide-react'
import { Roteiro } from '../../services/api/excursoesApi'

interface RoteiroEditorProps {
  roteiros: Roteiro[]
  onSave: (roteiros: Omit<Roteiro, 'id' | 'excursao_id' | 'created_at'>[]) => Promise<void>
  isLoading?: boolean
}

export function RoteiroEditor({ roteiros: initialRoteiros, onSave, isLoading = false }: RoteiroEditorProps) {
  const [roteiros, setRoteiros] = useState(initialRoteiros)
  const [newRoteiro, setNewRoteiro] = useState({
    dia: 1,
    horario: '',
    atividade: '',
    descricao: '',
    ordem: 0,
  })

  const handleAdd = () => {
    if (!newRoteiro.atividade.trim()) return

    const roteiro: any = {
      ...newRoteiro,
      ordem: roteiros.length,
    }

    setRoteiros([...roteiros, roteiro as Roteiro])
    setNewRoteiro({
      dia: 1,
      horario: '',
      atividade: '',
      descricao: '',
      ordem: 0,
    })
  }

  const handleRemove = (index: number) => {
    setRoteiros(roteiros.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    const roteirosToSave = roteiros.map(r => ({
      dia: r.dia,
      horario: r.horario || undefined,
      atividade: r.atividade,
      descricao: r.descricao || undefined,
      ordem: r.ordem,
    }))
    await onSave(roteirosToSave)
  }

  return (
    <div className="bg-white rounded-lg border p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Roteiro da Excursão</h3>
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Salvar Roteiro
        </button>
      </div>

      {/* Adicionar novo item */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
        <h4 className="font-medium text-gray-700">Adicionar Atividade</h4>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            type="number"
            min="1"
            placeholder="Dia"
            value={newRoteiro.dia}
            onChange={(e) => setNewRoteiro({ ...newRoteiro, dia: parseInt(e.target.value) || 1 })}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="time"
            placeholder="Horário"
            value={newRoteiro.horario}
            onChange={(e) => setNewRoteiro({ ...newRoteiro, horario: e.target.value })}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="text"
            placeholder="Atividade *"
            value={newRoteiro.atividade}
            onChange={(e) => setNewRoteiro({ ...newRoteiro, atividade: e.target.value })}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary md:col-span-2"
          />
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Adicionar
          </button>
        </div>
        <textarea
          placeholder="Descrição (opcional)"
          value={newRoteiro.descricao}
          onChange={(e) => setNewRoteiro({ ...newRoteiro, descricao: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Lista de roteiros */}
      <div className="space-y-3">
        {roteiros.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Nenhuma atividade adicionada</p>
        ) : (
          roteiros
            .sort((a, b) => a.dia - b.dia || a.ordem - b.ordem)
            .map((roteiro, index) => (
              <div key={index} className="border rounded-lg p-4 flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                      Dia {roteiro.dia}
                    </span>
                    {roteiro.horario && (
                      <span className="text-sm text-gray-600">{roteiro.horario}</span>
                    )}
                    <span className="font-medium text-gray-900">{roteiro.atividade}</span>
                  </div>
                  {roteiro.descricao && (
                    <p className="text-sm text-gray-600">{roteiro.descricao}</p>
                  )}
                </div>
                <button
                  onClick={() => handleRemove(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
        )}
      </div>
    </div>
  )
}

