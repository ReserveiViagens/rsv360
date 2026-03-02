"use client"
import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { 
  Menu, 
  X, 
  ChevronRight, 
  ChevronDown, 
  ChevronLeft,
  Target, 
  Plane, 
  Megaphone, 
  Gift, 
  ShoppingCart, 
  DollarSign, 
  FileText, 
  Bot, 
  Ticket, 
  Briefcase, 
  FileCheck, 
  MapPin, 
  Package, 
  Calculator,
  LayoutDashboard,
  Home
} from 'lucide-react'

interface SidebarItem {
  id: string
  name: string
  href: string
  icon?: React.ElementType
}

interface SidebarCategory {
  id: string
  name: string
  description?: string
  icon: React.ElementType
  color: string
  items: SidebarItem[]
}

export default function AppSidebar() {
  const router = useRouter()
  const pathname = (router.asPath || router.pathname || '') as string
  const [isOpen, setIsOpen] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isCompact, setIsCompact] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['cotacoes']))
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Detectar tamanho da tela e comunicar estado ao layout principal
  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      setIsMobile(w < 768)
      setIsCompact(h < 720)
      
      // Auto-collapse em mobile
      if (w < 768) {
        setIsOpen(false)
        setIsCollapsed(false)
      }
    }
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Notificar layout principal sobre mudanças de estado
  useEffect(() => {
    const event = new CustomEvent('sidebarStateChange', {
      detail: { 
        collapsed: isCollapsed, 
        open: isOpen,
        mobile: isMobile 
      }
    })
    window.dispatchEvent(event)
  }, [isCollapsed, isOpen, isMobile])

  // Verificar se uma rota está ativa
  const isActiveRoute = useCallback((href: string) => {
    if (!pathname) return false
    if (href === '/dashboard' || href === '/') {
      return pathname === '/dashboard' || pathname === '/' || pathname === ''
    }
    return pathname.startsWith(href)
  }, [pathname])

  // Verificar se uma categoria tem rota ativa
  const hasActiveRoute = useCallback((category: SidebarCategory) => {
    if (category.items.length === 0) {
      return category.id === 'all' && (pathname === '/dashboard' || pathname === '/')
    }
    return category.items.some(item => isActiveRoute(item.href))
  }, [pathname, isActiveRoute])

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const toggleCollapse = () => {
    const newCollapsed = !isCollapsed
    setIsCollapsed(newCollapsed)
    
    // Auto-expand categorias quando expandir
    if (newCollapsed) {
      // Ao colapsar, manter apenas categorias ativas expandidas
      const activeCategory = categories.find(cat => hasActiveRoute(cat))
      if (activeCategory) {
        setExpandedCategories(new Set([activeCategory.id]))
      }
    } else {
      // Ao expandir, expandir categoria ativa
      const activeCategory = categories.find(cat => hasActiveRoute(cat))
      if (activeCategory) {
        setExpandedCategories(prev => new Set([...prev, activeCategory.id]))
      }
    }
  }

  const handleMobileToggle = () => {
    setIsDrawerOpen(!isDrawerOpen)
  }

  const handleItemClick = () => {
    if (isMobile) {
      setIsDrawerOpen(false)
    }
  }

  const categories: SidebarCategory[] = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: Home,
      color: 'bg-blue-500',
      items: [
        { id: 'dashboard', name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }
      ]
    },
    {
      id: 'all',
      name: 'Todas as Funcionalidades',
      icon: Target,
      color: 'bg-blue-500',
      items: []
    },
    {
      id: 'gestao-turistica',
      name: 'Gestão Turística',
      description: 'Módulos de turismo',
      icon: Plane,
      color: 'bg-cyan-600',
      items: [
        { id: 'gestao-turistica-main', name: 'Gestão Turística', href: '/turismo' },
        { id: 'leiloes', name: 'Leilões', href: '/dashboard/leiloes' },
        { id: 'excursoes', name: 'Excursões', href: '/dashboard/excursoes' },
        { id: 'viagens-grupo', name: 'Viagens em Grupo', href: '/dashboard/viagens-grupo' },
        { id: 'marketplace', name: 'Marketplace', href: '/dashboard/marketplace' },
        { id: 'affiliates', name: 'Afiliados', href: '/dashboard/affiliates' },
        { id: 'google-hotel-ads', name: 'Google Hotel Ads', href: '/dashboard/google-hotel-ads' },
        { id: 'ota-sync', name: 'Sincronização OTA', href: '/dashboard/ota-sync' },
        { id: 'voice-commerce', name: 'Voice Commerce', href: '/dashboard/voice-commerce' }
      ]
    },
    {
      id: 'turismo',
      name: 'Turismo',
      description: 'Gestão de viagens',
      icon: Plane,
      color: 'bg-blue-600',
      items: [
        { id: 'viagens', name: 'Viagens', href: '/travel' },
        { id: 'atracoes', name: 'Atrações', href: '/attractions' },
        { id: 'parques', name: 'Parques', href: '/parks' },
        { id: 'ingressos', name: 'Ingressos', href: '/tickets' }
      ]
    },
    {
      id: 'marketing',
      name: 'Marketing',
      description: 'Campanhas e analytics',
      icon: Megaphone,
      color: 'bg-purple-600',
      items: [
        { id: 'campanhas', name: 'Campanhas', href: '/marketing' },
        { id: 'analytics', name: 'Analytics', href: '/analytics' },
        { id: 'seo', name: 'SEO', href: '/seo' },
        { id: 'recomendacoes', name: 'Recomendações', href: '/recommendations' }
      ]
    },
    {
      id: 'fidelizacao',
      name: 'Fidelização',
      description: 'Programa de fidelidade',
      icon: Gift,
      color: 'bg-pink-600',
      items: [
        { id: 'fidelidade', name: 'Fidelidade', href: '/loyalty' },
        { id: 'recompensas', name: 'Recompensas', href: '/rewards' },
        { id: 'cupons', name: 'Cupons', href: '/coupons' },
        { id: 'cartoes-presente', name: 'Cartões Presente', href: '/giftcards' }
      ]
    },
    {
      id: 'ecommerce',
      name: 'E-commerce',
      description: 'Vendas e produtos',
      icon: ShoppingCart,
      color: 'bg-green-600',
      items: [
        { id: 'vendas', name: 'Vendas', href: '/sales' },
        { id: 'produtos', name: 'Produtos', href: '/products' },
        { id: 'estoque', name: 'Estoque', href: '/inventory' },
        { id: 'ecommerce-plataforma', name: 'E-commerce', href: '/ecommerce' }
      ]
    },
    {
      id: 'financeiro',
      name: 'Financeiro',
      description: 'Gestão financeira',
      icon: DollarSign,
      color: 'bg-emerald-600',
      items: [
        { id: 'financas', name: 'Finanças', href: '/finance' },
        { id: 'relatorios', name: 'Relatórios', href: '/reports' },
        { id: 'pagamentos', name: 'Pagamentos', href: '/payments' },
        { id: 'reembolsos', name: 'Reembolsos', href: '/refunds' }
      ]
    },
    {
      id: 'conteudo',
      name: 'Conteúdo',
      description: 'Mídia e avaliações',
      icon: FileText,
      color: 'bg-indigo-600',
      items: [
        { id: 'fotos', name: 'Fotos', href: '/photos' },
        { id: 'videos', name: 'Vídeos', href: '/videos' },
        { id: 'avaliacoes', name: 'Avaliações', href: '/reviews' },
        { id: 'multilingue', name: 'Multilíngue', href: '/multilingual' }
      ]
    },
    {
      id: 'automacao',
      name: 'Automação',
      description: 'Chatbots e notificações',
      icon: Bot,
      color: 'bg-cyan-600',
      items: [
        { id: 'chatbots', name: 'Chatbots', href: '/chatbots' },
        { id: 'notificacoes', name: 'Notificações', href: '/notifications' },
        { id: 'automacao-config', name: 'Automação', href: '/automation' },
        { id: 'workflows', name: 'Workflows', href: '/workflows' }
      ]
    },
    {
      id: 'vouchers',
      name: 'Vouchers',
      description: 'Gestão de vouchers',
      icon: Ticket,
      color: 'bg-orange-600',
      items: [
        { id: 'vouchers-gestao', name: 'Vouchers', href: '/vouchers' },
        { id: 'editor', name: 'Editor', href: '/voucher-editor' },
        { id: 'reservas', name: 'Reservas', href: '/reservations' },
        { id: 'validacao', name: 'Validação', href: '/validation' }
      ]
    },
    {
      id: 'gestao',
      name: 'Gestão',
      description: 'Administração',
      icon: Briefcase,
      color: 'bg-slate-600',
      items: [
        { id: 'cadastros', name: 'Cadastros', href: '/gestao' },
        { id: 'usuarios', name: 'Usuários', href: '/users' },
        { id: 'permissoes', name: 'Permissões', href: '/permissions' },
        { id: 'configuracoes', name: 'Configurações', href: '/settings' }
      ]
    },
    {
      id: 'documentos',
      name: 'Documentos',
      description: 'Gestão documental',
      icon: FileCheck,
      color: 'bg-amber-600',
      items: [
        { id: 'documentos-gestao', name: 'Documentos', href: '/documents' },
        { id: 'contratos', name: 'Contratos', href: '/contracts' },
        { id: 'seguros', name: 'Seguros', href: '/insurance' },
        { id: 'vistos', name: 'Vistos', href: '/visa' }
      ]
    },
    {
      id: 'viagens-logistica',
      name: 'Viagens',
      description: 'Logística e transporte',
      icon: MapPin,
      color: 'bg-sky-600',
      items: [
        { id: 'viagens-logistica-gestao', name: 'Viagens', href: '/travel-catalog-rsv' },
        { id: 'hoteis', name: 'Hotéis', href: '/hotels' },
        { id: 'transporte', name: 'Transporte', href: '/transport' },
        { id: 'mapas', name: 'Mapas', href: '/maps' }
      ]
    },
    {
      id: 'subscricoes',
      name: 'Subscrições',
      description: 'Planos e assinaturas',
      icon: Package,
      color: 'bg-violet-600',
      items: [
        { id: 'subscricoes-gestao', name: 'Subscrições', href: '/subscriptions' },
        { id: 'planos', name: 'Planos', href: '/plans' },
        { id: 'cobranca', name: 'Cobrança', href: '/billing' },
        { id: 'upgrades', name: 'Upgrades', href: '/upgrades' }
      ]
    },
    {
      id: 'cotacoes',
      name: 'Cotações',
      description: 'Orçamentos e propostas',
      icon: Calculator,
      color: 'bg-teal-600',
      items: [
        { id: 'cotacoes-dashboard', name: 'Dashboard', href: '/cotacoes' },
        { id: 'nova-cotacao', name: 'Nova Cotação', href: '/cotacoes/new' },
        { id: 'templates-cotacao', name: 'Templates', href: '/cotacoes/templates' },
        { id: 'cotacoes-hoteis', name: 'Hotéis', href: '/cotacoes/hoteis' },
        { id: 'cotacoes-parques', name: 'Parques', href: '/cotacoes/parques' },
        { id: 'cotacoes-atracoes', name: 'Atrações', href: '/cotacoes/atracoes' },
        { id: 'cotacoes-passeios', name: 'Passeios', href: '/cotacoes/passeios' }
      ]
    }
  ]

  const SidebarContent = (
    <>
      {/* Header */}
      <div className={`flex items-center justify-between ${isCollapsed ? 'p-2 justify-center' : 'p-3'} border-b border-gray-200 dark:border-gray-700 transition-all`}>
        {!isCollapsed && (
          <div className={`flex items-center ${isCompact ? 'space-x-2' : 'space-x-2.5'}`}>
            <div className={`${isCompact ? 'w-8 h-8' : 'w-9 h-9'} rounded-xl rsv-gradient flex items-center justify-center flex-shrink-0`}>
              <Target className={`${isCompact ? 'w-4 h-4' : 'w-5 h-5'} text-white`} />
            </div>
            <div className="min-w-0">
              <div className={`${isCompact ? 'text-sm' : 'text-base'} font-bold text-gray-800 dark:text-white leading-tight truncate`}>
                Reservei Viagens
              </div>
              <div className={`${isCompact ? 'text-[10px]' : 'text-[11px]'} text-gray-500 dark:text-gray-400 leading-tight truncate`}>
                Dashboard
              </div>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="w-9 h-9 rounded-xl rsv-gradient flex items-center justify-center mx-auto">
            <Target className="w-5 h-5 text-white" />
          </div>
        )}
        {!isMobile && (
          <button 
            onClick={toggleCollapse}
            title={isCollapsed ? "Expandir menu" : "Colapsar menu"}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
          >
            {isCollapsed ? (
              <ChevronRight className={`${isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-gray-600 dark:text-gray-300`} />
            ) : (
              <ChevronLeft className={`${isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-gray-600 dark:text-gray-300`} />
            )}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden ${isCollapsed ? 'p-1' : isCompact ? 'p-2 space-y-0.5' : 'p-2.5 space-y-0.5'} custom-scrollbar`}>
        {categories.map((category) => {
          const isActive = hasActiveRoute(category)
          const isExpanded = expandedCategories.has(category.id)
          
          // Se estiver colapsado, mostrar apenas ícones
          if (isCollapsed) {
            return (
              <Link
                key={category.id}
                href={category.items.length > 0 ? category.items[0].href : category.id === 'all' ? '/dashboard' : '#'}
                onClick={handleItemClick}
                className={`relative flex items-center justify-center ${isCompact ? 'w-10 h-10' : 'w-12 h-12'} mb-1 rounded-lg transition-all group ${
                  isActive 
                    ? `${category.color} text-white shadow-md` 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title={category.name}
              >
                <category.icon className={`${isCompact ? 'w-5 h-5' : 'w-6 h-6'}`} />
                {isActive && (
                  <span className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-l-full"></span>
                )}
              </Link>
            )
          }

          // Modo expandido (desktop)
          return (
            <div key={category.id}>
              {category.items.length === 0 || category.id === 'dashboard' ? (
                <Link
                  href={category.items.length > 0 && category.items[0] ? category.items[0].href : '/dashboard'}
                  onClick={handleItemClick}
                  className={`w-full flex items-center ${isCompact ? 'p-2' : 'p-2.5'} rounded-lg transition-all ${
                    isActiveRoute(category.items.length > 0 && category.items[0] ? category.items[0].href : '/dashboard')
                      ? `${category.color} text-white shadow-md` 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className={`${isCompact ? 'w-6 h-6' : 'w-7 h-7'} ${isActiveRoute(category.items.length > 0 && category.items[0] ? category.items[0].href : '/dashboard') ? 'bg-white/20' : category.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <category.icon className={`${isCompact ? 'w-4 h-4' : 'w-4 h-4'} ${isActiveRoute(category.items.length > 0 && category.items[0] ? category.items[0].href : '/dashboard') ? 'text-white' : 'text-white'}`} />
                  </div>
                  {!isCollapsed && (
                    <div className="ml-3 text-left min-w-0 flex-1">
                      <div className={`font-medium truncate ${isCompact ? 'text-sm' : 'text-sm'}`}>
                        {category.name}
                      </div>
                      {category.description && (
                        <div className={`${isCompact ? 'text-[10px]' : 'text-xs'} text-gray-500 dark:text-gray-400 truncate`}>
                          {category.description}
                        </div>
                      )}
                    </div>
                  )}
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className={`w-full flex items-center justify-between ${isCompact ? 'p-2' : 'p-2.5'} rounded-lg transition-all ${
                      isActive 
                        ? 'bg-gray-100 dark:bg-gray-700' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className={`${isCompact ? 'w-6 h-6' : 'w-7 h-7'} ${category.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <category.icon className={`${isCompact ? 'w-4 h-4' : 'w-4 h-4'} text-white`} />
                      </div>
                      <div className="text-left min-w-0 flex-1">
                        <div className={`font-medium truncate ${isCompact ? 'text-sm' : 'text-sm'}`}>
                          {category.name}
                        </div>
                        {category.description && (
                          <div className={`${isCompact ? 'text-[10px]' : 'text-xs'} text-gray-500 dark:text-gray-400 truncate`}>
                            {category.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronDown className={`${isCompact ? 'w-4 h-4' : 'w-4 h-4'} transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isExpanded && (
                    <div className={`ml-4 mt-1 space-y-0.5 ${isCollapsed ? 'hidden' : ''}`}>
                      {category.items.map((item) => {
                        const itemIsActive = isActiveRoute(item.href)
                        return (
                          <Link
                            key={item.id}
                            href={item.href}
                            onClick={handleItemClick}
                            className={`block ${isCompact ? 'p-2 pl-4' : 'p-2.5 pl-5'} rounded-md transition-all relative ${
                              itemIsActive
                                ? `${category.color} text-white shadow-sm font-medium` 
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              {item.icon && (
                                <item.icon className={`${isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
                              )}
                              <span className={`${isCompact ? 'text-xs' : 'text-sm'}`}>{item.name}</span>
                            </div>
                            {itemIsActive && (
                              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full"></span>
                            )}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className={`p-3 border-t border-gray-200 dark:border-gray-700`}>
          <div className={`${isCompact ? 'text-[10px]' : 'text-xs'} text-center text-gray-500 dark:text-gray-400`}>
            Reservei Viagens v1.0
          </div>
        </div>
      )}
    </>
  )

  // Botão flutuante para abrir sidebar (mobile)
  const FloatingToggleButton = !isMobile && !isOpen && (
    <button
      onClick={() => setIsOpen(true)}
      title="Abrir menu"
      className="fixed left-3 top-4 z-50 inline-flex items-center justify-center rounded-md border border-gray-200 bg-white/90 backdrop-blur-sm px-3 py-2 text-gray-700 shadow-lg hover:bg-white dark:border-gray-800 dark:bg-gray-900/90 dark:text-gray-200 transition-all"
    >
      <ChevronRight className="w-4 h-4" />
    </button>
  )

  // Botão mobile hamburger
  const MobileToggleButton = isMobile && (
    <button
      onClick={handleMobileToggle}
      title="Abrir menu"
      className="fixed left-4 top-4 z-50 inline-flex items-center justify-center rounded-md border border-gray-200 bg-white/90 backdrop-blur-sm px-3 py-2 text-gray-700 shadow-lg hover:bg-white dark:border-gray-800 dark:bg-gray-900/90 dark:text-gray-200"
    >
      <Menu className="w-5 h-5" />
    </button>
  )

  return (
    <>
      {FloatingToggleButton}
      {MobileToggleButton}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside 
          className={`h-screen fixed left-0 top-0 shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-all duration-300 ease-in-out z-40 ${
            isCollapsed 
              ? 'w-16' 
              : isCompact 
                ? 'w-64' 
                : 'w-72'
          } ${!isOpen ? '-translate-x-full' : 'translate-x-0'}`}
        >
          <div className="h-full flex flex-col min-h-0">
            {SidebarContent}
          </div>
        </aside>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <>
          {/* Overlay */}
          {isDrawerOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-40 transition-opacity"
              onClick={handleMobileToggle}
            />
          )}
          
          {/* Drawer */}
          <aside
            className={`fixed left-0 top-0 h-full w-72 max-w-[85vw] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-2xl z-50 transition-transform duration-300 ease-in-out ${
              isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="h-full flex flex-col min-h-0">
              <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl rsv-gradient flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-base font-bold text-gray-800 dark:text-white">
                      Reservei Viagens
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">
                      Dashboard
                    </div>
                  </div>
                </div>
                <button 
                  onClick={handleMobileToggle}
                  title="Fechar menu"
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {SidebarContent}
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  )
}