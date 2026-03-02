import type { AppProps } from 'next/app'
import { AuthProvider } from '../src/context/AuthContext'
import '../styles/globals.css'
import AppSidebar from '../components/AppSidebar'
import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { initializeDefaultTemplates } from '@/lib/default-templates'
import { Toaster } from 'react-hot-toast'

export default function App({ Component, pageProps }: AppProps) {
  console.log('[App] _app.tsx sendo renderizado');
  
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  
  // Verificar se está na página de login ou registro
  const isAuthPage = router.pathname === '/login' || router.pathname === '/register'
  
  console.log('[App] Renderizando com AuthProvider, pathname:', router.pathname);

  useEffect(() => {
    console.log('[App] _app.tsx montado, pathname:', router.pathname);
  }, [router.pathname]);

  useEffect(() => {
    // Inicializar templates padrão conforme documentação (linha 800-806)
    if (typeof window !== 'undefined') {
      try {
        initializeDefaultTemplates()
      } catch (error) {
        console.error('Erro ao inicializar templates padrão:', error)
      }
    }
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Detectar mudanças no estado da sidebar
  useEffect(() => {
    // Escutar mudanças de estado da sidebar via eventos customizados
    const handleSidebarStateChange = (e: CustomEvent) => {
      if (e.detail.collapsed !== undefined) {
        setSidebarCollapsed(e.detail.collapsed)
      }
      if (e.detail.open !== undefined) {
        setSidebarOpen(e.detail.open)
      }
      if (e.detail.mobile !== undefined) {
        setIsMobile(e.detail.mobile)
      }
    }

    window.addEventListener('sidebarStateChange', handleSidebarStateChange as EventListener)
    return () => window.removeEventListener('sidebarStateChange', handleSidebarStateChange as EventListener)
  }, [])

  // Calcular margem baseado no estado da sidebar
  const getMainContentMargin = () => {
    // Se estiver na página de login/registro, não aplicar margem
    if (isAuthPage) {
      return 'ml-0'
    }
    
    if (isMobile) {
      return 'ml-0' // Mobile: sem margem (drawer overlay)
    }
    
    if (!sidebarOpen) {
      return 'ml-0' // Sidebar fechada: sem margem
    }
    
    if (sidebarCollapsed) {
      return 'ml-16' // Sidebar colapsada: 64px (w-16)
    }
    
    return 'ml-64 md:ml-72' // Sidebar expandida: 256px ou 288px
  }

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Reservei Viagens - Sistema de Turismo</title>
        <meta name="description" content="Sistema completo de gestão turística Reservei Viagens" />
      </Head>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {!isAuthPage && <AppSidebar />}
          <main className={`transition-all duration-300 ease-in-out ${getMainContentMargin()} min-h-screen`}>
            <Component {...pageProps} />
          </main>
          <Toaster position="top-right" />
        </div>
      </AuthProvider>
    </>
  )
}