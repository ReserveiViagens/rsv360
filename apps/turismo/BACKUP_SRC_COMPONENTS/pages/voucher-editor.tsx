import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Upload, 
  Download, 
  Save, 
  Eye,
  Palette,
  Type,
  Image,
  Settings,
  Trash2,
  Copy,
  QrCode,
  FileText,
  Calendar,
  MapPin,
  User,
  Building,
  DollarSign,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Home,
  Plus,
  Edit,
  EyeOff,
  RefreshCw,
  Star,
  Award,
  Gift,
  Camera,
  Palette as PaletteIcon,
  Type as TypeIcon,
  Image as ImageIcon,
  Settings as SettingsIcon,
  Link,
  FileText as FileTextIcon,
  Shield,
  AlertCircle,
  Info,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Layout,
  Layers,
  Grid,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  Maximize2,
  Minimize2,
  Move,
  RotateCw,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Lock,
  Unlock,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  Copy as CopyIcon,
  Scissors,
  Crop,
  Filter,
  Sliders,
  ToggleLeft,
  ToggleRight,
  CheckSquare,
  Square,
  Circle,
  Hexagon,
  Triangle,
  Heart,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  MessageSquare,
  Phone,
  Mail,
  Globe,
  Map,
  Navigation,
  Compass,
  Target,
  Crosshair,
  Zap,
  Battery,
  Wifi,
  Signal,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  Smartphone,
  Tablet,
  Watch,
  Headphones,
  Speaker,
  Radio,
  Tv,
  Projector,
  Printer,
  Keyboard,
  Mouse,
  HardDrive,
  Database,
  Server,
  Cloud,
  CloudOff,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Sun,
  Moon,
  Cloudy,
  Umbrella,
  Droplets,
  Thermometer,
  Wind,
  Snowflake,
  Sunrise,
  Sunset,
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart,
  BarChart2,
  BarChart3,
  PieChart,
  LineChart,
  AreaChart,
  Gauge,
  Timer,
  Clock,
  Calendar as CalendarIcon,
  CalendarDays,
  CalendarCheck,
  CalendarX,
  CalendarMinus,
  CalendarPlus,
  CalendarRange,
  CalendarOff
} from 'lucide-react';
import NavigationButtons from '../components/NavigationButtons';
import QRCode from 'qrcode';

interface VoucherHeader {
  logo: string;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyWebsite: string;
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  fontFamily: string;
  alignment: 'left' | 'center' | 'right';
  showLogo: boolean;
  showCompanyInfo: boolean;
  customText: string;
  links: HeaderLink[];
}

interface HeaderLink {
  id: string;
  text: string;
  url: string;
  type: 'contract' | 'terms' | 'privacy' | 'support' | 'custom';
  icon: string;
  color: string;
  fontSize: number;
  isActive: boolean;
}

interface VoucherBody {
  title: string;
  subtitle: string;
  clientInfo: ClientInfo;
  reservationInfo: ReservationInfo;
  benefits: Benefit[];
  observations: string;
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  fontFamily: string;
  layout: 'vertical' | 'horizontal' | 'grid' | 'custom';
  spacing: number;
  padding: number;
  borderStyle: 'none' | 'solid' | 'dashed' | 'dotted';
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  shadow: boolean;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
}

interface ClientInfo {
  name: string;
  email: string;
  phone: string;
  document: string;
  address: string;
  showEmail: boolean;
  showPhone: boolean;
  showDocument: boolean;
  showAddress: boolean;
}

interface ReservationInfo {
  code: string;
  destination: string;
  startDate: string;
  endDate: string;
  value: number;
  currency: string;
  agency: string;
  agent: string;
  status: 'active' | 'used' | 'expired' | 'cancelled' | 'pending';
  validity: string;
  showCode: boolean;
  showDestination: boolean;
  showDates: boolean;
  showValue: boolean;
  showAgency: boolean;
  showAgent: boolean;
  showStatus: boolean;
  showValidity: boolean;
}

interface Benefit {
  id: string;
  text: string;
  icon: string;
  color: string;
  isActive: boolean;
}

interface VoucherFooter {
  termsAndConditions: FooterLink[];
  contactInfo: ContactInfo;
  socialMedia: SocialMedia[];
  customText: string;
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  fontFamily: string;
  alignment: 'left' | 'center' | 'right';
  showTerms: boolean;
  showContact: boolean;
  showSocial: boolean;
  showCustomText: boolean;
  borderTop: boolean;
  borderTopColor: string;
  borderTopWidth: number;
  borderTopStyle: 'solid' | 'dashed' | 'dotted';
}

interface FooterLink {
  id: string;
  text: string;
  url: string;
  type: 'terms' | 'conditions' | 'privacy' | 'cancellation' | 'refund' | 'support' | 'custom';
  icon: string;
  color: string;
  fontSize: number;
  isActive: boolean;
}

interface ContactInfo {
  phone: string;
  email: string;
  website: string;
  address: string;
  showPhone: boolean;
  showEmail: boolean;
  showWebsite: boolean;
  showAddress: boolean;
}

interface SocialMedia {
  id: string;
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'youtube' | 'whatsapp' | 'telegram';
  url: string;
  icon: string;
  color: string;
  isActive: boolean;
}

interface VoucherTemplate {
  id: string;
  name: string;
  header: VoucherHeader;
  body: VoucherBody;
  footer: VoucherFooter;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  fontFamily: string;
  fontSize: string;
  layout: 'modern' | 'classic' | 'premium' | 'minimal';
  elements: VoucherElement[];
}

interface VoucherElement {
  id: string;
  type: 'text' | 'image' | 'logo' | 'qr-code' | 'barcode' | 'stamp' | 'watermark' | 'link' | 'button';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  fontColor?: string;
  fontFamily?: string;
  rotation?: number;
  opacity?: number;
  url?: string;
  target?: '_blank' | '_self';
  style?: 'primary' | 'secondary' | 'outline' | 'ghost';
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderRadius?: number;
  padding?: number;
  margin?: number;
}

interface VoucherData {
  id: string;
  code: string;
  clientName: string;
  destination: string;
  startDate: string;
  endDate: string;
  value: number;
  agency: string;
  agent: string;
  benefits: string[];
  validity: string;
  observations: string;
  template: VoucherTemplate;
}

