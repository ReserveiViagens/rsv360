"use client"

import { useState, useEffect } from "react"
import { X, Shield, Eye, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface LGPDPopupProps {
  onAccept: () => void
  onDecline: () => void
}

export default function LGPDPopup({ onAccept, onDecline }: LGPDPopupProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has already made a choice
    const lgpdConsent = localStorage.getItem("reservei-lgpd-consent")
    if (!lgpdConsent) {
      // Show popup after a small delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem("reservei-lgpd-consent", "accepted")
    localStorage.setItem("reservei-lgpd-date", new Date().toISOString())
    setIsVisible(false)
    onAccept()
  }

  const handleDecline = () => {
    localStorage.setItem("reservei-lgpd-consent", "declined")
    localStorage.setItem("reservei-lgpd-date", new Date().toISOString())
    setIsVisible(false)
    onDecline()
  }

  const handleClose = () => {
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-end justify-center p-4">
      <div className="animate-in slide-in-from-bottom duration-300">
        <Card className="max-w-md w-full bg-white shadow-2xl border-2 border-blue-200">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-lg text-gray-800">Privacidade e Cookies</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={handleClose} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* LGPD Badge */}
            <div className="mb-4">
              <Badge className="bg-green-100 text-green-800 border border-green-200">
                🇧🇷 Conforme LGPD - Lei 13.709/2018
              </Badge>
            </div>

            {/* Content */}
            <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
              <p>
                A <strong>Reservei Viagens</strong> utiliza cookies e tecnologias similares para melhorar sua
                experiência de navegação e personalizar ofertas.
              </p>

              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Como usamos seus dados:
                </h4>
                <ul className="text-xs space-y-1 text-blue-700">
                  <li>
                    • <strong>Funcionais:</strong> Melhorar navegação e funcionalidades
                  </li>
                  <li>
                    • <strong>Analíticos:</strong> Entender como você usa nosso site
                  </li>
                  <li>
                    • <strong>Marketing:</strong> Personalizar ofertas de viagens
                  </li>
                  <li>
                    • <strong>WhatsApp:</strong> Facilitar atendimento personalizado
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Seus direitos LGPD:
                </h4>
                <ul className="text-xs space-y-1 text-gray-600">
                  <li>• Acessar, corrigir ou excluir seus dados</li>
                  <li>• Revogar consentimento a qualquer momento</li>
                  <li>• Portabilidade dos dados pessoais</li>
                  <li>• Informações sobre compartilhamento</li>
                </ul>
              </div>

              <p className="text-xs text-gray-600">
                Para exercer seus direitos ou esclarecer dúvidas, entre em contato:
                <br />📧 <strong>privacidade@reserveiviagens.com.br</strong>
                <br />📞 <strong>(64) 99319-7555</strong>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 mt-6">
              <Button
                onClick={handleAccept}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
              >
                ✅ Aceitar e Continuar
              </Button>

              <div className="flex gap-2">
                <Button
                  onClick={handleDecline}
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-50 text-sm"
                >
                  Recusar
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-blue-300 text-blue-600 hover:bg-blue-50 text-sm"
                  onClick={() => window.open("/politica-privacidade", "_blank")}
                >
                  Ver Política
                </Button>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Ao continuar navegando, você concorda com nossa Política de Privacidade
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
