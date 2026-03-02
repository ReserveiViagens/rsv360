"use client"

import { ArrowLeft, Shield, Eye, Lock, Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"

export default function PoliticaPrivacidadePage() {
  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen relative">
      <div className="animate-in fade-in duration-500">
        {/* Header */}
        <header className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-6 rounded-b-3xl shadow-lg">
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
            <h1 className="text-xl font-bold tracking-tight">Política de Privacidade</h1>
          </div>

          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
            <Badge className="bg-green-500 text-white mb-2">🇧🇷 Conforme LGPD</Badge>
            <p className="text-sm">Lei 13.709/2018 - Proteção de Dados Pessoais</p>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-6 space-y-6">
          {/* Introduction */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-blue-600" />
                <h2 className="font-bold text-lg">Compromisso com sua Privacidade</h2>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                A <strong>Reservei Viagens</strong> está comprometida em proteger e respeitar sua privacidade. Esta
                política explica como coletamos, usamos e protegemos suas informações pessoais em conformidade com a Lei
                Geral de Proteção de Dados (LGPD).
              </p>
            </CardContent>
          </Card>

          {/* Data Collection */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-5 h-5 text-green-600" />
                <h2 className="font-bold text-lg">Dados que Coletamos</h2>
              </div>
              <div className="space-y-3 text-sm text-gray-700">
                <div>
                  <h3 className="font-semibold text-blue-700 mb-1">📋 Dados Fornecidos por Você:</h3>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Nome, telefone e e-mail para reservas</li>
                    <li>Preferências de viagem e destinos</li>
                    <li>Informações de pagamento (processadas com segurança)</li>
                    <li>Comunicações via WhatsApp e formulários</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-700 mb-1">🔍 Dados Coletados Automaticamente:</h3>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Informações de navegação e cookies</li>
                    <li>Endereço IP e localização aproximada</li>
                    <li>Dispositivo e navegador utilizado</li>
                    <li>Páginas visitadas e tempo de permanência</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Usage */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-5 h-5 text-purple-600" />
                <h2 className="font-bold text-lg">Como Usamos seus Dados</h2>
              </div>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h3 className="font-semibold text-blue-700 mb-2">🎯 Finalidades Principais:</h3>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Processar e confirmar suas reservas</li>
                    <li>Fornecer atendimento personalizado</li>
                    <li>Enviar confirmações e atualizações de viagem</li>
                    <li>Melhorar nossos serviços e experiência</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <h3 className="font-semibold text-green-700 mb-2">📈 Marketing e Comunicação:</h3>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Ofertas personalizadas de viagens</li>
                    <li>Newsletter com promoções especiais</li>
                    <li>Comunicação via WhatsApp (com seu consentimento)</li>
                    <li>Pesquisas de satisfação</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rights */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-orange-600" />
                <h2 className="font-bold text-lg">Seus Direitos LGPD</h2>
              </div>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="bg-orange-50 p-3 rounded-lg">
                  <h3 className="font-semibold text-orange-700 mb-2">⚖️ Você tem direito a:</h3>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>
                      <strong>Acesso:</strong> Saber quais dados temos sobre você
                    </li>
                    <li>
                      <strong>Correção:</strong> Atualizar informações incorretas
                    </li>
                    <li>
                      <strong>Exclusão:</strong> Solicitar remoção dos seus dados
                    </li>
                    <li>
                      <strong>Portabilidade:</strong> Receber seus dados em formato legível
                    </li>
                    <li>
                      <strong>Revogação:</strong> Retirar consentimento a qualquer momento
                    </li>
                    <li>
                      <strong>Informação:</strong> Saber com quem compartilhamos seus dados
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-5 h-5 text-red-600" />
                <h2 className="font-bold text-lg">Segurança dos Dados</h2>
              </div>
              <div className="space-y-3 text-sm text-gray-700">
                <p>Implementamos medidas técnicas e organizacionais para proteger seus dados:</p>
                <div className="bg-red-50 p-3 rounded-lg">
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Criptografia SSL/TLS para transmissão de dados</li>
                    <li>Servidores seguros com acesso restrito</li>
                    <li>Treinamento regular da equipe sobre privacidade</li>
                    <li>Monitoramento contínuo de segurança</li>
                    <li>Backup regular e seguro dos dados</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-5 h-5 text-indigo-600" />
                <h2 className="font-bold text-lg">Cookies e Tecnologias</h2>
              </div>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <h3 className="font-semibold text-indigo-700 mb-2">🍪 Tipos de Cookies:</h3>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>
                      <strong>Essenciais:</strong> Necessários para funcionamento básico
                    </li>
                    <li>
                      <strong>Funcionais:</strong> Melhoram sua experiência de navegação
                    </li>
                    <li>
                      <strong>Analíticos:</strong> Nos ajudam a entender como você usa o site
                    </li>
                    <li>
                      <strong>Marketing:</strong> Personalizam ofertas e anúncios
                    </li>
                  </ul>
                </div>
                <p className="text-xs">
                  Você pode gerenciar suas preferências de cookies nas configurações do seu navegador.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Phone className="w-5 h-5 text-blue-600" />
                <h2 className="font-bold text-lg">Contato - Privacidade</h2>
              </div>
              <div className="space-y-3 text-sm text-gray-700">
                <p>Para exercer seus direitos ou esclarecer dúvidas sobre privacidade:</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <a href="mailto:privacidade@reserveiviagens.com.br" className="text-blue-600 hover:underline">
                      privacidade@reserveiviagens.com.br
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-green-600" />
                    <a href="https://wa.me/5564993197555" className="text-green-600 hover:underline">
                      (64) 99319-7555 - WhatsApp
                    </a>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-blue-200">
                  <p className="text-xs font-semibold text-blue-700 mb-1">📍 Endereço:</p>
                  <p className="text-xs">
                    Rua RP5, Residencial Primavera 2<br />
                    Caldas Novas - GO, CEP: 75690-000
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Updates */}
          <Card>
            <CardContent className="p-6">
              <h2 className="font-bold text-lg mb-3">📅 Atualizações desta Política</h2>
              <div className="space-y-2 text-sm text-gray-700">
                <p>
                  Esta política pode ser atualizada periodicamente. Notificaremos sobre mudanças significativas através
                  do nosso site e por e-mail.
                </p>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <p className="text-xs">
                    <strong>Última atualização:</strong> Janeiro de 2025
                    <br />
                    <strong>Versão:</strong> 2.0 - Conforme LGPD
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Back Button */}
          <div className="flex justify-center pt-6 pb-20">
            <Link href="/">
              <Button
                variant="outline"
                className="text-gray-600 hover:text-blue-600 border-gray-300 hover:border-blue-300"
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
        href="https://wa.me/5564993197555?text=Olá! Tenho dúvidas sobre a política de privacidade da Reservei Viagens."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 right-4 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 z-50 animate-pulse"
      >
        <Phone className="w-7 h-7 text-white" />
      </a>
    </div>
  )
}
