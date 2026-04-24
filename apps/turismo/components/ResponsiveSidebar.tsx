import * as React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";
import {
  Menu,
  X,
  Search,
  ChevronDown,
  ChevronRight,
  Home,
  Server,
  DollarSign,
  ShoppingCart,
  MapPin,
  Camera,
  BarChart3,
  Users,
  Bell,
  Settings,
  Shield,
  Globe,
  Database,
  Cloud,
  TrendingUp,
  Calendar,
  Mail,
  Phone,
  Gift,
  Star,
  CreditCard,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Flag,
  Layers,
  Award,
  Target,
  Zap,
  FileText,
  Video,
  Filter,
  Download,
  Upload,
  Plus,
  Edit,
  Eye,
  Trash2,
  MoreHorizontal,
  User,
  Hotel,
  Plane,
  Car,
  Wifi,
  WifiOff,
  CheckCircle2,
  AlertCircle,
  Clock,
  Activity,
  Package2,
  RotateCcw
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface ServiceItem {
  id: string;
  name: string;
  port: number;
  status: "online" | "offline" | "maintenance" | "warning";
  icon: React.ReactNode;
  description: string;
  metrics?: {
    label: string;
    value: string;
    unit?: string;
  }[];
}

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  services: ServiceItem[];
}

interface ResponsiveSidebarProps {
  className?: string;
  onServiceSelect?: (service: ServiceItem) => void;
  onToggle?: (isOpen: boolean) => void;
}

