"use client"

import { Shield, FileCheck, Award, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"

const TIMELINE = [
  {
    year: "2010",
    title: "Fundação",
    description: "Nascemos com o propósito de conectar pessoas às melhores experiências em Caldas Novas e região.",
  },
  {
    year: "2015",
    title: "Expansão",
    description: "Ampliamos nossa atuação para pacotes, hotéis e parques aquáticos com foco em atendimento personalizado.",
  },
  {
    year: "2020",
    title: "Tecnologia",
    description: "Investimos em plataforma digital e reservas online para facilitar a vida do viajante.",
  },
  {
    year: "2023",
    title: "IA integrada",
    description: "Lançamos assistente inteligente e ferramentas de busca para tornar o planejamento ainda mais simples.",
  },
]

export default function QuemSomosPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-br from-purple-600 to-blue-700 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon-reservei-viagens-VVm0zxcolWbkv9Lf5Yj0PUoxLJrARl.png"
              alt="Reservei Viagens"
              width={40}
              height={40}
              className="rounded-full bg-white/20 p-1"
            />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Quem Somos</h1>
          <p className="text-purple-100 mt-2">Sua parceira de confiança em Caldas Novas</p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <p className="text-gray-700 leading-relaxed">
              A <strong>Reservei Viagens</strong> é uma agência especializada em Caldas Novas e região, oferecendo
              hospedagem, ingressos para parques, pacotes e consultoria para sua viagem. Nossa missão é simplificar
              o planejamento e garantir as melhores condições para você e sua família.
            </p>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Nossa história</h2>
          <div className="relative space-y-6">
            {TIMELINE.map((item, i) => (
              <div key={item.year} className="flex gap-4">
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                    {item.year.slice(2)}
                  </div>
                  {i < TIMELINE.length - 1 && (
                    <div className="w-0.5 flex-1 min-h-[40px] bg-gray-200 my-1" />
                  )}
                </div>
                <div className="pb-6">
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Compromisso e confiança</h2>
            <p className="text-gray-700 text-sm leading-relaxed mb-6">
              Trabalhamos com transparência, segurança dos dados e foco no cliente. Conte conosco para planejar
              sua próxima viagem a Caldas Novas.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <Shield className="w-8 h-8 text-blue-600 shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Site Seguro</p>
                  <p className="text-xs text-gray-600">Ambiente protegido para suas reservas</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <FileCheck className="w-8 h-8 text-green-600 shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">LGPD Compliant</p>
                  <p className="text-xs text-gray-600">Seus dados tratados com privacidade</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <Award className="w-8 h-8 text-amber-600 shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Parceiro Oficial</p>
                  <p className="text-xs text-gray-600">Caldas Novas e região</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center pt-4 pb-12">
          <Link href="/contato">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Fale Conosco
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
