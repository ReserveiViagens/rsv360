'use client'

import { Bus, Users, Calendar, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

interface Excursao {
  id: string
  nome: string
  destino: string
  data: string
  vagas: { atuais: number; total: number }
  preco: number
  tipo: 'ônibus' | 'van'
  emoji: string
}

export function ExcursaoCard({ excursao }: { excursao: Excursao }) {
  const vagasLivres = excursao.vagas.total - excursao.vagas.atuais
  const ocupacao = (excursao.vagas.atuais / excursao.vagas.total) * 100

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200"
    >
      <div className="h-48 bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center text-6xl">
        {excursao.emoji}
      </div>

      <div className="p-5">
        <h3 className="font-bold text-xl text-gray-900 mb-2">{excursao.nome}</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {excursao.data}
          </div>
          <div className="flex items-center gap-2">
            <Bus className="h-4 w-4" />
            <span className="capitalize">{excursao.tipo} executivo</span>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Vagas</span>
            <span className="font-bold">{vagasLivres} livres</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${ocupacao > 80 ? 'bg-red-500' : 'bg-green-500'}`}
              style={{ width: `${ocupacao}%` }}
            />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900">
              R$ {excursao.preco}
              <span className="text-sm font-normal text-gray-500">/pessoa</span>
            </p>
            <p className="text-xs text-gray-500">12x sem juros</p>
          </div>
          <button className="bg-primary-600 text-white p-3 rounded-full hover:bg-primary-700">
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}