const serviceCategories: Category[] = [
  {
    id: "core",
    name: "Serviços Principais",
    icon: <Server className="w-5 h-5" />,
    color: "text-blue-600",
    services: [
      {
        id: "core",
        name: "API Principal",
        port: 5000,
        status: "online",
        icon: <Server className="w-4 h-4" />,
        description: "API principal e autenticação",
        metrics: [
          { label: "CPU", value: "45", unit: "%" },
          { label: "Memória", value: "2.1", unit: "GB" },
          { label: "Requisições", value: "1.2k", unit: "/min" }
        ]
      },
      {
        id: "travel",
        name: "Serviço de Viagens",
        port: 6003,
        status: "online",
        icon: <Plane className="w-4 h-4" />,
        description: "Gestão de viagens e pacotes",
        metrics: [
          { label: "Reservas", value: "156", unit: "" },
          { label: "Receita", value: "R$ 45k", unit: "" },
          { label: "Ativos", value: "89%", unit: "" }
        ]
      },
      {
        id: "finance",
        name: "Serviço Financeiro",
        port: 6005,
        status: "online",
        icon: <DollarSign className="w-4 h-4" />,
        description: "Controle financeiro e relatórios",
        metrics: [
          { label: "Transações", value: "2.3k", unit: "" },
          { label: "Receita", value: "R$ 120k", unit: "" },
          { label: "Pendentes", value: "12", unit: "" }
        ]
      },
      {
        id: "tickets",
        name: "Serviço de Tickets",
        port: 6006,
        status: "online",
        icon: <MessageCircle className="w-4 h-4" />,
        description: "Sistema de tickets e suporte",
        metrics: [
          { label: "Abertos", value: "23", unit: "" },
          { label: "Resolvidos", value: "156", unit: "" },
          { label: "Tempo Médio", value: "2.4h", unit: "" }
        ]
      }
    ]
  },
  {
    id: "business",
    name: "Serviços de Negócios",
    icon: <ShoppingCart className="w-5 h-5" />,
    color: "text-green-600",
    services: [
      {
        id: "payments",
        name: "Pagamentos",
        port: 5007,
        status: "online",
        icon: <CreditCard className="w-4 h-4" />,
        description: "Gateway de pagamento",
        metrics: [
          { label: "Sucesso", value: "98.5%", unit: "" },
          { label: "Volume", value: "R$ 89k", unit: "" },
          { label: "Pendentes", value: "5", unit: "" }
        ]
      },
      {
        id: "ecommerce",
        name: "E-commerce",
        port: 6008,
        status: "online",
        icon: <ShoppingCart className="w-4 h-4" />,
        description: "Loja virtual e produtos",
        metrics: [
          { label: "Produtos", value: "1.2k", unit: "" },
          { label: "Pedidos", value: "89", unit: "" },
          { label: "Receita", value: "R$ 23k", unit: "" }
        ]
      },
      {
        id: "attractions",
        name: "Atrações",
        port: 6009,
        status: "online",
        icon: <MapPin className="w-4 h-4" />,
        description: "Atrações turísticas",
        metrics: [
          { label: "Localizações", value: "45", unit: "" },
          { label: "Reservas", value: "234", unit: "" },
          { label: "Avaliação", value: "4.8", unit: "/5" }
        ]
      },
      {
        id: "vouchers",
        name: "Vouchers",
        port: 6010,
        status: "online",
        icon: <Gift className="w-4 h-4" />,
        description: "Sistema de vouchers",
        metrics: [
          { label: "Ativos", value: "156", unit: "" },
          { label: "Usados", value: "89", unit: "" },
          { label: "Valor", value: "R$ 12k", unit: "" }
        ]
      },
      {
        id: "voucher-editor",
        name: "Editor de Vouchers",
        port: 5011,
        status: "online",
        icon: <Edit className="w-4 h-4" />,
        description: "Editor de vouchers",
        metrics: [
          { label: "Modelos", value: "23", unit: "" },
          { label: "Criados", value: "156", unit: "" },
          { label: "Publicados", value: "89", unit: "" }
        ]
      },
      {
        id: "giftcards",
        name: "Cartões Presente",
        port: 6012,
        status: "online",
        icon: <Gift className="w-4 h-4" />,
        description: "Cartões presente",
        metrics: [
          { label: "Emitidos", value: "45", unit: "" },
          { label: "Resgatados", value: "23", unit: "" },
          { label: "Saldo", value: "R$ 8.5k", unit: "" }
        ]
      },
      {
        id: "coupons",
        name: "Cupons",
        port: 6013,
        status: "online",
        icon: <Star className="w-4 h-4" />,
        description: "Sistema de cupons",
        metrics: [
          { label: "Ativos", value: "12", unit: "" },
          { label: "Usados", value: "234", unit: "" },
          { label: "Economia", value: "R$ 5.6k", unit: "" }
        ]
      }
    ]
  },
  {
    id: "specialized",
    name: "Serviços Especializados",
    icon: <Target className="w-5 h-5" />,
    color: "text-purple-600",
    services: [
      {
        id: "parks",
        name: "Parques",
        port: 6014,
        status: "online",
        icon: <MapPin className="w-4 h-4" />,
        description: "Parques temáticos",
        metrics: [
          { label: "Parques", value: "8", unit: "" },
          { label: "Capacidade", value: "2.5k", unit: "" },
          { label: "Ocupação", value: "78%", unit: "" }
        ]
      },
      {
        id: "maps",
        name: "Mapas",
        port: 6015,
        status: "online",
        icon: <Globe className="w-4 h-4" />,
        description: "Mapas e geolocalização",
        metrics: [
          { label: "Localizações", value: "1.2k", unit: "" },
          { label: "Rotas", value: "456", unit: "" },
          { label: "Precisão", value: "99.2%", unit: "" }
        ]
      },
      {
        id: "visa",
        name: "Visa",
        port: 6016,
        status: "online",
        icon: <Shield className="w-4 h-4" />,
        description: "Processamento de vistos",
        metrics: [
          { label: "Aplicações", value: "89", unit: "" },
          { label: "Aprovados", value: "76", unit: "" },
          { label: "Pendentes", value: "13", unit: "" }
        ]
      },
      {
        id: "marketing",
        name: "Marketing",
        port: 6017,
        status: "online",
        icon: <TrendingUp className="w-4 h-4" />,
        description: "Campanhas e email marketing",
        metrics: [
          { label: "Campanhas", value: "12", unit: "" },
          { label: "Taxa de Abertura", value: "24.5%", unit: "" },
          { label: "CTR", value: "3.2%", unit: "" }
        ]
      },
      {
        id: "subscriptions",
        name: "Assinaturas",
        port: 6018,
        status: "online",
        icon: <Calendar className="w-4 h-4" />,
        description: "Assinaturas e planos",
        metrics: [
          { label: "Ativos", value: "234", unit: "" },
          { label: "Receita", value: "R$ 15k", unit: "" },
          { label: "Cancelamentos", value: "2.1%", unit: "" }
        ]
      },
      {
        id: "seo",
        name: "SEO",
        port: 5019,
        status: "online",
        icon: <Search className="w-4 h-4" />,
        description: "Otimização SEO",
        metrics: [
          { label: "Palavras-chave", value: "1.2k", unit: "" },
          { label: "Rankings", value: "89", unit: "" },
          { label: "Tráfego", value: "+15%", unit: "" }
        ]
      },
      {
        id: "multilingual",
        name: "Multilíngue",
        port: 6020,
        status: "online",
        icon: <Globe className="w-4 h-4" />,
        description: "Tradução e i18n",
        metrics: [
          { label: "Idiomas", value: "5", unit: "" },
          { label: "Traduções", value: "2.3k", unit: "" },
          { label: "Cobertura", value: "95%", unit: "" }
        ]
      },
      {
        id: "videos",
        name: "Vídeos",
        port: 6021,
        status: "online",
        icon: <Video className="w-4 h-4" />,
        description: "Processamento de vídeos",
        metrics: [
          { label: "Vídeos", value: "156", unit: "" },
          { label: "Visualizações", value: "12k", unit: "" },
          { label: "Duração", value: "45h", unit: "" }
        ]
      },
      {
        id: "photos",
        name: "Fotos",
        port: 6022,
        status: "online",
        icon: <Camera className="w-4 h-4" />,
        description: "Galeria e upload",
        metrics: [
          { label: "Fotos", value: "2.3k", unit: "" },
          { label: "Armazenamento", value: "45GB", unit: "" },
          { label: "Downloads", value: "1.2k", unit: "" }
        ]
      }
    ]
  },
  {
    id: "management",
    name: "Sistemas de Gestão",
    icon: <BarChart3 className="w-5 h-5" />,
    color: "text-orange-600",
    services: [
      {
        id: "admin",
        name: "Painel Admin",
        port: 5023,
        status: "online",
        icon: <Settings className="w-4 h-4" />,
        description: "Painel administrativo",
        metrics: [
          { label: "Usuários", value: "45", unit: "" },
          { label: "Sessões", value: "23", unit: "" },
          { label: "Ações", value: "156", unit: "" }
        ]
      },
      {
        id: "analytics",
        name: "Analytics",
        port: 6024,
        status: "online",
        icon: <BarChart3 className="w-4 h-4" />,
        description: "Analytics e métricas",
        metrics: [
          { label: "Relatórios", value: "12", unit: "" },
          { label: "Pontos de Dados", value: "45k", unit: "" },
          { label: "Precisão", value: "99.8%", unit: "" }
        ]
      },
      {
        id: "reports",
        name: "Relatórios",
        port: 6025,
        status: "online",
        icon: <FileText className="w-4 h-4" />,
        description: "Relatórios e exportação",
        metrics: [
          { label: "Gerados", value: "89", unit: "" },
          { label: "Exportações", value: "234", unit: "" },
          { label: "Tamanho", value: "2.3GB", unit: "" }
        ]
      },
      {
        id: "data",
        name: "Gestão de Dados",
        port: 5026,
        status: "online",
        icon: <Database className="w-4 h-4" />,
        description: "Gestão de dados",
        metrics: [
          { label: "Registros", value: "1.2M", unit: "" },
          { label: "Backups", value: "12", unit: "" },
          { label: "Integridade", value: "100%", unit: "" }
        ]
      }
    ]
  },
  {
    id: "communication",
    name: "Serviços de Comunicação",
    icon: <Bell className="w-5 h-5" />,
    color: "text-pink-600",
    services: [
      {
        id: "notifications",
        name: "Notificações",
        port: 6027,
        status: "online",
        icon: <Bell className="w-4 h-4" />,
        description: "Notificações push e email",
        metrics: [
          { label: "Enviadas", value: "1.2k", unit: "" },
          { label: "Entregues", value: "98.5%", unit: "" },
          { label: "Abertas", value: "24.3%", unit: "" }
        ]
      },
      {
        id: "reviews",
        name: "Avaliações",
        port: 5028,
        status: "online",
        icon: <Star className="w-4 h-4" />,
        description: "Avaliações e comentários",
        metrics: [
          { label: "Avaliações", value: "456", unit: "" },
          { label: "Nota", value: "4.7", unit: "/5" },
          { label: "Resposta", value: "89%", unit: "" }
        ]
      },
      {
        id: "rewards",
        name: "Recompensas",
        port: 6029,
        status: "online",
        icon: <Award className="w-4 h-4" />,
        description: "Sistema de recompensas",
        metrics: [
          { label: "Pontos", value: "12k", unit: "" },
          { label: "Resgatados", value: "2.3k", unit: "" },
          { label: "Valor", value: "R$ 8.9k", unit: "" }
        ]
      },
      {
        id: "loyalty",
        name: "Fidelidade",
        port: 6030,
        status: "online",
        icon: <Heart className="w-4 h-4" />,
        description: "Programa de fidelidade",
        metrics: [
          { label: "Membros", value: "1.2k", unit: "" },
          { label: "Nível", value: "Ouro", unit: "" },
          { label: "Retenção", value: "87%", unit: "" }
        ]
      },
      {
        id: "sales",
        name: "Vendas",
        port: 6031,
        status: "online",
        icon: <TrendingUp className="w-4 h-4" />,
        description: "Gestão de vendas",
        metrics: [
          { label: "Leads", value: "234", unit: "" },
          { label: "Convertidos", value: "45", unit: "" },
          { label: "Receita", value: "R$ 67k", unit: "" }
        ]
      },
      {
        id: "sectoral-finance",
        name: "Finanças Setoriais",
        port: 5032,
        status: "online",
        icon: <DollarSign className="w-4 h-4" />,
        description: "Finanças setoriais",
        metrics: [
          { label: "Setores", value: "8", unit: "" },
          { label: "Orçamento", value: "R$ 450k", unit: "" },
          { label: "Gasto", value: "R$ 234k", unit: "" }
        ]
      },
      {
        id: "refunds",
        name: "Reembolsos",
        port: 6007,
        status: "online",
        icon: <RotateCcw className="w-4 h-4" />,
        description: "Sistema de reembolsos",
        metrics: [
          { label: "Solicitações", value: "23", unit: "" },
          { label: "Processados", value: "18", unit: "" },
          { label: "Valor", value: "R$ 12k", unit: "" }
        ]
      }
    ]
  },
  {
    id: "inventory",
    name: "Estoque e Logística",
    icon: <Package2 className="w-5 h-5" />,
    color: "text-indigo-600",
    services: [
      {
        id: "inventory",
        name: "Estoque",
        port: 6026,
        status: "online",
        icon: <Package2 className="w-4 h-4" />,
        description: "Controle de estoque",
        metrics: [
          { label: "Itens", value: "1.2k", unit: "" },
          { label: "Disponível", value: "89%", unit: "" },
          { label: "Valor", value: "R$ 234k", unit: "" }
        ]
      }
    ]
  }
];

