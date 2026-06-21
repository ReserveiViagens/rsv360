import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeft, Calculator, FileText, Hotel, FerrisWheel, MapPin, Bus } from 'lucide-react';
import { BudgetTypeSelector } from '@/components/budget-type-selector';
import { BudgetType } from '@/lib/types/budget';

export default function NovaCotacaoPage() {
  const router = useRouter();
  const [isSelectorOpen, setIsSelectorOpen] = useState(true);

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
            <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center">
              <Calculator className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Nova Cotação</h1>
              <p className="text-gray-600">Selecione o tipo de cotação que deseja criar</p>
            </div>
          </div>
        </div>

        {/* Tipos de Cotação */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/cotacoes/hoteis">
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-teal-500">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Hotel className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">🏨 Hotéis</h3>
                <p className="text-gray-600 mb-4">
                  Crie cotações para hospedagem em hotéis, resorts e pousadas
                </p>
                <div className="text-sm text-gray-500">
                  Inclui: Quartos, refeições, serviços extras
                </div>
              </div>
            </div>
          </Link>

          <Link href="/cotacoes/parques">
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-teal-500">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FerrisWheel className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">🎢 Parques</h3>
                <p className="text-gray-600 mb-4">
                  Cotações para parques temáticos e de diversões
                </p>
                <div className="text-sm text-gray-500">
                  Inclui: Ingressos, fast pass, refeições
                </div>
              </div>
            </div>
          </Link>

          <Link href="/cotacoes/atracoes">
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-teal-500">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">🎡 Atrações</h3>
                <p className="text-gray-600 mb-4">
                  Cotações para atrações turísticas e pontos de interesse
                </p>
                <div className="text-sm text-gray-500">
                  Inclui: Museus, monumentos, shows
                </div>
              </div>
            </div>
          </Link>

          <Link href="/cotacoes/passeios">
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-teal-500">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bus className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">🚌 Passeios</h3>
                <p className="text-gray-600 mb-4">
                  Cotações para tours e excursões guiadas
                </p>
                <div className="text-sm text-gray-500">
                  Inclui: Transporte, guia, alimentação
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Templates Rápidos */}
        <div className="mt-12 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📋 Templates Disponíveis</h2>
          <p className="text-gray-600 mb-6">
            Use nossos templates pré-configurados para criar cotações mais rapidamente
          </p>
          <Link href="/cotacoes/templates">
            <button className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
              <FileText className="w-4 h-4" />
              <span>Ver Templates</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Integrar BudgetTypeSelector conforme documento (linha 808-822) */}
      <BudgetTypeSelector
        open={isSelectorOpen}
        onOpenChange={setIsSelectorOpen}
        onSelect={(_type: BudgetType) => {
          // Opção: redirecionar para galeria de templates primeiro
          router.push('/cotacoes/templates');
        }}
      />
    </div>
  );
}
