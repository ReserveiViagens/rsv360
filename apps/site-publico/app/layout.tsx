import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import nextDynamic from "next/dynamic"
import "./globals.css"
import { PwaRegister } from "@/components/pwa-register"
// Import direto - ToastWrapper já é Client Component, Next.js 15 gerencia automaticamente
import { ToastWrapper } from "@/components/providers/toast-wrapper"
import { AuthProvider } from "@/components/auth-provider"
import { Providers } from "./providers"
import { WebVitalsReporter } from "@/components/performance/WebVitalsReporter"

const CircularNavClientOnly = nextDynamic(() => import("@/components/circular-nav"), {
  ssr: false,
})

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "RSV 360° - Sistema de Reservas",
  description:
    "Sistema completo de gestão de reservas e aluguel por temporada. RSV 360° oferece soluções integradas para hotéis, pousadas e propriedades.",
  keywords:
    "reservas, hotel, pousada, aluguel temporada, gestão, sistema, rsv 360",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RSV 360°",
  },
  openGraph: {
    title: "RSV 360° - Sistema de Reservas",
    description:
      "Sistema completo de gestão de reservas e aluguel por temporada",
    url: "https://rsv360.com/",
    siteName: "RSV 360°",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RSV 360° - Sistema de Reservas",
    description:
      "Sistema completo de gestão de reservas e aluguel por temporada",
  },
  generator: 'v0.dev'
}

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        {/* Script para suprimir erros de scripts de terceiros (Facebook SDK, etc) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Suprimir erros de scripts de terceiros que tentam acessar elementos inexistentes
                const originalError = console.error;
                console.error = function(...args) {
                  const message = args.join(' ');
                  // Ignorar erros conhecidos de scripts de terceiros
                  if (
                    message.includes('Could not find element') ||
                    message.includes('DataStore.get: namespace is required') ||
                    message.includes('Permissions policy violation: unload') ||
                    message.includes('fd_content_pre_check')
                  ) {
                    return; // Suprimir esses erros específicos
                  }
                  // Manter outros erros
                  originalError.apply(console, args);
                };
                
                // Suprimir violações de Permissions Policy no console
                const originalWarn = console.warn;
                console.warn = function(...args) {
                  const message = args.join(' ');
                  if (message.includes('Permissions policy violation')) {
                    return; // Suprimir avisos de Permissions Policy
                  }
                  originalWarn.apply(console, args);
                };
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
          <ToastWrapper>
            <AuthProvider>
              {children}
              <CircularNavClientOnly />
              <PwaRegister />
              <WebVitalsReporter />
            </AuthProvider>
          </ToastWrapper>
        </Providers>
      </body>
    </html>
  )
}

export const dynamic = 'force-dynamic'
export const revalidate = 0