const ResponsiveSidebar: React.FC<ResponsiveSidebarProps> = ({
  className,
  onServiceSelect,
  onToggle
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["core"]);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  // Auto-close on mobile when service is selected
  useEffect(() => {
    if (selectedService && window.innerWidth < 768) {
      setIsOpen(false);
    }
  }, [selectedService]);

  // Notify parent of toggle state
  useEffect(() => {
    onToggle?.(isOpen);
  }, [isOpen, onToggle]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleServiceSelect = (service: ServiceItem) => {
    setSelectedService(service.id);
    onServiceSelect?.(service);
  };

  const filteredCategories = serviceCategories.map(category => ({
    ...category,
    services: category.services.filter(service =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.services.length > 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "text-green-500";
      case "offline": return "text-red-500";
      case "maintenance": return "text-yellow-500";
      case "warning": return "text-orange-500";
      default: return "text-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online": return <CheckCircle2 className="w-3 h-3" />;
      case "offline": return <WifiOff className="w-3 h-3" />;
      case "maintenance": return <Settings className="w-3 h-3" />;
      case "warning": return <AlertCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "fixed top-4 left-4 z-50 md:hidden",
          "bg-white shadow-lg border-2 border-blue-200",
          "hover:bg-blue-50 hover:border-blue-300"
        )}
        onClick={toggleSidebar}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isOpen ? 0 : "-100%",
          width: isOpen ? "320px" : "0px"
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30
        }}
        className={cn(
          "fixed left-0 top-0 h-full z-50",
          "bg-white border-r border-gray-200 shadow-xl",
          "flex flex-col",
          "md:relative md:translate-x-0 md:shadow-none",
          className
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-xl text-gray-800">RSV 360</h1>
                <p className="text-sm text-gray-500">Ecosystem Dashboard</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar serviços..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <nav className="p-4 space-y-2">
            {filteredCategories.map((category) => (
              <div key={category.id} className="space-y-1">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-between p-3 h-auto",
                    "hover:bg-gray-50"
                  )}
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("p-1.5 rounded-lg bg-gray-100", category.color)}>
                      {category.icon}
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-800">{category.name}</div>
                      <div className="text-xs text-gray-500">
                        {category.services.length} serviços
                      </div>
                    </div>
                  </div>
                  {expandedCategories.includes(category.id) ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </Button>

                <AnimatePresence>
                  {expandedCategories.includes(category.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="ml-4 space-y-1 border-l-2 border-gray-100 pl-4">
                        {category.services.map((service) => (
                          <motion.div
                            key={service.id}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                          >
                            <Button
                              variant="ghost"
                              className={cn(
                                "w-full justify-start p-3 h-auto",
                                "hover:bg-gray-50",
                                selectedService === service.id && "bg-blue-50 border-blue-200"
                              )}
                              onClick={() => handleServiceSelect(service)}
                            >
                              <div className="flex items-center gap-3 w-full">
                                <div className="p-1.5 rounded-lg bg-gray-100">
                                  {service.icon}
                                </div>
                                <div className="flex-1 text-left">
                                  <div className="font-medium text-gray-800 text-sm">
                                    {service.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Porta {service.port}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="secondary"
                                    className={cn(
                                      "text-xs",
                                      getStatusColor(service.status)
                                    )}
                                  >
                                    {getStatusIcon(service.status)}
                                  </Badge>
                                </div>
                              </div>
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Sistema Online</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {serviceCategories.reduce((acc, cat) => acc + cat.services.length, 0)} serviços ativos
            </p>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export { ResponsiveSidebar };
