'use client'

import React from 'react'

interface StatusBadgeProps {
  status: string
  variant?: 'default' | 'outline'
}

const statusColors: Record<string, { bg: string; text: string }> = {
  // Leilões
  scheduled: { bg: 'bg-blue-100', text: 'text-blue-800' },
  active: { bg: 'bg-green-100', text: 'text-green-800' },
  ended: { bg: 'bg-gray-100', text: 'text-gray-800' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-800' },
  
  // Excursões
  planejamento: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  em_andamento: { bg: 'bg-blue-100', text: 'text-blue-800' },
  concluida: { bg: 'bg-green-100', text: 'text-green-800' },
  cancelada: { bg: 'bg-red-100', text: 'text-red-800' },
  
  // Viagens em Grupo
  formando: { bg: 'bg-purple-100', text: 'text-purple-800' },
  confirmado: { bg: 'bg-green-100', text: 'text-green-800' },
  em_andamento: { bg: 'bg-blue-100', text: 'text-blue-800' },
  concluido: { bg: 'bg-gray-100', text: 'text-gray-800' },
  cancelado: { bg: 'bg-red-100', text: 'text-red-800' },
  
  // Pagamentos
  pendente: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  pago: { bg: 'bg-green-100', text: 'text-green-800' },
  parcial: { bg: 'bg-orange-100', text: 'text-orange-800' },
  reembolsado: { bg: 'bg-gray-100', text: 'text-gray-800' },
}

const statusLabels: Record<string, string> = {
  scheduled: 'Agendado',
  active: 'Ativo',
  ended: 'Finalizado',
  cancelled: 'Cancelado',
  planejamento: 'Em Planejamento',
  em_andamento: 'Em Andamento',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
  formando: 'Formando',
  confirmado: 'Confirmado',
  concluido: 'Concluído',
  pendente: 'Pendente',
  pago: 'Pago',
  parcial: 'Parcial',
  reembolsado: 'Reembolsado',
}

export function StatusBadge({ status, variant = 'default' }: StatusBadgeProps) {
  const colors = statusColors[status] || { bg: 'bg-gray-100', text: 'text-gray-800' }
  const label = statusLabels[status] || status

  if (variant === 'outline') {
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded border ${colors.text} border-current`}>
        {label}
      </span>
    )
  }

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded ${colors.bg} ${colors.text}`}>
      {label}
    </span>
  )
}

