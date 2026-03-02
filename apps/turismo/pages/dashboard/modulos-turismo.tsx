'use client'

import React from 'react'
import ProtectedRoute from '../../src/components/ProtectedRoute'
import { ModulosTurismoDashboard } from '../../src/components/ModulosTurismoDashboard'

export default function ModulosTurismoPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6">
        <ModulosTurismoDashboard />
      </div>
    </ProtectedRoute>
  )
}

