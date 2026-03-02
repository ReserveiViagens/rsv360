import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Bus, MapPin, Clock, Users } from 'lucide-react';

export default function CotacoesPasseiosPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/cotacoes" className="flex items-center space-x-2 text-teal-600 hover:text-teal-700 mb-4">
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para Cotações</span>
          </Link>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
              <Bus className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🚌 Cotações de Passeios</h1>
              <p className="text-gray-600">Sistema especializado em tours e excursões</p>
            </div>
          </div>
        </div>

        {/* Em Desenvolvimento */}
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Bus className="w-12 h-12 text-orange-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Módulo de Passeios em Desenvolvimento
          </h2>
          
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Estamos preparando uma experiência completa para cotações de passeios e tours. 
            Em breve você poderá criar cotações para city tours, excursões e roteiros personalizados.
          </p>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="p-4 bg-orange-50 rounded-lg">
              <MapPin className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">City Tours</h3>
              <p className="text-sm text-gray-600">Roteiros pela cidade</p>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-lg">
              <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">Duração</h3>
              <p className="text-sm text-gray-600">Meio dia, dia inteiro, múltiplos dias</p>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-lg">
              <Users className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">Grupos</h3>
              <p className="text-sm text-gray-600">Privativo ou compartilhado</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cotacoes/templates">
              <button className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                Ver Templates Disponíveis
              </button>
            </Link>
            <Link href="/cotacoes/new">
              <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Voltar para Tipos de Cotação
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
