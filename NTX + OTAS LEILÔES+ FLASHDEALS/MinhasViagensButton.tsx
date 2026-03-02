'use client'
import { Backpack } from 'lucide-react'

export function MinhasViagensButton() {
  return (
    <button className="relative">
      <Backpack className="h-8 w-8" />
      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6">3</span>
    </button>
  )
}