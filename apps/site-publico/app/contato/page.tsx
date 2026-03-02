"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Phone, Mail, MapPin, Clock, MessageCircle, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"

export default function ContatoPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [formNome, setFormNome] = useState("")
  const [formMensagem, setFormMensagem] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-purple-600 to-blue-600 flex flex-col items-center justify-center z-50">
        <div className="relative mb-8">
          <div className="w-32 h-32 rounded-full bg-white/20 animate-pulse"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl animate-bounce">📞</div>
          </div>
        </div>
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Carregando Contatos</h2>
          <p className="text-purple-100">Conectando você com nossos especialistas...</p>
        </div>
        <div className="mt-8 w-48 h-1 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full animate-pulse"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-purple-500 to-blue-600 min-h-screen relative">
      <div className="animate-in fade-in duration-500">
        {/* Header */}
        <header className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-b-3xl shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/80 to-blue-600/80"></div>
          <div className="relative z-10">
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

            <div className="text-center">
              <div className="bg-purple-500 rounded-full px-6 py-3 inline-block mb-4">
                <h1 className="text-xl font-bold tracking-tight">Reservei Viagens</h1>
              </div>
              <p className="text-purple-100 text-sm">Especialistas em Caldas Novas</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-4 space-y-4">
          {/* Consultoria de Viagens */}
          <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
            <CardContent className="p-0">
              <div className="flex items-center">
                <div className="flex-1 p-6">
                  <h3 className="text-xl font-bold mb-2">Consultoria</h3>
                  <h3 className="text-xl font-bold mb-3">de Viagens</h3>
                  <p className="text-sm text-blue-100 mb-4">Planejamento personalizado para sua viagem dos sonhos</p>
                  <Button
                    className="bg-white text-blue-600 hover:bg-blue-50 font-bold"
                    onClick={() =>
                      window.open(
                        "https://wa.me/5564993197555?text=Olá! Quero uma consultoria personalizada para minha viagem!",
                        "_blank",
                      )
                    }
                  >
                    Consultar Agora
                  </Button>
                </div>
                <div className="w-32 h-32 bg-white/20 rounded-l-full flex items-center justify-center mr-4">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                    <span className="text-3xl">👨‍💼</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Catálogos de Pacotes */}
          <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-r from-orange-500 to-red-500 text-white">
            <CardContent className="p-0">
              <div className="flex items-center">
                <div className="w-32 h-32 bg-white/20 rounded-r-full flex items-center justify-center ml-4">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                    <span className="text-3xl">🏨</span>
                  </div>
                </div>
                <div className="flex-1 p-6">
                  <h3 className="text-xl font-bold mb-2">Catálogos</h3>
                  <h3 className="text-xl font-bold mb-3">de Pacotes</h3>
                  <p className="text-sm text-orange-100 mb-4">via WhatsApp</p>
                  <Button
                    className="bg-white text-orange-600 hover:bg-orange-50 font-bold"
                    onClick={() =>
                      window.open(
                        "https://wa.me/5564993197555?text=Olá! Quero receber o catálogo completo de pacotes!",
                        "_blank",
                      )
                    }
                  >
                    Receber Catálogo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fale Conosco / Contato e WhatsApp */}
          <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-r from-green-500 to-emerald-500 text-white">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mr-4">
                  <span className="text-3xl">👨‍💼</span>
                </div>
                <div className="flex gap-2">
                  <MessageCircle className="w-8 h-8 text-white" />
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">Fale Conosco</h3>
              <h3 className="text-xl font-bold mb-4">WhatsApp</h3>
              <p className="text-sm text-green-100 mb-4">Atendimento personalizado via WhatsApp</p>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  className="bg-white text-green-600 hover:bg-green-50 font-bold text-xs"
                  onClick={() => window.open("https://wa.me/5564993197555", "_blank")}
                >
                  (64) 99319-7555
                </Button>
                <Button
                  className="bg-white text-green-600 hover:bg-green-50 font-bold text-xs"
                  onClick={() => window.open("https://wa.me/5564993068752", "_blank")}
                >
                  (64) 99306-8752
                </Button>
                <Button
                  className="bg-white text-green-600 hover:bg-green-50 font-bold text-xs"
                  onClick={() => window.open("https://wa.me/5565992351207", "_blank")}
                >
                  (65) 99235-1207
                </Button>
                <Button
                  className="bg-white text-green-600 hover:bg-green-50 font-bold text-xs"
                  onClick={() => window.open("https://wa.me/5565992048814", "_blank")}
                >
                  (65) 99204-8814
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Agendamentos e Visitas */}
          <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-r from-gray-500 to-gray-600 text-white">
            <CardContent className="p-0">
              <div className="flex items-center">
                <div className="flex-1 p-6">
                  <h3 className="text-xl font-bold mb-2">Agendamentos</h3>
                  <h3 className="text-xl font-bold mb-3">e Reservas</h3>
                  <p className="text-sm text-gray-100 mb-4">Agende sua viagem com facilidade</p>
                  <Button
                    className="bg-white text-gray-600 hover:bg-gray-50 font-bold"
                    onClick={() =>
                      window.open(
                        "https://wa.me/5564993197555?text=Olá! Quero agendar minha viagem para Caldas Novas!",
                        "_blank",
                      )
                    }
                  >
                    Agendar Agora
                  </Button>
                </div>
                <div className="w-32 h-32 bg-white/20 rounded-l-full flex items-center justify-center mr-4">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-gray-600" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Envie um E-mail - Formulário */}
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4 text-gray-800">Envie um E-mail</h3>
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  window.location.href = `mailto:reservas@reserveiviagens.com.br?subject=Contato pelo site&body=${encodeURIComponent(`Nome: ${formNome}\n\nMensagem:\n${formMensagem}`)}`
                }}
              >
                <div>
                  <Label htmlFor="nome" className="text-gray-700">Nome</Label>
                  <Input
                    id="nome"
                    value={formNome}
                    onChange={(e) => setFormNome(e.target.value)}
                    placeholder="Seu nome"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="mensagem" className="text-gray-700">Mensagem</Label>
                  <Textarea
                    id="mensagem"
                    value={formMensagem}
                    onChange={(e) => setFormMensagem(e.target.value)}
                    placeholder="Sua mensagem..."
                    rows={4}
                    className="mt-1"
                  />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  Enviar Mensagem
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Nossas Unidades */}
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4 text-center text-gray-800">Nossas Unidades</h3>

              <div className="space-y-4 text-sm text-gray-700">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="font-semibold">Sede Caldas Novas:</p>
                    <p>Rua RP5, Residencial Primavera 2</p>
                    <p>Caldas Novas, Goiás</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="font-semibold">Filial Cuiabá:</p>
                    <p>Av. Manoel José de Arruda, Porto</p>
                    <p>Cuiabá, Mato Grosso</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-semibold">E-mail:</p>
                    <a href="mailto:reservas@reserveiviagens.com.br" className="text-blue-600 hover:underline">
                      reservas@reserveiviagens.com.br
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-semibold">Telefone:</p>
                    <a href="tel:+556521270415" className="text-blue-600 hover:underline">
                      (65) 2127-0415
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-semibold">Horário de Atendimento:</p>
                    <p>Segunda a Sexta: 8h às 18h</p>
                    <p>Sábado: 8h às 12h</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Redes Sociais */}
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <h3 className="font-bold text-lg mb-4 text-gray-800">🌐 Siga-nos nas Redes</h3>

              <div className="flex justify-center gap-4">
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-12 h-12"
                  onClick={() => window.open("https://www.facebook.com/comercialreservei", "_blank")}
                >
                  📘
                </Button>
                <Button
                  className="bg-pink-500 hover:bg-pink-600 text-white rounded-full w-12 h-12"
                  onClick={() => window.open("https://www.instagram.com/reserveiviagens", "_blank")}
                >
                  📸
                </Button>
                <Button
                  className="bg-gray-600 hover:bg-gray-700 text-white rounded-full w-12 h-12"
                  onClick={() => window.open("https://www.reserveiviagens.com.br", "_blank")}
                >
                  🌐
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Back Button */}
          <div className="flex justify-center pt-6 pb-20">
            <Link href="/">
              <Button
                variant="outline"
                className="text-white hover:text-purple-600 border-white hover:border-purple-300 hover:bg-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Início
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* WhatsApp Float Button */}
      <a
        href="https://wa.me/5564993197555?text=Olá! Gostaria de mais informações sobre as ofertas da Reservei Viagens."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 right-4 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 z-50 animate-pulse"
      >
        <Phone className="w-7 h-7 text-white" />
      </a>
    </div>
  )
}
