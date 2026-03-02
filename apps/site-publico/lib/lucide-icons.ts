/**
 * ✅ BARREL FILE PARA LUCIDE-REACT
 * 
 * Centraliza todos os imports de ícones do lucide-react
 * para evitar code splitting problemático.
 * 
 * USO:
 *   import { Star, ArrowLeft } from '@/lib/lucide-icons'
 * 
 * Em vez de:
 *   import { Star, ArrowLeft } from 'lucide-react'
 */

// Exportar todos os ícones usados no projeto de forma estática
export {
  // Navegação
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  
  // Ações
  Search,
  Filter,
  Download,
  Upload,
  Edit,
  Trash,
  Save,
  X,
  Check,
  Plus,
  Minus,
  
  // Status
  Star,
  CheckCircle,
  CheckCircle2, // Adicionado para SplitPayment e TripInvitation
  AlertCircle,
  XCircle,
  Info,
  AlertTriangle,
  
  // UI
  Grid,
  List,
  Menu,
  Settings,
  User,
  Users,
  Bell,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Cloud, // Adicionado para SmartPricingDashboard
  Coins, // Adicionado para Fidelidade
  ArrowUp, // Adicionado para Fidelidade
  ArrowDown, // Adicionado para Fidelidade
  Smile, // Adicionado para EnhancedGroupChatUI
  Pin, // Adicionado para EnhancedGroupChatUI
  Edit2, // Adicionado para WishlistManager
  
  // Específicos
  CreditCard,
  QrCode,
  FileText,
  Lock,
  RefreshCw,
  Shield,
  Award,
  Database, // Adicionado para CMS
  
  // Outros ícones comuns
  Home,
  LogOut,
  LogIn,
  Eye,
  EyeOff,
  Heart,
  Share,
  Share2,
  Copy,
  ExternalLink,
  
  // Ícones adicionais usados no projeto
  MessageSquare,
  Send,
  MoreVertical,
  Reply,
  Image,
  Paperclip,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  UserPlus,
  Globe,
  Trophy,
  Target,
  Camera,
  Waves,
  Utensils,
  Car,
  Wifi,
  MessageCircle,
  Tag,
  BarChart3,
  Activity,
  Sparkles,
  
  // Ícones específicos para componentes admin
  Ticket,
  Trash2,
  Percent,
  Video,
  Play,
  
  // Ícones para HotelManagement
  Hotel,
  
  // Ícones para PromotionManagement
  Gift,
  
  // Ícones para AttractionManagement
  Navigation,
  
  // Ícones para RichTextEditor
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  ListOrdered,
  Link,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  
  // Ícones adicionais
  Dumbbell,
  
  // Ícones para ImageUpload
  RotateCcw,
  
  // Ícones para SiteManagement
  Layout,
  Layers,
  GripVertical,
  History,
  
  // Ícones para mapas
  ZoomIn,
  ZoomOut,
  Maximize2, // Para botão de tela cheia (usado em map-controls, responsive-hotel-map, chat-agent, hotel-photo-gallery)
  Minimize2, // Para botão de sair da tela cheia (usado em map-controls, responsive-hotel-map, chat-agent)
  
  // Ícones adicionais para chat-agent
  Baby, // Usado em chat-agent
} from 'lucide-react';

// Re-exportar Image como ImageIcon para evitar conflito com HTML Image
export { Image as ImageIcon } from 'lucide-react';

// Re-exportar Calendar como CalendarIcon para evitar conflito com componente Calendar
export { Calendar as CalendarIcon } from 'lucide-react';

