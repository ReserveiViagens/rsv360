"use client"

import Link from "next/link"
import Image from "next/image"
import { CheckCircle2, Download, MessageCircle, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function ReservaConfirmadaPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header verde */}
      <header className="bg-gradient-to-br from-green-500 to-green-700 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-center gap-3 mb-4">
          <CheckCircle2 className="w-12 h-12 shrink-0" aria-hidden />
          <div>
            <h1 className="text-2xl font-bold">Reserva confirmada!</h1>
            <p className="text-green-100 text-sm">Você receberá os detalhes por e-mail.</p>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-8 space-y-6">
        {/* Card voucher (topo azul) */}
        <Card className="overflow-hidden border border-gray-200">
          <div className="h-2 bg-blue-600" aria-hidden />
          <CardContent className="p-6">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">Voucher</p>
            <p className="font-bold text-gray-900 text-lg mb-1">Ingresso Hot Park - 1 dia</p>
            <p className="text-sm text-gray-600 mb-2">Data: 15/03/2025</p>
            <p className="text-sm text-gray-600">Hóspedes: 2</p>
            <div className="flex gap-3 mt-4">
              <Button variant="outline" className="flex-1 gap-2 border-blue-600 text-blue-600 hover:bg-blue-50">
                <Download className="w-4 h-4" />
                Baixar PDF
              </Button>
              <a
                href="https://wa.me/5562999999999?text=Olá, confirmei minha reserva."
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button className="w-full gap-2 bg-green-500 hover:bg-green-600">
                  <MessageCircle className="w-4 h-4" />
                  Enviar WhatsApp
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Dica de Caldas (orange-50) */}
        <div className="rounded-2xl bg-orange-50 border border-orange-100 p-5">
          <div className="flex gap-2 mb-2">
            <Lightbulb className="w-5 h-5 text-orange-500 shrink-0" />
            <h2 className="font-bold text-gray-800">Dica de Caldas</h2>
          </div>
          <p className="text-sm text-gray-700">
            Chegue cedo ao parque para aproveitar as atrações com menos fila. Leve protetor solar e hidratação.
          </p>
        </div>

        {/* Rodapé contato */}
        <div className="text-center text-sm text-gray-600 space-y-2 pt-4">
          <p className="font-semibold text-gray-800">Dúvidas?</p>
          <p>Entre em contato: (62) 99999-9999 ou contato@reserveiviagens.com.br</p>
          <Link href="/melhorias-mobile" className="inline-block mt-4 text-blue-600 font-medium hover:underline">
            Voltar para ofertas
          </Link>
        </div>
      </div>
    </div>
  )
}
