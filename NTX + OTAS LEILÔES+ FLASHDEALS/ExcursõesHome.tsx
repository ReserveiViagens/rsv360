'use client'

import { Bus, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { ExcursaoCard } from './ExcursaoCard'

const excursões = [
  { id: '1', nome: 'Caldas Novas + Hot Park', destino: 'Caldas Novas/GO', data: '15-18 Jan', vagas: { atuais: 14, total: 20 }, preco: 599, tipo: 'ônibus', emoji: 'Ônibus Água Termal' },
  { id: '2', nome: 'Rio Quente Weekend', destino: 'Rio Quente/GO', data: '20-22 Dez', vagas: { atuais: 8, total: 15 }, preco: 689, tipo: 'van', emoji: 'Água Termal' },
  { id: '3', nome: 'Gramado Natal Luz', destino: 'Gramado/RS', data: '10-14 Dez', vagas: { atuais: 22, total: 30 }, preco: 1190, tipo: 'ônibus', emoji: 'Árvore de Natal' },
  { id: '4', nome: 'Salvador Carnaval 2026', destino: 'Salvador/BA', data: '27 Fev-04 Mar', vagas: { atuais: 5, total: 12 }, preco: 1890, tipo: 'van', emoji: 'Máscara' },
]

export function ExcursõesHome() {
  return (
    <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Excursões em Grupo Ônibus Água Termal
        </h2>
        <p className="text-xl text-gray-600 mb-10">
          Monte sua excursão ou participe de uma já organizada — Preço justo e 100% Brasil
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full font-bold text-lg flex items-center gap-3 mx-auto mb-12 shadow-lg"
        >
          <Plus className="h-6 w-6" />
          Criar Minha Excursão
        </motion.button>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {excursões.map((exc) => (
            <ExcursaoCard key={exc.id} excursao={exc} />
          ))}
        </div>

        <a href="/excursões" className="mt-12 inline-block text-primary-600 font-bold text-lg hover:underline">
          Ver todas as excursões →
        </a>
      </div>
    </section>
  )
}