export default function VoucherEditor() {
  const [voucherData, setVoucherData] = useState<VoucherData | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<VoucherTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showLogoUpload, setShowLogoUpload] = useState(false);
  const [selectedElement, setSelectedElement] = useState<VoucherElement | null>(null);
  const [editMode, setEditMode] = useState<'create' | 'edit'>('create');
  
  // Estados para seções específicas
  const [activeSection, setActiveSection] = useState<'header' | 'body' | 'footer' | 'elements'>('header');
  const [showHeaderEditor, setShowHeaderEditor] = useState(false);
  const [showBodyEditor, setShowBodyEditor] = useState(false);
  const [showFooterEditor, setShowFooterEditor] = useState(false);
  const [showLinksEditor, setShowLinksEditor] = useState(false);
  
  // Estados para QR Code
  const [qrCodeData, setQrCodeData] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showQrCodeModal, setShowQrCodeModal] = useState(false);
  const [qrCodeSize, setQrCodeSize] = useState(200);
  const [qrCodeColor, setQrCodeColor] = useState('#000000');
  const [qrCodeBgColor, setQrCodeBgColor] = useState('#FFFFFF');
  const [qrCodeErrorLevel, setQrCodeErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  
  // Estados para Header
  const [headerData, setHeaderData] = useState<VoucherHeader>({
    logo: '',
    companyName: 'Reservei Viagens',
    companyAddress: 'Rua das Viagens, 123 - Centro',
    companyPhone: '(11) 99999-9999',
    companyEmail: 'contato@reserveiviagens.com',
    companyWebsite: 'www.reserveiviagens.com',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    fontSize: 14,
    fontFamily: 'Poppins',
    alignment: 'center',
    showLogo: true,
    showCompanyInfo: true,
    customText: '',
    links: [
      {
        id: '1',
        text: 'Contrato',
        url: '/contrato',
        type: 'contract',
        icon: 'FileText',
        color: '#2563eb',
        fontSize: 12,
        isActive: true
      },
      {
        id: '2',
        text: 'Termos e Condições',
        url: '/termos',
        type: 'terms',
        icon: 'Shield',
        color: '#059669',
        fontSize: 12,
        isActive: true
      },
      {
        id: '3',
        text: 'Política de Privacidade',
        url: '/privacidade',
        type: 'privacy',
        icon: 'Lock',
        color: '#7c3aed',
        fontSize: 12,
        isActive: true
      }
    ]
  });

  // Estados para Body
  const [bodyData, setBodyData] = useState<VoucherBody>({
    title: 'Voucher de Reserva',
    subtitle: 'Confirmação de Reserva',
    clientInfo: {
      name: '',
      email: '',
      phone: '',
      document: '',
      address: '',
      showEmail: true,
      showPhone: true,
      showDocument: true,
      showAddress: true
    },
    reservationInfo: {
      code: '',
      destination: '',
      startDate: '',
      endDate: '',
      value: 0,
      currency: 'BRL',
      agency: '',
      agent: '',
      status: 'active',
      validity: '',
      showCode: true,
      showDestination: true,
      showDates: true,
      showValue: true,
      showAgency: true,
      showAgent: true,
      showStatus: true,
      showValidity: true
    },
    benefits: [
      {
        id: '1',
        text: 'Wi-Fi gratuito',
        icon: 'Wifi',
        color: '#059669',
        isActive: true
      },
      {
        id: '2',
        text: 'Café da manhã',
        icon: 'Coffee',
        color: '#d97706',
        isActive: true
      },
      {
        id: '3',
        text: 'Transfer aeroporto',
        icon: 'Car',
        color: '#2563eb',
        isActive: true
      }
    ],
    observations: '',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    fontSize: 14,
    fontFamily: 'Poppins',
    layout: 'vertical',
    spacing: 16,
    padding: 20,
    borderStyle: 'solid',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 8,
    shadow: true,
    shadowColor: '#000000',
    shadowBlur: 10,
    shadowOffsetX: 0,
    shadowOffsetY: 4
  });

  // Estados para Footer
  const [footerData, setFooterData] = useState<VoucherFooter>({
    termsAndConditions: [
      {
        id: '1',
        text: 'Termos e Condições',
        url: '/termos-condicoes',
        type: 'terms',
        icon: 'FileText',
        color: '#059669',
        fontSize: 12,
        isActive: true
      },
      {
        id: '2',
        text: 'Política de Cancelamento',
        url: '/cancelamento',
        type: 'cancellation',
        icon: 'XCircle',
        color: '#dc2626',
        fontSize: 12,
        isActive: true
      },
      {
        id: '3',
        text: 'Política de Reembolso',
        url: '/reembolso',
        type: 'refund',
        icon: 'DollarSign',
        color: '#059669',
        fontSize: 12,
        isActive: true
      },
      {
        id: '4',
        text: 'Suporte ao Cliente',
        url: '/suporte',
        type: 'support',
        icon: 'MessageCircle',
        color: '#2563eb',
        fontSize: 12,
        isActive: true
      }
    ],
    contactInfo: {
      phone: '(11) 99999-9999',
      email: 'suporte@reserveiviagens.com',
      website: 'www.reserveiviagens.com',
      address: 'Rua das Viagens, 123 - Centro, São Paulo - SP',
      showPhone: true,
      showEmail: true,
      showWebsite: true,
      showAddress: true
    },
    socialMedia: [
      {
        id: '1',
        platform: 'whatsapp',
        url: 'https://wa.me/5511999999999',
        icon: 'MessageCircle',
        color: '#25d366',
        isActive: true
      },
      {
        id: '2',
        platform: 'instagram',
        url: 'https://instagram.com/reserveiviagens',
        icon: 'Camera',
        color: '#e4405f',
        isActive: true
      },
      {
        id: '3',
        platform: 'facebook',
        url: 'https://facebook.com/reserveiviagens',
        icon: 'MessageSquare',
        color: '#1877f2',
        isActive: true
      }
    ],
    customText: 'Obrigado por escolher a Reservei Viagens!',
    backgroundColor: '#f8fafc',
    textColor: '#64748b',
    fontSize: 12,
    fontFamily: 'Poppins',
    alignment: 'center',
    showTerms: true,
    showContact: true,
    showSocial: true,
    showCustomText: true,
    borderTop: true,
    borderTopColor: '#e2e8f0',
    borderTopWidth: 1,
    borderTopStyle: 'solid'
  });

  // Funções para Header
  const handleHeaderUpdate = (updates: Partial<VoucherHeader>) => {
    setHeaderData(prev => ({ ...prev, ...updates }));
  };

  const handleHeaderLinkAdd = () => {
    const newLink: HeaderLink = {
      id: Date.now().toString(),
      text: 'Novo Link',
      url: '/novo-link',
      type: 'custom',
      icon: 'Link',
      color: '#6b7280',
      fontSize: 12,
      isActive: true
    };
    setHeaderData(prev => ({
      ...prev,
      links: [...prev.links, newLink]
    }));
  };

  const handleHeaderLinkUpdate = (linkId: string, updates: Partial<HeaderLink>) => {
    setHeaderData(prev => ({
      ...prev,
      links: prev.links.map(link => 
        link.id === linkId ? { ...link, ...updates } : link
      )
    }));
  };

  const handleHeaderLinkDelete = (linkId: string) => {
    setHeaderData(prev => ({
      ...prev,
      links: prev.links.filter(link => link.id !== linkId)
    }));
  };

  // Funções para Body
  const handleBodyUpdate = (updates: Partial<VoucherBody>) => {
    setBodyData(prev => ({ ...prev, ...updates }));
  };

  const handleClientInfoUpdate = (updates: Partial<ClientInfo>) => {
    setBodyData(prev => ({
      ...prev,
      clientInfo: { ...prev.clientInfo, ...updates }
    }));
  };

  const handleReservationInfoUpdate = (updates: Partial<ReservationInfo>) => {
    setBodyData(prev => ({
      ...prev,
      reservationInfo: { ...prev.reservationInfo, ...updates }
    }));
  };

  const handleBenefitAdd = () => {
    const newBenefit: Benefit = {
      id: Date.now().toString(),
      text: 'Novo Benefício',
      icon: 'Star',
      color: '#f59e0b',
      isActive: true
    };
    setBodyData(prev => ({
      ...prev,
      benefits: [...prev.benefits, newBenefit]
    }));
  };

  const handleBenefitUpdate = (benefitId: string, updates: Partial<Benefit>) => {
    setBodyData(prev => ({
      ...prev,
      benefits: prev.benefits.map(benefit => 
        benefit.id === benefitId ? { ...benefit, ...updates } : benefit
      )
    }));
  };

  const handleBenefitDelete = (benefitId: string) => {
    setBodyData(prev => ({
      ...prev,
      benefits: prev.benefits.filter(benefit => benefit.id !== benefitId)
    }));
  };

  // Funções para Footer
  const handleFooterUpdate = (updates: Partial<VoucherFooter>) => {
    setFooterData(prev => ({ ...prev, ...updates }));
  };

  const handleFooterLinkAdd = () => {
    const newLink: FooterLink = {
      id: Date.now().toString(),
      text: 'Novo Link',
      url: '/novo-link',
      type: 'custom',
      icon: 'Link',
      color: '#6b7280',
      fontSize: 12,
      isActive: true
    };
    setFooterData(prev => ({
      ...prev,
      termsAndConditions: [...prev.termsAndConditions, newLink]
    }));
  };

  const handleFooterLinkUpdate = (linkId: string, updates: Partial<FooterLink>) => {
    setFooterData(prev => ({
      ...prev,
      termsAndConditions: prev.termsAndConditions.map(link => 
        link.id === linkId ? { ...link, ...updates } : link
      )
    }));
  };

  const handleFooterLinkDelete = (linkId: string) => {
    setFooterData(prev => ({
      ...prev,
      termsAndConditions: prev.termsAndConditions.filter(link => link.id !== linkId)
    }));
  };

  const handleContactInfoUpdate = (updates: Partial<ContactInfo>) => {
    setFooterData(prev => ({
      ...prev,
      contactInfo: { ...prev.contactInfo, ...updates }
    }));
  };

  const handleSocialMediaAdd = () => {
    const newSocial: SocialMedia = {
      id: Date.now().toString(),
      platform: 'whatsapp',
      url: 'https://wa.me/5511999999999',
      icon: 'MessageCircle',
      color: '#25d366',
      isActive: true
    };
    setFooterData(prev => ({
      ...prev,
      socialMedia: [...prev.socialMedia, newSocial]
    }));
  };

  const handleSocialMediaUpdate = (socialId: string, updates: Partial<SocialMedia>) => {
    setFooterData(prev => ({
      ...prev,
      socialMedia: prev.socialMedia.map(social => 
        social.id === socialId ? { ...social, ...updates } : social
      )
    }));
  };

  const handleSocialMediaDelete = (socialId: string) => {
    setFooterData(prev => ({
      ...prev,
      socialMedia: prev.socialMedia.filter(social => social.id !== socialId)
    }));
  };

  // Funções para QR Code
  const generateQRCode = async (data: string) => {
    try {
      const options = {
        errorCorrectionLevel: qrCodeErrorLevel,
        type: 'image/png' as const,
        quality: 0.92,
        margin: 1,
        color: {
          dark: qrCodeColor,
          light: qrCodeBgColor
        },
        width: qrCodeSize
      };

      const url = await QRCode.toDataURL(data, options);
      setQrCodeUrl(url);
      return url;
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      alert('Erro ao gerar QR Code. Tente novamente.');
      return null;
    }
  };

  const handleGenerateQRCode = async () => {
    if (!qrCodeData.trim()) {
      alert('Por favor, insira dados para gerar o QR Code.');
      return;
    }

    const url = await generateQRCode(qrCodeData);
    if (url) {
      setShowQrCodeModal(true);
    }
  };

  const handleDownloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = 'voucher-qrcode.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleCopyQRCode = () => {
    if (qrCodeUrl) {
      navigator.clipboard.writeText(qrCodeData).then(() => {
        alert('Dados do QR Code copiados para a área de transferência!');
      }).catch(() => {
        alert('Erro ao copiar dados do QR Code.');
      });
    }
  };

  const handleAddQRCodeToVoucher = () => {
    if (qrCodeUrl && selectedTemplate) {
      const newElement: VoucherElement = {
        id: Date.now().toString(),
        type: 'qr-code',
        content: qrCodeData,
        x: 50,
        y: 50,
        width: qrCodeSize,
        height: qrCodeSize,
        url: qrCodeUrl
      };

      const updatedElements = [...selectedTemplate.elements, newElement];
      setSelectedTemplate({
        ...selectedTemplate,
        elements: updatedElements
      });

      setShowQrCodeModal(false);
      alert('QR Code adicionado ao voucher!');
    }
  };

  // Templates pré-definidos
  const defaultTemplates: VoucherTemplate[] = [
    {
      id: '1',
      name: 'Template Clássico',
      header: {
        logo: '/logos/classic-logo.png',
        companyName: 'Empresa A',
        companyAddress: 'Rua Principal, 123',
        companyPhone: '(11) 1234-5678',
        companyEmail: 'info@empresa.com',
        companyWebsite: 'www.empresa.com',
        backgroundColor: '#ffffff',
        textColor: '#000000',
        fontSize: 14,
        fontFamily: 'Arial, sans-serif',
        alignment: 'left',
        showLogo: true,
        showCompanyInfo: true,
        customText: '',
        links: [
          { id: '1', text: 'Contrato', url: '#', type: 'contract', icon: '📄', color: '#1e40af', fontSize: 12, isActive: true },
          { id: '2', text: 'Termos', url: '#', type: 'terms', icon: '📜', color: '#1e40af', fontSize: 12, isActive: true },
          { id: '3', text: 'Privacidade', url: '#', type: 'privacy', icon: '🔒', color: '#1e40af', fontSize: 12, isActive: true },
          { id: '4', text: 'Suporte', url: '#', type: 'support', icon: '💬', color: '#1e40af', fontSize: 12, isActive: true }
        ]
      },
      body: {
        title: 'VOUCHER DE VIAGEM',
        subtitle: 'Seu voucher de viagem único',
        clientInfo: {
          name: 'Nome do Cliente',
          email: 'email@cliente.com',
          phone: '(11) 98765-4321',
          document: '123.456.789-00',
          address: 'Endereço do Cliente',
          showEmail: true,
          showPhone: true,
          showDocument: true,
          showAddress: true
        },
        reservationInfo: {
          code: 'VCH-2025-001',
          destination: 'Destino da Viagem',
          startDate: '2025-01-01',
          endDate: '2025-01-10',
          value: 1500.00,
          currency: 'R$',
          agency: 'Agência RSV',
          agent: 'Agente RSV',
          status: 'active',
          validity: '30 dias',
          showCode: true,
          showDestination: true,
          showDates: true,
          showValue: true,
          showAgency: true,
          showAgent: true,
          showStatus: true,
          showValidity: true
        },
        benefits: [
          { id: '1', text: 'Passagem aérea', icon: '✈️', color: '#1e40af', isActive: true },
          { id: '2', text: 'Hotel 4 estrelas', icon: '🏨', color: '#1e40af', isActive: true },
          { id: '3', text: 'Alimentação', icon: '🍽️', color: '#1e40af', isActive: true }
        ],
        observations: 'Observações do voucher',
        backgroundColor: '#f8fafc',
        textColor: '#1e293b',
        fontSize: 16,
        fontFamily: 'Inter, sans-serif',
        layout: 'vertical',
        spacing: 10,
        padding: 20,
        borderStyle: 'none',
        borderColor: '#3b82f6',
        borderWidth: 2,
        borderRadius: 8,
        shadow: true,
        shadowColor: '#cbd5e1',
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowOffsetY: 5
      },
      footer: {
        termsAndConditions: [
          { id: '1', text: 'Termos de Uso', url: '#', type: 'terms', icon: '📜', color: '#1e40af', fontSize: 12, isActive: true },
          { id: '2', text: 'Condições de Cancelamento', url: '#', type: 'cancellation', icon: '⚠️', color: '#1e40af', fontSize: 12, isActive: true },
          { id: '3', text: 'Política de Privacidade', url: '#', type: 'privacy', icon: '🔒', color: '#1e40af', fontSize: 12, isActive: true },
          { id: '4', text: 'Política de Reembolso', url: '#', type: 'refund', icon: '💰', color: '#1e40af', fontSize: 12, isActive: true }
        ],
        contactInfo: {
          phone: '(11) 1234-5678',
          email: 'info@empresa.com',
          website: 'www.empresa.com',
          address: 'Endereço da Empresa',
          showPhone: true,
          showEmail: true,
          showWebsite: true,
          showAddress: true
        },
        socialMedia: [
          { id: '1', platform: 'facebook', url: 'https://facebook.com', icon: '👍', color: '#1e40af', isActive: true },
          { id: '2', platform: 'instagram', url: 'https://instagram.com', icon: '👀', color: '#1e40af', isActive: true },
          { id: '3', platform: 'twitter', url: 'https://twitter.com', icon: '🐦', color: '#1e40af', isActive: true }
        ],
        customText: 'Fale conosco para mais informações!',
        backgroundColor: '#f8fafc',
        textColor: '#1e293b',
        fontSize: 14,
        fontFamily: 'Inter, sans-serif',
        alignment: 'center',
        showTerms: true,
        showContact: true,
        showSocial: true,
        showCustomText: true,
        borderTop: true,
        borderTopColor: '#3b82f6',
        borderTopWidth: 1,
        borderTopStyle: 'solid'
      },
      backgroundColor: '#ffffff',
      textColor: '#000000',
      borderColor: '#1e40af',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      layout: 'classic',
      elements: [
        { id: '1', type: 'logo', content: '/logos/classic-logo.png', x: 50, y: 30, width: 120, height: 60 },
        { id: '2', type: 'text', content: 'VOUCHER', x: 200, y: 50, width: 200, height: 30, fontSize: 24, fontColor: '#1e40af', fontFamily: 'Arial, sans-serif' },
        { id: '3', type: 'text', content: 'Código:', x: 50, y: 120, width: 100, height: 20, fontSize: 14, fontColor: '#374151', fontFamily: 'Arial, sans-serif' },
        { id: '4', type: 'text', content: 'Cliente:', x: 50, y: 150, width: 100, height: 20, fontSize: 14, fontColor: '#374151', fontFamily: 'Arial, sans-serif' },
        { id: '5', type: 'text', content: 'Destino:', x: 50, y: 180, width: 100, height: 20, fontSize: 14, fontColor: '#374151', fontFamily: 'Arial, sans-serif' },
        { id: '6', type: 'text', content: 'Valor:', x: 50, y: 210, width: 100, height: 20, fontSize: 14, fontColor: '#374151', fontFamily: 'Arial, sans-serif' },
        { id: '7', type: 'qr-code', content: 'VCH-2025-001', x: 400, y: 120, width: 80, height: 80 },
        { id: '8', type: 'stamp', content: 'VALIDADO', x: 350, y: 250, width: 100, height: 40, fontSize: 12, fontColor: '#059669', fontFamily: 'Arial, sans-serif' }
      ]
    },
    {
      id: '2',
      name: 'Template Moderno',
      header: {
        logo: '/logos/modern-logo.png',
        companyName: 'Empresa B',
        companyAddress: 'Av. Principal, 456',
        companyPhone: '(11) 98765-4321',
        companyEmail: 'contato@empresa.com',
        companyWebsite: 'www.empresa.com',
        backgroundColor: '#f8fafc',
        textColor: '#1e293b',
        fontSize: 16,
        fontFamily: 'Inter, sans-serif',
        alignment: 'left',
        showLogo: true,
        showCompanyInfo: true,
        customText: '',
        links: [
          { id: '1', text: 'Contrato', url: '#', type: 'contract', icon: '📄', color: '#3b82f6', fontSize: 12, isActive: true },
          { id: '2', text: 'Termos', url: '#', type: 'terms', icon: '📜', color: '#3b82f6', fontSize: 12, isActive: true },
          { id: '3', text: 'Privacidade', url: '#', type: 'privacy', icon: '🔒', color: '#3b82f6', fontSize: 12, isActive: true },
          { id: '4', text: 'Suporte', url: '#', type: 'support', icon: '💬', color: '#3b82f6', fontSize: 12, isActive: true }
        ]
      },
      body: {
        title: 'VOUCHER DE VIAGEM',
        subtitle: 'Seu voucher de viagem único',
        clientInfo: {
          name: 'Nome do Cliente',
          email: 'email@cliente.com',
          phone: '(11) 98765-4321',
          document: '123.456.789-00',
          address: 'Endereço do Cliente',
          showEmail: true,
          showPhone: true,
          showDocument: true,
          showAddress: true
        },
        reservationInfo: {
          code: 'VCH-2025-001',
          destination: 'Destino da Viagem',
          startDate: '2025-01-01',
          endDate: '2025-01-10',
          value: 1500.00,
          currency: 'R$',
          agency: 'Agência RSV',
          agent: 'Agente RSV',
          status: 'active',
          validity: '30 dias',
          showCode: true,
          showDestination: true,
          showDates: true,
          showValue: true,
          showAgency: true,
          showAgent: true,
          showStatus: true,
          showValidity: true
        },
        benefits: [
          { id: '1', text: 'Passagem aérea', icon: '✈️', color: '#3b82f6', isActive: true },
          { id: '2', text: 'Hotel 4 estrelas', icon: '🏨', color: '#3b82f6', isActive: true },
          { id: '3', text: 'Alimentação', icon: '🍽️', color: '#3b82f6', isActive: true }
        ],
        observations: 'Observações do voucher',
        backgroundColor: '#f8fafc',
        textColor: '#1e293b',
        fontSize: 16,
        fontFamily: 'Inter, sans-serif',
        layout: 'vertical',
        spacing: 10,
        padding: 20,
        borderStyle: 'none',
        borderColor: '#3b82f6',
        borderWidth: 2,
        borderRadius: 8,
        shadow: true,
        shadowColor: '#cbd5e1',
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowOffsetY: 5
      },
      footer: {
        termsAndConditions: [
          { id: '1', text: 'Termos de Uso', url: '#', type: 'terms', icon: '📜', color: '#3b82f6', fontSize: 12, isActive: true },
          { id: '2', text: 'Condições de Cancelamento', url: '#', type: 'cancellation', icon: '⚠️', color: '#3b82f6', fontSize: 12, isActive: true },
          { id: '3', text: 'Política de Privacidade', url: '#', type: 'privacy', icon: '🔒', color: '#3b82f6', fontSize: 12, isActive: true },
          { id: '4', text: 'Política de Reembolso', url: '#', type: 'refund', icon: '💰', color: '#3b82f6', fontSize: 12, isActive: true }
        ],
        contactInfo: {
          phone: '(11) 98765-4321',
          email: 'contato@empresa.com',
          website: 'www.empresa.com',
          address: 'Av. Principal, 456',
          showPhone: true,
          showEmail: true,
          showWebsite: true,
          showAddress: true
        },
        socialMedia: [
          { id: '1', platform: 'facebook', url: 'https://facebook.com', icon: '👍', color: '#3b82f6', isActive: true },
          { id: '2', platform: 'instagram', url: 'https://instagram.com', icon: '👀', color: '#3b82f6', isActive: true },
          { id: '3', platform: 'twitter', url: 'https://twitter.com', icon: '🐦', color: '#3b82f6', isActive: true }
        ],
        customText: 'Fale conosco para mais informações!',
        backgroundColor: '#f8fafc',
        textColor: '#1e293b',
        fontSize: 14,
        fontFamily: 'Inter, sans-serif',
        alignment: 'center',
        showTerms: true,
        showContact: true,
        showSocial: true,
        showCustomText: true,
        borderTop: true,
        borderTopColor: '#3b82f6',
        borderTopWidth: 1,
        borderTopStyle: 'solid'
      },
      backgroundColor: '#f8fafc',
      textColor: '#1e293b',
      borderColor: '#3b82f6',
      fontFamily: 'Inter, sans-serif',
      fontSize: '16px',
      layout: 'modern',
      elements: [
        { id: '1', type: 'logo', content: '/logos/modern-logo.png', x: 40, y: 40, width: 100, height: 50 },
        { id: '2', type: 'text', content: 'VOUCHER DE VIAGEM', x: 160, y: 60, width: 250, height: 30, fontSize: 20, fontColor: '#3b82f6', fontFamily: 'Inter, sans-serif' },
        { id: '3', type: 'text', content: 'Código:', x: 40, y: 130, width: 80, height: 20, fontSize: 12, fontColor: '#64748b', fontFamily: 'Inter, sans-serif' },
        { id: '4', type: 'text', content: 'Cliente:', x: 40, y: 160, width: 80, height: 20, fontSize: 12, fontColor: '#64748b', fontFamily: 'Inter, sans-serif' },
        { id: '5', type: 'text', content: 'Destino:', x: 40, y: 190, width: 80, height: 20, fontSize: 12, fontColor: '#64748b', fontFamily: 'Inter, sans-serif' },
        { id: '6', type: 'text', content: 'Valor:', x: 40, y: 220, width: 80, height: 20, fontSize: 12, fontColor: '#64748b', fontFamily: 'Inter, sans-serif' },
        { id: '7', type: 'qr-code', content: 'VCH-2025-001', x: 380, y: 130, width: 90, height: 90 },
        { id: '8', type: 'watermark', content: 'ONION RSV 360', x: 200, y: 280, width: 150, height: 20, fontSize: 10, fontColor: '#cbd5e1', fontFamily: 'Inter, sans-serif', opacity: 0.3 }
      ]
    },
    {
      id: '3',
      name: 'Template Premium',
      header: {
        logo: '/logos/premium-logo.png',
        companyName: 'Empresa C',
        companyAddress: 'Rua Secundária, 789',
        companyPhone: '(11) 1122-3344',
        companyEmail: 'suporte@empresa.com',
        companyWebsite: 'www.empresa.com',
        backgroundColor: '#1e293b',
        textColor: '#f8fafc',
        fontSize: 18,
        fontFamily: 'Playfair Display, serif',
        alignment: 'center',
        showLogo: true,
        showCompanyInfo: true,
        customText: '',
        links: [
          { id: '1', text: 'Contrato', url: '#', type: 'contract', icon: '📄', color: '#f59e0b', fontSize: 12, isActive: true },
          { id: '2', text: 'Termos', url: '#', type: 'terms', icon: '📜', color: '#f59e0b', fontSize: 12, isActive: true },
          { id: '3', text: 'Privacidade', url: '#', type: 'privacy', icon: '🔒', color: '#f59e0b', fontSize: 12, isActive: true },
          { id: '4', text: 'Suporte', url: '#', type: 'support', icon: '💬', color: '#f59e0b', fontSize: 12, isActive: true }
        ]
      },
      body: {
        title: 'VOUCHER EXCLUSIVO',
        subtitle: 'Seu voucher de viagem único',
        clientInfo: {
          name: 'Nome do Cliente',
          email: 'email@cliente.com',
          phone: '(11) 1122-3344',
          document: '123.456.789-00',
          address: 'Endereço do Cliente',
          showEmail: true,
          showPhone: true,
          showDocument: true,
          showAddress: true
        },
        reservationInfo: {
          code: 'VCH-2025-001',
          destination: 'Destino da Viagem',
          startDate: '2025-01-01',
          endDate: '2025-01-10',
          value: 1500.00,
          currency: 'R$',
          agency: 'Agência RSV',
          agent: 'Agente RSV',
          status: 'active',
          validity: '30 dias',
          showCode: true,
          showDestination: true,
          showDates: true,
          showValue: true,
          showAgency: true,
          showAgent: true,
          showStatus: true,
          showValidity: true
        },
        benefits: [
          { id: '1', text: 'Passagem aérea', icon: '✈️', color: '#f59e0b', isActive: true },
          { id: '2', text: 'Hotel 4 estrelas', icon: '🏨', color: '#f59e0b', isActive: true },
          { id: '3', text: 'Alimentação', icon: '🍽️', color: '#f59e0b', isActive: true }
        ],
        observations: 'Observações do voucher',
        backgroundColor: '#1e293b',
        textColor: '#f8fafc',
        fontSize: 18,
        fontFamily: 'Playfair Display, serif',
        layout: 'vertical',
        spacing: 10,
        padding: 20,
        borderStyle: 'none',
        borderColor: '#f59e0b',
        borderWidth: 2,
        borderRadius: 8,
        shadow: true,
        shadowColor: '#f59e0b',
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowOffsetY: 5
      },
      footer: {
        termsAndConditions: [
          { id: '1', text: 'Termos de Uso', url: '#', type: 'terms', icon: '📜', color: '#f59e0b', fontSize: 12, isActive: true },
          { id: '2', text: 'Condições de Cancelamento', url: '#', type: 'cancellation', icon: '⚠️', color: '#f59e0b', fontSize: 12, isActive: true },
          { id: '3', text: 'Política de Privacidade', url: '#', type: 'privacy', icon: '🔒', color: '#f59e0b', fontSize: 12, isActive: true },
          { id: '4', text: 'Política de Reembolso', url: '#', type: 'refund', icon: '💰', color: '#f59e0b', fontSize: 12, isActive: true }
        ],
        contactInfo: {
          phone: '(11) 1122-3344',
          email: 'suporte@empresa.com',
          website: 'www.empresa.com',
          address: 'Rua Secundária, 789',
          showPhone: true,
          showEmail: true,
          showWebsite: true,
          showAddress: true
        },
        socialMedia: [
          { id: '1', platform: 'facebook', url: 'https://facebook.com', icon: '👍', color: '#f59e0b', isActive: true },
          { id: '2', platform: 'instagram', url: 'https://instagram.com', icon: '👀', color: '#f59e0b', isActive: true },
          { id: '3', platform: 'twitter', url: 'https://twitter.com', icon: '🐦', color: '#f59e0b', isActive: true }
        ],
        customText: 'Fale conosco para mais informações!',
        backgroundColor: '#1e293b',
        textColor: '#f8fafc',
        fontSize: 14,
        fontFamily: 'Playfair Display, serif',
        alignment: 'center',
        showTerms: true,
        showContact: true,
        showSocial: true,
        showCustomText: true,
        borderTop: true,
        borderTopColor: '#f59e0b',
        borderTopWidth: 1,
        borderTopStyle: 'solid'
      },
      backgroundColor: '#1e293b',
      textColor: '#f8fafc',
      borderColor: '#f59e0b',
      fontFamily: 'Playfair Display, serif',
      fontSize: '18px',
      layout: 'premium',
      elements: [
        { id: '1', type: 'logo', content: '/logos/premium-logo.png', x: 50, y: 50, width: 140, height: 70 },
        { id: '2', type: 'text', content: 'VOUCHER EXCLUSIVO', x: 220, y: 80, width: 280, height: 40, fontSize: 28, fontColor: '#f59e0b', fontFamily: 'Playfair Display, serif' },
        { id: '3', type: 'text', content: 'Código:', x: 60, y: 150, width: 100, height: 25, fontSize: 16, fontColor: '#cbd5e1', fontFamily: 'Playfair Display, serif' },
        { id: '4', type: 'text', content: 'Cliente:', x: 60, y: 185, width: 100, height: 25, fontSize: 16, fontColor: '#cbd5e1', fontFamily: 'Playfair Display, serif' },
        { id: '5', type: 'text', content: 'Destino:', x: 60, y: 220, width: 100, height: 25, fontSize: 16, fontColor: '#cbd5e1', fontFamily: 'Playfair Display, serif' },
        { id: '6', type: 'text', content: 'Valor:', x: 60, y: 255, width: 100, height: 25, fontSize: 16, fontColor: '#cbd5e1', fontFamily: 'Playfair Display, serif' },
        { id: '7', type: 'qr-code', content: 'VCH-2025-001', x: 400, y: 150, width: 100, height: 100 },
        { id: '8', type: 'stamp', content: 'PREMIUM', x: 350, y: 280, width: 120, height: 50, fontSize: 14, fontColor: '#f59e0b', fontFamily: 'Playfair Display, serif' }
      ]
    }
  ];

  useEffect(() => {
    // Carregar template padrão
    setSelectedTemplate(defaultTemplates[0]);
  }, []);

  const handleTemplateSelect = (template: VoucherTemplate) => {
    setSelectedTemplate(template);
    setShowTemplateModal(false);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && selectedTemplate) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoUrl = e.target?.result as string;
        const updatedTemplate = {
          ...selectedTemplate,
          logo: logoUrl,
          elements: selectedTemplate.elements.map(el => 
            el.type === 'logo' ? { ...el, content: logoUrl } : el
          )
        };
        setSelectedTemplate(updatedTemplate);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleElementEdit = (element: VoucherElement) => {
    setSelectedElement(element);
  };

  const handleElementUpdate = (updatedElement: VoucherElement) => {
    if (selectedTemplate) {
      const updatedElements = selectedTemplate.elements.map(el =>
        el.id === updatedElement.id ? updatedElement : el
      );
      setSelectedTemplate({
        ...selectedTemplate,
        elements: updatedElements
      });
    }
    setSelectedElement(null);
  };

  const handleSaveVoucher = () => {
    if (selectedTemplate) {
      // Aqui implementaria a lógica de salvamento
      console.log('Voucher salvo:', selectedTemplate);
      alert('Voucher salvo com sucesso!');
    }
  };

  const handleExportVoucher = () => {
    if (selectedTemplate) {
      // Aqui implementaria a lógica de exportação
      console.log('Exportando voucher:', selectedTemplate);
      alert('Voucher exportado com sucesso!');
    }
  };

  // Componente para editar Header
  const HeaderEditor = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Editor do Cabeçalho</h3>
        <button
          onClick={() => setShowHeaderEditor(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <XCircle className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Informações da Empresa */}
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-4">Informações da Empresa</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Empresa
              </label>
              <input
                type="text"
                value={headerData.companyName}
                onChange={(e) => handleHeaderUpdate({ companyName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Endereço
              </label>
              <input
                type="text"
                value={headerData.companyAddress}
                onChange={(e) => handleHeaderUpdate({ companyAddress: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone
              </label>
              <input
                type="text"
                value={headerData.companyPhone}
                onChange={(e) => handleHeaderUpdate({ companyPhone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={headerData.companyEmail}
                onChange={(e) => handleHeaderUpdate({ companyEmail: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                value={headerData.companyWebsite}
                onChange={(e) => handleHeaderUpdate({ companyWebsite: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Estilo */}
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-4">Estilo</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cor de Fundo
              </label>
              <input
                type="color"
                value={headerData.backgroundColor}
                onChange={(e) => handleHeaderUpdate({ backgroundColor: e.target.value })}
                className="w-full h-10 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cor do Texto
              </label>
              <input
                type="color"
                value={headerData.textColor}
                onChange={(e) => handleHeaderUpdate({ textColor: e.target.value })}
                className="w-full h-10 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tamanho da Fonte
              </label>
              <input
                type="number"
                value={headerData.fontSize}
                onChange={(e) => handleHeaderUpdate({ fontSize: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Links */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-700">Links</h4>
            <button
              onClick={handleHeaderLinkAdd}
              className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar Link
            </button>
          </div>
          <div className="space-y-3">
            {headerData.links.map((link) => (
              <div key={link.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <input
                    type="text"
                    value={link.text}
                    onChange={(e) => handleHeaderLinkUpdate(link.id, { text: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="Texto do link"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => handleHeaderLinkUpdate(link.id, { url: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="URL do link"
                  />
                </div>
                <div className="w-20">
                  <input
                    type="color"
                    value={link.color}
                    onChange={(e) => handleHeaderLinkUpdate(link.id, { color: e.target.value })}
                    className="w-full h-8 border border-gray-300 rounded"
                  />
                </div>
                <button
                  onClick={() => handleHeaderLinkDelete(link.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Componente para editar Body
  const BodyEditor = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Editor do Corpo</h3>
        <button
          onClick={() => setShowBodyEditor(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <XCircle className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Informações do Cliente */}
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-4">Informações do Cliente</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Cliente
              </label>
              <input
                type="text"
                value={bodyData.clientInfo.name}
                onChange={(e) => handleClientInfoUpdate({ name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={bodyData.clientInfo.email}
                onChange={(e) => handleClientInfoUpdate({ email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone
              </label>
              <input
                type="text"
                value={bodyData.clientInfo.phone}
                onChange={(e) => handleClientInfoUpdate({ phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Documento
              </label>
              <input
                type="text"
                value={bodyData.clientInfo.document}
                onChange={(e) => handleClientInfoUpdate({ document: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Informações da Reserva */}
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-4">Informações da Reserva</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código da Reserva
              </label>
              <input
                type="text"
                value={bodyData.reservationInfo.code}
                onChange={(e) => handleReservationInfoUpdate({ code: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destino
              </label>
              <input
                type="text"
                value={bodyData.reservationInfo.destination}
                onChange={(e) => handleReservationInfoUpdate({ destination: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Início
              </label>
              <input
                type="date"
                value={bodyData.reservationInfo.startDate}
                onChange={(e) => handleReservationInfoUpdate({ startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Fim
              </label>
              <input
                type="date"
                value={bodyData.reservationInfo.endDate}
                onChange={(e) => handleReservationInfoUpdate({ endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor
              </label>
              <input
                type="number"
                value={bodyData.reservationInfo.value}
                onChange={(e) => handleReservationInfoUpdate({ value: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Agência
              </label>
              <input
                type="text"
                value={bodyData.reservationInfo.agency}
                onChange={(e) => handleReservationInfoUpdate({ agency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Benefícios */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-700">Benefícios</h4>
            <button
              onClick={handleBenefitAdd}
              className="flex items-center px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar Benefício
            </button>
          </div>
          <div className="space-y-3">
            {bodyData.benefits.map((benefit) => (
              <div key={benefit.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <input
                    type="text"
                    value={benefit.text}
                    onChange={(e) => handleBenefitUpdate(benefit.id, { text: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="Descrição do benefício"
                  />
                </div>
                <div className="w-20">
                  <input
                    type="color"
                    value={benefit.color}
                    onChange={(e) => handleBenefitUpdate(benefit.id, { color: e.target.value })}
                    className="w-full h-8 border border-gray-300 rounded"
                  />
                </div>
                <button
                  onClick={() => handleBenefitDelete(benefit.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Observações */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observações
          </label>
          <textarea
            value={bodyData.observations}
            onChange={(e) => handleBodyUpdate({ observations: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Observações adicionais..."
          />
        </div>
      </div>
    </div>
  );

  // Componente para editar Footer
  const FooterEditor = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Editor do Rodapé</h3>
        <button
          onClick={() => setShowFooterEditor(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <XCircle className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Termos e Condições */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-700">Termos e Condições</h4>
            <button
              onClick={handleFooterLinkAdd}
              className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar Link
            </button>
          </div>
          <div className="space-y-3">
            {footerData.termsAndConditions.map((link) => (
              <div key={link.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <input
                    type="text"
                    value={link.text}
                    onChange={(e) => handleFooterLinkUpdate(link.id, { text: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="Texto do link"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => handleFooterLinkUpdate(link.id, { url: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="URL do link"
                  />
                </div>
                <div className="w-20">
                  <input
                    type="color"
                    value={link.color}
                    onChange={(e) => handleFooterLinkUpdate(link.id, { color: e.target.value })}
                    className="w-full h-8 border border-gray-300 rounded"
                  />
                </div>
                <button
                  onClick={() => handleFooterLinkDelete(link.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Informações de Contato */}
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-4">Informações de Contato</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone
              </label>
              <input
                type="text"
                value={footerData.contactInfo.phone}
                onChange={(e) => handleContactInfoUpdate({ phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={footerData.contactInfo.email}
                onChange={(e) => handleContactInfoUpdate({ email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                value={footerData.contactInfo.website}
                onChange={(e) => handleContactInfoUpdate({ website: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Endereço
              </label>
              <input
                type="text"
                value={footerData.contactInfo.address}
                onChange={(e) => handleContactInfoUpdate({ address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Redes Sociais */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-700">Redes Sociais</h4>
            <button
              onClick={handleSocialMediaAdd}
              className="flex items-center px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar Rede Social
            </button>
          </div>
          <div className="space-y-3">
            {footerData.socialMedia.map((social) => (
              <div key={social.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <select
                    value={social.platform}
                    onChange={(e) => handleSocialMediaUpdate(social.id, { platform: e.target.value as any })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="twitter">Twitter</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="youtube">YouTube</option>
                    <option value="telegram">Telegram</option>
                  </select>
                </div>
                <div className="flex-1">
                  <input
                    type="url"
                    value={social.url}
                    onChange={(e) => handleSocialMediaUpdate(social.id, { url: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="URL da rede social"
                  />
                </div>
                <div className="w-20">
                  <input
                    type="color"
                    value={social.color}
                    onChange={(e) => handleSocialMediaUpdate(social.id, { color: e.target.value })}
                    className="w-full h-8 border border-gray-300 rounded"
                  />
                </div>
                <button
                  onClick={() => handleSocialMediaDelete(social.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Texto Personalizado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Texto Personalizado
          </label>
          <textarea
            value={footerData.customText}
            onChange={(e) => handleFooterUpdate({ customText: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Texto personalizado para o rodapé..."
          />
        </div>
      </div>
    </div>
  );

  // Componente para gerar QR Code
  const QRCodeGenerator = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Gerador de QR Code</h3>
        <button
          onClick={() => setShowQrCodeModal(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <XCircle className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Dados do QR Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dados do QR Code
          </label>
          <textarea
            value={qrCodeData}
            onChange={(e) => setQrCodeData(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Insira os dados para gerar o QR Code (URL, texto, etc.)"
          />
        </div>

        {/* Configurações do QR Code */}
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-4">Configurações</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tamanho
              </label>
              <input
                type="number"
                value={qrCodeSize}
                onChange={(e) => setQrCodeSize(parseInt(e.target.value))}
                min="100"
                max="500"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nível de Correção de Erro
              </label>
              <select
                value={qrCodeErrorLevel}
                onChange={(e) => setQrCodeErrorLevel(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="L">Baixo (7%)</option>
                <option value="M">Médio (15%)</option>
                <option value="Q">Alto (25%)</option>
                <option value="H">Muito Alto (30%)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cor do QR Code
              </label>
              <input
                type="color"
                value={qrCodeColor}
                onChange={(e) => setQrCodeColor(e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cor de Fundo
              </label>
              <input
                type="color"
                value={qrCodeBgColor}
                onChange={(e) => setQrCodeBgColor(e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Preview do QR Code */}
        {qrCodeUrl && (
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-4">Preview</h4>
            <div className="flex flex-col items-center space-y-4">
              <img 
                src={qrCodeUrl} 
                alt="QR Code" 
                className="border border-gray-300 rounded-lg"
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleDownloadQRCode}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar
                </button>
                <button
                  onClick={handleCopyQRCode}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Dados
                </button>
                <button
                  onClick={handleAddQRCodeToVoucher}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar ao Voucher
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Botão Gerar */}
        <div className="flex justify-center">
          <button
            onClick={handleGenerateQRCode}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <QrCode className="w-5 h-5 mr-2" />
            Gerar QR Code
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Palette className="w-8 h-8 text-purple-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Editor de Vouchers</h1>
                  <p className="text-sm text-gray-500">Personalize Header, Body e Footer dos vouchers</p>
                </div>
              </div>
            </div>
            <NavigationButtons className="mt-2" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Seletor de Seções */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Seções do Voucher</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Header */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Building className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Header</h4>
                      <p className="text-sm text-gray-600">Cabeçalho da empresa</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    <p><strong>Empresa:</strong> {headerData.companyName}</p>
                    <p><strong>Links:</strong> {headerData.links.length} links</p>
                    <p><strong>Cor:</strong> {headerData.backgroundColor}</p>
                  </div>
                  <button
                    onClick={() => setShowHeaderEditor(true)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Editar Header
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Body</h4>
                      <p className="text-sm text-gray-600">Informações da reserva</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    <p><strong>Cliente:</strong> {bodyData.clientInfo.name || 'Não definido'}</p>
                    <p><strong>Destino:</strong> {bodyData.reservationInfo.destination || 'Não definido'}</p>
                    <p><strong>Benefícios:</strong> {bodyData.benefits.length} itens</p>
                  </div>
                  <button
                    onClick={() => setShowBodyEditor(true)}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Editar Body
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <Link className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Footer</h4>
                      <p className="text-sm text-gray-600">Links e contatos</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    <p><strong>Termos:</strong> {footerData.termsAndConditions.length} links</p>
                    <p><strong>Redes Sociais:</strong> {footerData.socialMedia.length} plataformas</p>
                    <p><strong>Contato:</strong> {footerData.contactInfo.phone}</p>
                  </div>
                  <button
                    onClick={() => setShowFooterEditor(true)}
                    className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Editar Footer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview do Voucher */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Preview do Voucher</h3>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
              >
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{showPreview ? 'Ocultar' : 'Mostrar'} Preview</span>
              </button>
            </div>
          </div>
          {showPreview && (
            <div className="p-6">
              <div className="max-w-2xl mx-auto border border-gray-300 rounded-lg overflow-hidden">
                {/* Header Preview */}
                <div 
                  className="p-6 text-center"
                  style={{ backgroundColor: headerData.backgroundColor, color: headerData.textColor }}
                >
                  {headerData.showLogo && (
                    <div className="mb-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto flex items-center justify-center">
                        <Building className="w-8 h-8 text-gray-400" />
                      </div>
                    </div>
                  )}
                  {headerData.showCompanyInfo && (
                    <div className="mb-4">
                      <h2 className="text-xl font-bold mb-2">{headerData.companyName}</h2>
                      <p className="text-sm mb-1">{headerData.companyAddress}</p>
                      <p className="text-sm mb-1">{headerData.companyPhone}</p>
                      <p className="text-sm mb-1">{headerData.companyEmail}</p>
                      <p className="text-sm">{headerData.companyWebsite}</p>
                    </div>
                  )}
                  {headerData.links.length > 0 && (
                    <div className="flex justify-center space-x-4 text-sm">
                      {headerData.links.map((link) => (
                        <a
                          key={link.id}
                          href={link.url}
                          className="hover:underline"
                          style={{ color: link.color }}
                        >
                          {link.text}
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Body Preview */}
                <div 
                  className="p-6"
                  style={{ backgroundColor: bodyData.backgroundColor, color: bodyData.textColor }}
                >
                  <h3 className="text-lg font-semibold mb-4">{bodyData.title}</h3>
                  <div className="space-y-4">
                    {bodyData.clientInfo.name && (
                      <div>
                        <strong>Cliente:</strong> {bodyData.clientInfo.name}
                      </div>
                    )}
                    {bodyData.reservationInfo.destination && (
                      <div>
                        <strong>Destino:</strong> {bodyData.reservationInfo.destination}
                      </div>
                    )}
                    {bodyData.benefits.length > 0 && (
                      <div>
                        <strong>Benefícios:</strong>
                        <ul className="mt-2 space-y-1">
                          {bodyData.benefits.map((benefit) => (
                            <li key={benefit.id} className="flex items-center space-x-2">
                              <div 
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: benefit.color }}
                              />
                              <span>{benefit.text}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Preview */}
                <div 
                  className="p-6 text-center"
                  style={{ backgroundColor: footerData.backgroundColor, color: footerData.textColor }}
                >
                  {footerData.showTerms && footerData.termsAndConditions.length > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-center space-x-4 text-sm">
                        {footerData.termsAndConditions.map((link) => (
                          <a
                            key={link.id}
                            href={link.url}
                            className="hover:underline"
                            style={{ color: link.color }}
                          >
                            {link.text}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  {footerData.showContact && (
                    <div className="mb-4 text-sm">
                      <p>{footerData.contactInfo.phone}</p>
                      <p>{footerData.contactInfo.email}</p>
                      <p>{footerData.contactInfo.website}</p>
                    </div>
                  )}
                  {footerData.showSocial && footerData.socialMedia.length > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-center space-x-4">
                        {footerData.socialMedia.map((social) => (
                          <a
                            key={social.id}
                            href={social.url}
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: social.color }}
                          >
                            <span className="text-white text-xs">{social.platform.charAt(0).toUpperCase()}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  {footerData.showCustomText && footerData.customText && (
                    <div className="text-sm">
                      <p>{footerData.customText}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Ações</h3>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleSaveVoucher}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar Voucher
              </button>
              <button
                onClick={handleExportVoucher}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar PDF
              </button>
              <button
                onClick={() => setShowQrCodeModal(true)}
                className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                <QrCode className="w-4 h-4 mr-2" />
                Gerar QR Code
              </button>
              <button
                onClick={() => setShowTemplateModal(true)}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Palette className="w-4 h-4 mr-2" />
                Selecionar Template
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modais */}
      {showHeaderEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <HeaderEditor />
          </div>
        </div>
      )}

      {showBodyEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <BodyEditor />
          </div>
        </div>
      )}

      {showFooterEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <FooterEditor />
          </div>
        </div>
      )}

      {showQrCodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <QRCodeGenerator />
          </div>
        </div>
      )}
    </div>
  );
} 