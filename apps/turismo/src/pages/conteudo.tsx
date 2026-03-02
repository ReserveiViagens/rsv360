import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { useRouter } from 'next/router';
import { 
  FileText, 
  Image, 
  Video, 
  Globe, 
  Languages,
  Plus,
  Edit,
  Trash,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Star,
  Heart,
  Share,
  BookOpen,
  Camera,
  Play,
  File,
  Folder,
  Tag,
  Calendar,
  User,
  EyeOff,
  Lock,
  Unlock,
  Settings,
  CheckCircle
} from 'lucide-react';
import NavigationButtons from '../components/NavigationButtons';

interface Content {
  id: number;
  title: string;
  description: string;
  type: 'text' | 'image' | 'video' | 'document' | 'gallery';
  category: string;
  language: string;
  status: 'published' | 'draft' | 'archived' | 'pending';
  author: string;
  created_at: string;
  updated_at: string;
  views: number;
  likes: number;
  shares: number;
  file_size?: string;
  duration?: string;
  resolution?: string;
  tags: string[];
  thumbnail?: string;
  content_url?: string;
}

interface Category {
  id: number;
  name: string;
  description: string;
  content_count: number;
  total_views: number;
  icon: string;
  color: string;
}

interface Language {
  id: number;
  name: string;
  code: string;
  content_count: number;
  flag: string;
  is_active: boolean;
}

export default function ConteudoPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  // Estados para formulários
  const [newContentForm, setNewContentForm] = useState({
    title: '',
    description: '',
    type: 'text',
    category: '',
    language: 'pt-BR',
    status: 'draft',
    tags: '',
    content: ''
  });

  const [newCategoryForm, setNewCategoryForm] = useState({
    name: '',
    description: '',
    icon: 'BookOpen',
    color: 'bg-blue-500'
  });

  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  
  // Estado para gerenciamento de conteúdo
  const [showContentManager, setShowContentManager] = useState(false);
  const [selectedContentForEdit, setSelectedContentForEdit] = useState<Content | null>(null);
  const [selectedContentForDelete, setSelectedContentForDelete] = useState<Content | null>(null);
  
  // Estado para ações em lote
  const [selectedContents, setSelectedContents] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [batchAction, setBatchAction] = useState<string>('');
  
  // Estado para módulo de exportação/importação
  const [exportForm, setExportForm] = useState({
    format: 'json',
    includeMetadata: true,
    includeStats: true,
    includeRelations: true,
    compression: false,
    dateRange: 'all',
    categories: [] as string[],
    languages: [] as string[]
  });
  
  const [importForm, setImportForm] = useState({
    format: 'json',
    updateExisting: false,
    createMissing: true,
    validateData: true,
    backupBeforeImport: true,
    selectedFile: null as File | null
  });
  
  const [importPreview, setImportPreview] = useState<any>(null);
  const [exportHistory, setExportHistory] = useState<any[]>([]);
  const [importHistory, setImportHistory] = useState<any[]>([]);

  // Funções auxiliares
  const formatNumber = (num: number) => {
    return num.toLocaleString('pt-BR');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Dados simulados
  const [stats] = useState({
    total_content: 1250,
    published_content: 980,
    draft_content: 180,
    archived_content: 90,
    total_views: 2500000,
    total_likes: 45000,
    total_shares: 12000,
    active_languages: 8,
    total_categories: 15,
    storage_used: '2.5 GB'
  });

  // Cards clicáveis de estatísticas
  const statsCards = [
    {
      id: 'total_content',
      title: 'Total de Conteúdo',
      value: formatNumber(stats.total_content),
      icon: <FileText className="h-6 w-6" />,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      description: 'Conteúdos criados no sistema'
    },
    {
      id: 'published_content',
      title: 'Publicados',
      value: formatNumber(stats.published_content),
      icon: <Eye className="h-6 w-6" />,
      color: 'bg-green-500',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      description: 'Conteúdos ativos e visíveis'
    },
    {
      id: 'total_views',
      title: 'Total de Visualizações',
      value: formatNumber(stats.total_views),
      icon: <Eye className="h-6 w-6" />,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      description: 'Visualizações acumuladas'
    },
    {
      id: 'total_likes',
      title: 'Total de Likes',
      value: formatNumber(stats.total_likes),
      icon: <Heart className="h-6 w-6" />,
      color: 'bg-red-500',
      bgColor: 'bg-red-100',
      textColor: 'text-red-600',
      description: 'Likes recebidos'
    },
    {
      id: 'active_languages',
      title: 'Idiomas Ativos',
      value: stats.active_languages.toString(),
      icon: <Languages className="h-6 w-6" />,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-100',
      textColor: 'text-indigo-600',
      description: 'Idiomas configurados'
    },
    {
      id: 'storage_used',
      title: 'Armazenamento',
      value: stats.storage_used,
      icon: <Folder className="h-6 w-6" />,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600',
      description: 'Espaço utilizado'
    }
  ];

  const [contents] = useState<Content[]>([
    {
      id: 1,
      title: 'Guia Completo de Turismo',
      description: 'Guia completo com dicas e informações sobre destinos turísticos',
      type: 'document',
      category: 'Guias',
      language: 'Português',
      status: 'published',
      author: 'Ana Silva',
      created_at: '2024-01-15',
      updated_at: '2024-01-20',
      views: 15000,
      likes: 450,
      shares: 120,
      file_size: '2.5 MB',
      tags: ['turismo', 'guias', 'destinos'],
      thumbnail: '/images/guide-thumb.jpg'
    },
    {
      id: 2,
      title: 'Vídeo Promocional - Praias',
      description: 'Vídeo promocional das melhores praias do Brasil',
      type: 'video',
      category: 'Vídeos',
      language: 'Português',
      status: 'published',
      author: 'Carlos Santos',
      created_at: '2024-01-10',
      updated_at: '2024-01-12',
      views: 25000,
      likes: 780,
      shares: 320,
      duration: '3:45',
      resolution: '1080p',
      tags: ['praias', 'vídeo', 'promoção'],
      thumbnail: '/images/beach-video-thumb.jpg'
    },
    {
      id: 3,
      title: 'Galeria de Fotos - Montanhas',
      description: 'Galeria com as melhores fotos de montanhas e trilhas',
      type: 'gallery',
      category: 'Fotos',
      language: 'Português',
      status: 'published',
      author: 'Maria Costa',
      created_at: '2024-01-08',
      updated_at: '2024-01-09',
      views: 12000,
      likes: 320,
      shares: 85,
      tags: ['montanhas', 'trilhas', 'fotos'],
      thumbnail: '/images/mountain-gallery-thumb.jpg'
    },
    {
      id: 4,
      title: 'Artigo sobre Gastronomia',
      description: 'Artigo sobre a gastronomia local e restaurantes',
      type: 'text',
      category: 'Artigos',
      language: 'Português',
      status: 'draft',
      author: 'João Oliveira',
      created_at: '2024-01-05',
      updated_at: '2024-01-07',
      views: 0,
      likes: 0,
      shares: 0,
      tags: ['gastronomia', 'restaurantes', 'culinária']
    }
  ]);

  const [categories] = useState<Category[]>([
    {
      id: 1,
      name: 'Guias',
      description: 'Guias turísticos e informativos',
      content_count: 45,
      total_views: 150000,
      icon: 'BookOpen',
      color: 'bg-blue-500'
    },
    {
      id: 2,
      name: 'Vídeos',
      description: 'Vídeos promocionais e informativos',
      content_count: 32,
      total_views: 280000,
      icon: 'Play',
      color: 'bg-red-500'
    },
    {
      id: 3,
      name: 'Fotos',
      description: 'Galeria de fotos e imagens',
      content_count: 78,
      total_views: 320000,
      icon: 'Camera',
      color: 'bg-green-500'
    },
    {
      id: 4,
      name: 'Artigos',
      description: 'Artigos e textos informativos',
      content_count: 95,
      total_views: 180000,
      icon: 'FileText',
      color: 'bg-purple-500'
    }
  ]);

  const [languages] = useState<Language[]>([
    {
      id: 1,
      name: 'Português',
      code: 'pt-BR',
      content_count: 850,
      flag: '🇧🇷',
      is_active: true
    },
    {
      id: 2,
      name: 'Inglês',
      code: 'en-US',
      content_count: 320,
      flag: '🇺🇸',
      is_active: true
    },
    {
      id: 3,
      name: 'Espanhol',
      code: 'es-ES',
      content_count: 180,
      flag: '🇪🇸',
      is_active: true
    },
    {
      id: 4,
      name: 'Francês',
      code: 'fr-FR',
      content_count: 95,
      flag: '🇫🇷',
      is_active: false
    },
    {
      id: 5,
      name: 'Alemão',
      code: 'de-DE',
      content_count: 75,
      flag: '🇩🇪',
      is_active: true
    },
    {
      id: 6,
      name: 'Italiano',
      code: 'it-IT',
      content_count: 65,
      flag: '🇮🇹',
      is_active: true
    },
    {
      id: 7,
      name: 'Chinês',
      code: 'zh-CN',
      content_count: 45,
      flag: '🇨🇳',
      is_active: false
    },
    {
      id: 8,
      name: 'Japonês',
      code: 'ja-JP',
      content_count: 35,
      flag: '🇯🇵',
      is_active: false
    }
  ]);

  // Dados de análise de armazenamento
  const [storageData] = useState({
    total_storage: '2.5 GB',
    used_storage: '1.8 GB',
    available_storage: '0.7 GB',
    usage_percentage: 72,
    breakdown: [
      { type: 'Vídeos', size: '850 MB', percentage: 34, color: 'bg-red-500' },
      { type: 'Imagens', size: '650 MB', percentage: 26, color: 'bg-green-500' },
      { type: 'Documentos', size: '400 MB', percentage: 16, color: 'bg-blue-500' },
      { type: 'Áudios', size: '200 MB', percentage: 8, color: 'bg-purple-500' },
      { type: 'Outros', size: '100 MB', percentage: 4, color: 'bg-gray-500' }
    ],
    largest_files: [
      { name: 'video_promocional_4k.mp4', size: '125 MB', type: 'Vídeo' },
      { name: 'galeria_praias_hd.jpg', size: '85 MB', type: 'Imagem' },
      { name: 'guia_turismo_completo.pdf', size: '45 MB', type: 'Documento' },
      { name: 'podcast_episodio_15.mp3', size: '32 MB', type: 'Áudio' },
      { name: 'apresentacao_empresa.pptx', size: '28 MB', type: 'Documento' }
    ]
  });

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const handleCardClick = (cardType: string) => {
    setModalType(cardType);
    setShowModal(true);
  };

  const handleContentClick = (content: Content) => {
    setSelectedItem(content);
    setModalType('content');
    setShowModal(true);
  };

  const handleCategoryClick = (category: Category) => {
    setSelectedItem(category);
    setModalType('category');
    setShowModal(true);
  };

  const handleLanguageClick = (language: Language) => {
    setSelectedItem(language);
    setModalType('language');
    setShowModal(true);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'new_content':
        setModalType('new_content');
        setShowModal(true);
        break;
      case 'new_category':
        setModalType('new_category');
        setShowModal(true);
        break;
      case 'export':
        setModalType('export_advanced');
        setShowModal(true);
        break;
      case 'import':
        setModalType('import_advanced');
        setShowModal(true);
        break;
      case 'manage_languages':
        setModalType('manage_languages');
        setShowModal(true);
        break;
      case 'storage_analysis':
        setModalType('storage_analysis');
        setShowModal(true);
        break;
      case 'manage_content':
        setModalType('manage_content');
        setShowModal(true);
        break;
    }
  };

  // Funções antigas de exportação/importação (mantidas para compatibilidade)
  const handleExportDataSimple = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setModalType('export_success');
      setShowModal(true);
    }, 2000);
  };

  const handleImportDataSimple = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setModalType('import_success');
      setShowModal(true);
    }, 2000);
  };

  // Funções de validação
  const validateContentForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!newContentForm.title.trim()) {
      errors.title = 'Título é obrigatório';
    }
    if (!newContentForm.description.trim()) {
      errors.description = 'Descrição é obrigatória';
    }
    if (!newContentForm.category) {
      errors.category = 'Categoria é obrigatória';
    }
    if (!newContentForm.content.trim()) {
      errors.content = 'Conteúdo é obrigatório';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateCategoryForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!newCategoryForm.name.trim()) {
      errors.name = 'Nome é obrigatório';
    }
    if (!newCategoryForm.description.trim()) {
      errors.description = 'Descrição é obrigatória';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Funções de submissão
  const handleSubmitContent = () => {
    if (validateContentForm()) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setModalType('content_success');
        setShowModal(true);
        // Reset form
        setNewContentForm({
          title: '',
          description: '',
          type: 'text',
          category: '',
          language: 'pt-BR',
          status: 'draft',
          tags: '',
          content: ''
        });
      }, 2000);
    }
  };

  const handleSubmitCategory = () => {
    if (validateCategoryForm()) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setModalType('category_success');
        setShowModal(true);
        // Reset form
        setNewCategoryForm({
          name: '',
          description: '',
          icon: 'BookOpen',
          color: 'bg-blue-500'
        });
      }, 2000);
    }
  };

  const handleInputChange = (formType: 'content' | 'category', field: string, value: string) => {
    if (formType === 'content') {
      setNewContentForm(prev => ({ ...prev, [field]: value }));
    } else {
      setNewCategoryForm(prev => ({ ...prev, [field]: value }));
    }
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Funções para gerenciamento de conteúdo
  const handleEditContent = (content: Content) => {
    setSelectedContentForEdit(content);
    setModalType('edit_content');
    setShowModal(true);
  };

  const handleDeleteContent = (content: Content) => {
    setSelectedContentForDelete(content);
    setModalType('delete_content');
    setShowModal(true);
  };

  const handleConfirmDelete = () => {
    if (selectedContentForDelete) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setModalType('delete_success');
        setShowModal(true);
        setSelectedContentForDelete(null);
      }, 2000);
    }
  };

  const handleSaveEdit = () => {
    if (selectedContentForEdit) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setModalType('edit_success');
        setShowModal(true);
        setSelectedContentForEdit(null);
      }, 2000);
    }
  };

  // Funções para ações em lote
  const handleSelectContent = (contentId: number) => {
    setSelectedContents(prev => 
      prev.includes(contentId) 
        ? prev.filter(id => id !== contentId)
        : [...prev, contentId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedContents([]);
      setSelectAll(false);
    } else {
      const allIds = contents.slice(0, 6).map(content => content.id);
      setSelectedContents(allIds);
      setSelectAll(true);
    }
  };

  const handleBatchAction = (action: string) => {
    if (selectedContents.length === 0) {
      alert('Selecione pelo menos um conteúdo para realizar a ação.');
      return;
    }
    
    setBatchAction(action);
    setModalType('batch_action');
    setShowModal(true);
  };

  const handleConfirmBatchAction = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setModalType('batch_success');
      setShowModal(true);
      setSelectedContents([]);
      setSelectAll(false);
      setBatchAction('');
    }, 2000);
  };

  // Funções para módulo de exportação/importação
  const handleExportFormChange = (field: string, value: any) => {
    setExportForm(prev => ({ ...prev, [field]: value }));
  };

  const handleImportFormChange = (field: string, value: any) => {
    setImportForm(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportForm(prev => ({ ...prev, selectedFile: file }));
      // Simular preview do arquivo
      setTimeout(() => {
        setImportPreview({
          fileName: file.name,
          fileSize: formatFileSize(file.size),
          format: file.name.split('.').pop()?.toUpperCase(),
          records: Math.floor(Math.random() * 100) + 10,
          lastModified: new Date(file.lastModified).toLocaleDateString('pt-BR')
        });
      }, 500);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleExportData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      
      // Simular dados de exportação
      const exportData = {
        timestamp: new Date().toISOString(),
        format: exportForm.format,
        records: Math.floor(Math.random() * 1000) + 100,
        size: formatFileSize(Math.floor(Math.random() * 10000000) + 100000),
        categories: exportForm.categories.length > 0 ? exportForm.categories : ['Todas'],
        languages: exportForm.languages.length > 0 ? exportForm.languages : ['Todas']
      };
      
      // Adicionar ao histórico
      setExportHistory(prev => [exportData, ...prev.slice(0, 9)]);
      
      setModalType('export_success');
      setShowModal(true);
    }, 3000);
  };

  const handleImportData = () => {
    if (!importForm.selectedFile) {
      alert('Selecione um arquivo para importar.');
      return;
    }
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      
      // Simular dados de importação
      const importData = {
        timestamp: new Date().toISOString(),
        fileName: importForm.selectedFile?.name,
        format: importForm.format,
        records: Math.floor(Math.random() * 500) + 50,
        status: 'success',
        errors: 0,
        warnings: Math.floor(Math.random() * 5)
      };
      
      // Adicionar ao histórico
      setImportHistory(prev => [importData, ...prev.slice(0, 9)]);
      
      setModalType('import_success');
      setShowModal(true);
      setImportForm(prev => ({ ...prev, selectedFile: null }));
      setImportPreview(null);
    }, 4000);
  };

  const handleValidateImport = () => {
    if (!importForm.selectedFile) return;
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setModalType('import_validation');
      setShowModal(true);
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'Publicado';
      case 'draft': return 'Rascunho';
      case 'archived': return 'Arquivado';
      case 'pending': return 'Pendente';
      default: return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return <FileText className="w-5 h-5" />;
      case 'image': return <Image className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      case 'document': return <File className="w-5 h-5" />;
      case 'gallery': return <Camera className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'text': return 'bg-blue-100 text-blue-800';
      case 'image': return 'bg-green-100 text-green-800';
      case 'video': return 'bg-red-100 text-red-800';
      case 'document': return 'bg-purple-100 text-purple-800';
      case 'gallery': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };



  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <NavigationButtons className="mr-4" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Gestão de Conteúdo</h1>
                  <p className="text-sm text-gray-500">Gerencie todo o conteúdo do sistema</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar conteúdo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">Todos</option>
                  <option value="published">Publicados</option>
                  <option value="draft">Rascunhos</option>
                  <option value="archived">Arquivados</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
            {statsCards.map((card) => (
              <div
                key={card.id}
                className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleCardClick(card.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className={`text-2xl font-bold ${card.textColor}`}>{card.value}</p>
                  </div>
                  <div className={`${card.bgColor} p-3 rounded-lg`}>
                    <div className={card.textColor}>
                      {card.icon}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
            <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
              {[
                {
                  id: 'new_content',
                  title: 'Novo Conteúdo',
                  icon: <Plus className="w-5 h-5" />,
                  color: 'bg-blue-600 hover:bg-blue-700'
                },
                {
                  id: 'new_category',
                  title: 'Nova Categoria',
                  icon: <Plus className="w-5 h-5" />,
                  color: 'bg-green-600 hover:bg-green-700'
                },
                {
                  id: 'manage_languages',
                  title: 'Gerenciar Idiomas',
                  icon: <Languages className="w-5 h-5" />,
                  color: 'bg-indigo-600 hover:bg-indigo-700'
                },
                {
                  id: 'storage_analysis',
                  title: 'Análise de Armazenamento',
                  icon: <Folder className="w-5 h-5" />,
                  color: 'bg-orange-600 hover:bg-orange-700'
                },
                {
                  id: 'export',
                  title: 'Exportar',
                  icon: <Download className="w-5 h-5" />,
                  color: 'bg-purple-600 hover:bg-purple-700'
                },
                {
                  id: 'import',
                  title: 'Importar',
                  icon: <Upload className="w-5 h-5" />,
                  color: 'bg-red-600 hover:bg-red-700'
                },
                {
                  id: 'manage_content',
                  title: 'Gerenciar Conteúdo',
                  icon: <Edit className="w-5 h-5" />,
                  color: 'bg-teal-600 hover:bg-teal-700'
                }
              ].map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action.id)}
                  className={`flex items-center justify-center space-x-2 ${action.color} text-white px-4 py-3 rounded-lg transition-colors`}
                >
                  {action.icon}
                  <span className="text-sm">{action.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Conteúdo Recente</h2>
                <div className="space-y-4">
                  {contents.slice(0, 4).map((content) => (
                    <div
                      key={content.id}
                      className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleContentClick(content)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${getTypeColor(content.type)}`}>
                            {getTypeIcon(content.type)}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{content.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{content.description}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-xs text-gray-500">{content.category}</span>
                              <span className="text-xs text-gray-500">{content.language}</span>
                              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(content.status)}`}>
                                {getStatusText(content.status)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{formatNumber(content.views)}</p>
                          <p className="text-xs text-gray-500">visualizações</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Categories and Languages */}
            <div className="space-y-6">
              {/* Categories */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Categorias</h2>
                <div className="space-y-3">
                  {categories.slice(0, 4).map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleCategoryClick(category)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${category.color}`}>
                          <BookOpen className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{category.name}</p>
                          <p className="text-sm text-gray-500">{category.content_count} conteúdos</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{formatNumber(category.total_views)}</p>
                        <p className="text-xs text-gray-500">visualizações</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Idiomas</h2>
                <div className="space-y-3">
                  {languages.slice(0, 4).map((language) => (
                    <div
                      key={language.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleLanguageClick(language)}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{language.flag}</span>
                        <div>
                          <p className="font-medium text-gray-900">{language.name}</p>
                          <p className="text-sm text-gray-500">{language.content_count} conteúdos</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${language.is_active ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        <span className="text-xs text-gray-500">{language.is_active ? 'Ativo' : 'Inativo'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {modalType === 'content' && 'Detalhes do Conteúdo'}
                  {modalType === 'category' && 'Detalhes da Categoria'}
                  {modalType === 'language' && 'Detalhes do Idioma'}
                  {modalType === 'new_content' && 'Novo Conteúdo'}
                  {modalType === 'new_category' && 'Nova Categoria'}
                  {modalType.startsWith('total_') && 'Estatísticas Detalhadas'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="space-y-4">
                {modalType === 'content' && selectedItem && (
                  <div>
                    <div className="flex items-start space-x-3 mb-4">
                      <div className={`p-3 rounded-lg ${getTypeColor(selectedItem.type)}`}>
                        {getTypeIcon(selectedItem.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-1">{selectedItem.title}</h4>
                        <p className="text-gray-600">{selectedItem.description}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Tipo</p>
                        <p className="text-gray-900 capitalize">{selectedItem.type}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Categoria</p>
                        <p className="text-gray-900">{selectedItem.category}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Idioma</p>
                        <p className="text-gray-900">{selectedItem.language}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Status</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(selectedItem.status)}`}>
                          {getStatusText(selectedItem.status)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Autor</p>
                        <p className="text-gray-900">{selectedItem.author}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Criado em</p>
                        <p className="text-gray-900">{formatDate(selectedItem.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Atualizado em</p>
                        <p className="text-gray-900">{formatDate(selectedItem.updated_at)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Compartilhamentos</p>
                        <p className="text-gray-900">{formatNumber(selectedItem.shares)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-blue-50 p-3 rounded-lg text-center">
                        <p className="text-2xl font-bold text-blue-600">{formatNumber(selectedItem.views)}</p>
                        <p className="text-sm text-blue-700">Visualizações</p>
                      </div>
                      <div className="bg-red-50 p-3 rounded-lg text-center">
                        <p className="text-2xl font-bold text-red-600">{formatNumber(selectedItem.likes)}</p>
                        <p className="text-sm text-red-700">Likes</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg text-center">
                        <p className="text-2xl font-bold text-green-600">{formatNumber(selectedItem.shares)}</p>
                        <p className="text-sm text-green-700">Compartilhamentos</p>
                      </div>
                    </div>

                    {selectedItem.tags && selectedItem.tags.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-2">Tags</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedItem.tags.map((tag: string, index: number) => (
                            <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {modalType === 'category' && selectedItem && (
                  <div>
                    <div className="flex items-start space-x-3 mb-4">
                      <div className={`p-3 rounded-lg ${selectedItem.color}`}>
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-1">{selectedItem.name}</h4>
                        <p className="text-gray-600">{selectedItem.description}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Conteúdos</p>
                        <p className="text-gray-900">{selectedItem.content_count}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Visualizações</p>
                        <p className="text-gray-900">{formatNumber(selectedItem.total_views)}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-2">Estatísticas da Categoria</h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">{selectedItem.content_count}</p>
                          <p className="text-sm text-gray-600">Conteúdos</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">{formatNumber(selectedItem.total_views)}</p>
                          <p className="text-sm text-gray-600">Visualizações</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {modalType === 'language' && selectedItem && (
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="text-4xl">{selectedItem.flag}</span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-1">{selectedItem.name}</h4>
                        <p className="text-gray-600">Código: {selectedItem.code}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`w-3 h-3 rounded-full ${selectedItem.is_active ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        <span className={`text-sm font-medium ${selectedItem.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                          {selectedItem.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Conteúdos</p>
                        <p className="text-gray-900">{selectedItem.content_count}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Status</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${selectedItem.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {selectedItem.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-2">Estatísticas do Idioma</h5>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-indigo-600">{selectedItem.content_count}</p>
                        <p className="text-sm text-gray-600">Conteúdos neste idioma</p>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700">
                        <strong>Dica:</strong> Idiomas ativos são exibidos para os usuários finais. 
                        Idiomas inativos ficam ocultos mas mantêm o conteúdo.
                      </p>
                    </div>
                  </div>
                )}

                {modalType.startsWith('total_') && (
                  <div>
                    <h4 className="font-semibold text-lg mb-4">Estatísticas Detalhadas</h4>
                    <div className="space-y-4">
                      {statsCards.map((card) => (
                        <div key={card.id} className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-gray-500">{card.title}</p>
                          <p className={`text-2xl font-bold ${card.textColor}`}>{card.value}</p>
                          <p className="text-sm text-gray-600 mt-1">{card.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {modalType === 'new_content' && (
                  <div>
                    <h4 className="font-semibold text-lg mb-4">Novo Conteúdo</h4>
                    <div className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h5 className="font-semibold text-blue-900 mb-2">Criar novo conteúdo no sistema de gestão</h5>
                        <p className="text-blue-700">Preencha os campos abaixo para criar um novo conteúdo.</p>
                      </div>
                      
                      <form className="space-y-4">
                        {/* Título */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Título *
                          </label>
                          <input
                            type="text"
                            value={newContentForm.title}
                            onChange={(e) => handleInputChange('content', 'title', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              formErrors.title ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Digite o título do conteúdo"
                          />
                          {formErrors.title && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
                          )}
                        </div>

                        {/* Descrição */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descrição *
                          </label>
                          <textarea
                            value={newContentForm.description}
                            onChange={(e) => handleInputChange('content', 'description', e.target.value)}
                            rows={3}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              formErrors.description ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Digite uma descrição para o conteúdo"
                          />
                          {formErrors.description && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
                          )}
                        </div>

                        {/* Tipo e Categoria */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Tipo
                            </label>
                            <select
                              value={newContentForm.type}
                              onChange={(e) => handleInputChange('content', 'type', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="text">Texto</option>
                              <option value="image">Imagem</option>
                              <option value="video">Vídeo</option>
                              <option value="document">Documento</option>
                              <option value="gallery">Galeria</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Categoria *
                            </label>
                            <select
                              value={newContentForm.category}
                              onChange={(e) => handleInputChange('content', 'category', e.target.value)}
                              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                formErrors.category ? 'border-red-500' : 'border-gray-300'
                              }`}
                            >
                              <option value="">Selecione uma categoria</option>
                              <option value="guias">Guias</option>
                              <option value="videos">Vídeos</option>
                              <option value="fotos">Fotos</option>
                              <option value="artigos">Artigos</option>
                              <option value="noticias">Notícias</option>
                              <option value="eventos">Eventos</option>
                              <option value="promocoes">Promoções</option>
                              <option value="ofertas">Ofertas</option>
                              <option value="black-friday">Black Friday</option>
                              <option value="promocao-relampago">Promoção Relâmpago</option>
                              <option value="descontos">Descontos</option>
                              <option value="lancamentos">Lançamentos</option>
                            </select>
                            {formErrors.category && (
                              <p className="text-red-500 text-sm mt-1">{formErrors.category}</p>
                            )}
                          </div>
                        </div>

                        {/* Idioma e Status */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Idioma
                            </label>
                            <select
                              value={newContentForm.language}
                              onChange={(e) => handleInputChange('content', 'language', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="pt-BR">Português</option>
                              <option value="en-US">Inglês</option>
                              <option value="es-ES">Espanhol</option>
                              <option value="fr-FR">Francês</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Status
                            </label>
                            <select
                              value={newContentForm.status}
                              onChange={(e) => handleInputChange('content', 'status', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="draft">Rascunho</option>
                              <option value="published">Publicado</option>
                              <option value="pending">Pendente</option>
                            </select>
                          </div>
                        </div>

                        {/* Tags */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tags
                          </label>
                          <input
                            type="text"
                            value={newContentForm.tags}
                            onChange={(e) => handleInputChange('content', 'tags', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Digite as tags separadas por vírgula"
                          />
                        </div>

                        {/* Conteúdo */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Conteúdo *
                          </label>
                          <textarea
                            value={newContentForm.content}
                            onChange={(e) => handleInputChange('content', 'content', e.target.value)}
                            rows={6}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              formErrors.content ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Digite o conteúdo principal..."
                          />
                          {formErrors.content && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.content}</p>
                          )}
                        </div>

                        {/* Botões */}
                        <div className="flex justify-end space-x-3 pt-4">
                          <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={handleSubmitContent}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Criar Conteúdo
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {modalType === 'new_category' && (
                  <div>
                    <h4 className="font-semibold text-lg mb-4">Nova Categoria</h4>
                    <div className="space-y-4">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h5 className="font-semibold text-green-900 mb-2">Criar nova categoria para organizar conteúdos</h5>
                        <p className="text-green-700">Preencha os campos abaixo para criar uma nova categoria.</p>
                      </div>
                      
                      <form className="space-y-4">
                        {/* Nome */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nome *
                          </label>
                          <input
                            type="text"
                            value={newCategoryForm.name}
                            onChange={(e) => handleInputChange('category', 'name', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                              formErrors.name ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Digite o nome da categoria"
                          />
                          {formErrors.name && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                          )}
                        </div>

                        {/* Descrição */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descrição *
                          </label>
                          <textarea
                            value={newCategoryForm.description}
                            onChange={(e) => handleInputChange('category', 'description', e.target.value)}
                            rows={3}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                              formErrors.description ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Digite uma descrição para a categoria"
                          />
                          {formErrors.description && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
                          )}
                        </div>

                        {/* Ícone e Cor */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Ícone
                            </label>
                            <select
                              value={newCategoryForm.icon}
                              onChange={(e) => handleInputChange('category', 'icon', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                              <option value="BookOpen">Livro</option>
                              <option value="Camera">Câmera</option>
                              <option value="Play">Play</option>
                              <option value="FileText">Documento</option>
                              <option value="Image">Imagem</option>
                              <option value="Video">Vídeo</option>
                              <option value="Music">Música</option>
                              <option value="Map">Mapa</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Cor
                            </label>
                            <select
                              value={newCategoryForm.color}
                              onChange={(e) => handleInputChange('category', 'color', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                              <option value="bg-blue-500">Azul</option>
                              <option value="bg-green-500">Verde</option>
                              <option value="bg-red-500">Vermelho</option>
                              <option value="bg-purple-500">Roxo</option>
                              <option value="bg-orange-500">Laranja</option>
                              <option value="bg-pink-500">Rosa</option>
                              <option value="bg-indigo-500">Índigo</option>
                              <option value="bg-yellow-500">Amarelo</option>
                            </select>
                          </div>
                        </div>

                        {/* Preview */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h6 className="font-medium text-gray-900 mb-2">Preview da Categoria</h6>
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-lg ${newCategoryForm.color} flex items-center justify-center`}>
                              <span className="text-white text-lg">
                                {newCategoryForm.icon === 'BookOpen' && '📖'}
                                {newCategoryForm.icon === 'Camera' && '📷'}
                                {newCategoryForm.icon === 'Play' && '▶️'}
                                {newCategoryForm.icon === 'FileText' && '📄'}
                                {newCategoryForm.icon === 'Image' && '🖼️'}
                                {newCategoryForm.icon === 'Video' && '🎥'}
                                {newCategoryForm.icon === 'Music' && '🎵'}
                                {newCategoryForm.icon === 'Map' && '🗺️'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{newCategoryForm.name || 'Nome da Categoria'}</p>
                              <p className="text-sm text-gray-600">{newCategoryForm.description || 'Descrição da categoria'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Botões */}
                        <div className="flex justify-end space-x-3 pt-4">
                          <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={handleSubmitCategory}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Criar Categoria
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {modalType === 'manage_languages' && (
                  <div>
                    <h4 className="font-semibold text-lg mb-4">Gerenciamento de Idiomas</h4>
                    <div className="space-y-4">
                      <div className="bg-indigo-50 p-4 rounded-lg">
                        <h5 className="font-semibold text-indigo-900 mb-2">Idiomas Configurados</h5>
                        <p className="text-indigo-700 mb-3">Gerencie os idiomas disponíveis no sistema.</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {languages.map((language) => (
                          <div key={language.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl">{language.flag}</span>
                                <div>
                                  <h6 className="font-medium text-gray-900">{language.name}</h6>
                                  <p className="text-sm text-gray-500">{language.code}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`w-3 h-3 rounded-full ${language.is_active ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                <span className={`text-sm font-medium ${language.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                                  {language.is_active ? 'Ativo' : 'Inativo'}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">{language.content_count} conteúdos</span>
                              <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                                {language.is_active ? 'Desativar' : 'Ativar'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg">
                        <h5 className="font-semibold text-green-900 mb-2">Adicionar Novo Idioma</h5>
                        <p className="text-green-700">
                          Funcionalidade para adicionar novos idiomas será implementada em breve.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {modalType === 'storage_analysis' && (
                  <div>
                    <h4 className="font-semibold text-lg mb-4">Análise de Armazenamento</h4>
                    <div className="space-y-6">
                      {/* Resumo do Armazenamento */}
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <h5 className="font-semibold text-orange-900 mb-2">Resumo do Armazenamento</h5>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-orange-600">{storageData.total_storage}</p>
                            <p className="text-sm text-orange-700">Total</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-red-600">{storageData.used_storage}</p>
                            <p className="text-sm text-red-700">Usado</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">{storageData.available_storage}</p>
                            <p className="text-sm text-green-700">Disponível</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Uso do Armazenamento</span>
                            <span>{storageData.usage_percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-orange-500 h-2 rounded-full" 
                              style={{ width: `${storageData.usage_percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* Breakdown por Tipo */}
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-3">Uso por Tipo de Arquivo</h5>
                        <div className="space-y-3">
                          {storageData.breakdown.map((item, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className={`w-4 h-4 rounded ${item.color}`}></div>
                                <span className="text-sm font-medium text-gray-900">{item.type}</span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <span className="text-sm text-gray-600">{item.size}</span>
                                <span className="text-sm text-gray-500">{item.percentage}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Maiores Arquivos */}
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-3">Maiores Arquivos</h5>
                        <div className="space-y-2">
                          {storageData.largest_files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded ${file.type === 'Vídeo' ? 'bg-red-500' : file.type === 'Imagem' ? 'bg-green-500' : file.type === 'Documento' ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                  <p className="text-xs text-gray-500">{file.type}</p>
                                </div>
                              </div>
                              <span className="text-sm font-medium text-gray-600">{file.size}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h5 className="font-semibold text-blue-900 mb-2">Ações Recomendadas</h5>
                        <div className="space-y-2">
                          <p className="text-sm text-blue-700">• Otimizar vídeos grandes para reduzir espaço</p>
                          <p className="text-sm text-blue-700">• Comprimir imagens em alta resolução</p>
                          <p className="text-sm text-blue-700">• Arquivar conteúdos antigos</p>
                          <p className="text-sm text-blue-700">• Considerar upgrade do plano de armazenamento</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {modalType === 'export_success' && (
                  <div>
                    <div className="text-center">
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                        <Download className="h-6 w-6 text-green-600" />
                      </div>
                      <h4 className="font-semibold text-lg text-gray-900 mb-2">Exportação Concluída!</h4>
                      <p className="text-gray-600 mb-4">
                        Todos os dados foram exportados com sucesso para o arquivo.
                      </p>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h5 className="font-semibold text-green-900 mb-2">Dados Exportados:</h5>
                        <ul className="text-sm text-green-700 space-y-1">
                          <li>• 1.250 conteúdos</li>
                          <li>• 15 categorias</li>
                          <li>• 8 idiomas</li>
                          <li>• Estatísticas completas</li>
                          <li>• Metadados e configurações</li>
                        </ul>
                      </div>
                      <div className="mt-4">
                        <button
                          onClick={() => setShowModal(false)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Fechar
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {modalType === 'import_success' && (
                  <div>
                    <div className="text-center">
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                        <Upload className="h-6 w-6 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-lg text-gray-900 mb-2">Importação Concluída!</h4>
                      <p className="text-gray-600 mb-4">
                        Todos os dados foram importados com sucesso no sistema.
                      </p>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h5 className="font-semibold text-blue-900 mb-2">Dados Importados:</h5>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• 45 novos conteúdos</li>
                          <li>• 3 novas categorias</li>
                          <li>• 2 novos idiomas</li>
                          <li>• Configurações atualizadas</li>
                          <li>• Metadados sincronizados</li>
                        </ul>
                      </div>
                      <div className="mt-4">
                        <button
                          onClick={() => setShowModal(false)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Fechar
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {modalType === 'content_success' && (
                  <div>
                    <div className="text-center">
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-lg text-gray-900 mb-2">Conteúdo Criado com Sucesso!</h4>
                      <p className="text-gray-600 mb-4">
                        O novo conteúdo foi criado e salvo no sistema.
                      </p>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h5 className="font-semibold text-blue-900 mb-2">Detalhes do Conteúdo:</h5>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• Título: {newContentForm.title}</li>
                          <li>• Tipo: {newContentForm.type}</li>
                          <li>• Categoria: {newContentForm.category}</li>
                          <li>• Idioma: {newContentForm.language}</li>
                          <li>• Status: {newContentForm.status}</li>
                        </ul>
                      </div>
                      <div className="mt-4">
                        <button
                          onClick={() => setShowModal(false)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Fechar
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {modalType === 'category_success' && (
                  <div>
                    <div className="text-center">
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                        <Folder className="h-6 w-6 text-green-600" />
                      </div>
                      <h4 className="font-semibold text-lg text-gray-900 mb-2">Categoria Criada com Sucesso!</h4>
                      <p className="text-gray-600 mb-4">
                        A nova categoria foi criada e está disponível para uso.
                      </p>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h5 className="font-semibold text-green-900 mb-2">Detalhes da Categoria:</h5>
                        <ul className="text-sm text-green-700 space-y-1">
                          <li>• Nome: {newCategoryForm.name}</li>
                          <li>• Descrição: {newCategoryForm.description}</li>
                          <li>• Ícone: {newCategoryForm.icon}</li>
                          <li>• Cor: {newCategoryForm.color}</li>
                          <li>• Status: Ativa</li>
                        </ul>
                      </div>
                      <div className="mt-4">
                        <button
                          onClick={() => setShowModal(false)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Fechar
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {modalType === 'manage_content' && (
                  <div>
                    <h4 className="font-semibold text-lg mb-4">Gerenciamento de Conteúdo</h4>
                    <div className="space-y-4">
                      <div className="bg-teal-50 p-4 rounded-lg">
                        <h5 className="font-semibold text-teal-900 mb-2">Gerenciar Conteúdos do Sistema</h5>
                        <p className="text-teal-700">Visualize, edite e exclua conteúdos existentes.</p>
                      </div>
                      
                      <div className="space-y-3">
                        {/* Cabeçalho com seleção em lote */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={selectAll}
                              onChange={handleSelectAll}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">
                              {selectAll ? 'Desmarcar Todos' : 'Selecionar Todos'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {selectedContents.length} de {contents.slice(0, 6).length} selecionados
                          </div>
                        </div>

                        {/* Lista de conteúdos com checkboxes */}
                        {contents.slice(0, 6).map((content) => (
                          <div key={content.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <input
                                  type="checkbox"
                                  checked={selectedContents.includes(content.id)}
                                  onChange={() => handleSelectContent(content.id)}
                                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <div className={`w-10 h-10 rounded-lg ${getTypeColor(content.type)} flex items-center justify-center`}>
                                  {getTypeIcon(content.type)}
                                </div>
                                <div>
                                  <h6 className="font-medium text-gray-900">{content.title}</h6>
                                  <p className="text-sm text-gray-500">{content.category}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(content.status)}`}>
                                  {getStatusText(content.status)}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span>👁️ {formatNumber(content.views)}</span>
                                <span>❤️ {formatNumber(content.likes)}</span>
                                <span>📅 {formatDate(content.created_at)}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleEditContent(content)}
                                  className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
                                >
                                  <Edit className="w-4 h-4" />
                                  <span>Editar</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteContent(content)}
                                  className="text-sm text-red-600 hover:text-red-800 font-medium flex items-center space-x-1"
                                >
                                  <Trash className="w-4 h-4" />
                                  <span>Excluir</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h5 className="font-semibold text-blue-900 mb-2">Ações em Lote</h5>
                        <p className="text-blue-700 mb-3">
                          Selecione um ou mais conteúdos e escolha uma ação para aplicar em lote.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          <button
                            onClick={() => handleBatchAction('publish')}
                            disabled={selectedContents.length === 0}
                            className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                          >
                            📤 Publicar
                          </button>
                          <button
                            onClick={() => handleBatchAction('archive')}
                            disabled={selectedContents.length === 0}
                            className="px-3 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                          >
                            📁 Arquivar
                          </button>
                          <button
                            onClick={() => handleBatchAction('delete')}
                            disabled={selectedContents.length === 0}
                            className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                          >
                            🗑️ Excluir
                          </button>
                          <button
                            onClick={() => handleBatchAction('export')}
                            disabled={selectedContents.length === 0}
                            className="px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                          >
                            📥 Exportar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {modalType === 'edit_content' && selectedContentForEdit && (
                  <div>
                    <h4 className="font-semibold text-lg mb-4">Editar Conteúdo</h4>
                    <div className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h5 className="font-semibold text-blue-900 mb-2">Editar: {selectedContentForEdit.title}</h5>
                        <p className="text-blue-700">Modifique as informações do conteúdo selecionado.</p>
                      </div>
                      
                      <form className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Título
                          </label>
                          <input
                            type="text"
                            defaultValue={selectedContentForEdit.title}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descrição
                          </label>
                          <textarea
                            defaultValue={selectedContentForEdit.description}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Status
                            </label>
                            <select
                              defaultValue={selectedContentForEdit.status}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="draft">Rascunho</option>
                              <option value="published">Publicado</option>
                              <option value="pending">Pendente</option>
                              <option value="archived">Arquivado</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Categoria
                            </label>
                            <select
                              defaultValue={selectedContentForEdit.category}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="guias">Guias</option>
                              <option value="videos">Vídeos</option>
                              <option value="fotos">Fotos</option>
                              <option value="artigos">Artigos</option>
                              <option value="noticias">Notícias</option>
                              <option value="eventos">Eventos</option>
                              <option value="promocoes">Promoções</option>
                              <option value="ofertas">Ofertas</option>
                              <option value="black-friday">Black Friday</option>
                              <option value="promocao-relampago">Promoção Relâmpago</option>
                              <option value="descontos">Descontos</option>
                              <option value="lancamentos">Lançamentos</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                          <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveEdit}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Salvar Alterações
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {modalType === 'delete_content' && selectedContentForDelete && (
                  <div>
                    <div className="text-center">
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                        <Trash className="h-6 w-6 text-red-600" />
                      </div>
                      <h4 className="font-semibold text-lg text-gray-900 mb-2">Confirmar Exclusão</h4>
                      <p className="text-gray-600 mb-4">
                        Tem certeza que deseja excluir o conteúdo &quot;{selectedContentForDelete.title}&quot;?
                      </p>
                      <div className="bg-red-50 p-4 rounded-lg mb-4">
                        <h5 className="font-semibold text-red-900 mb-2">Conteúdo a ser excluído:</h5>
                        <ul className="text-sm text-red-700 space-y-1">
                          <li>• Título: {selectedContentForDelete.title}</li>
                          <li>• Tipo: {selectedContentForDelete.type}</li>
                          <li>• Categoria: {selectedContentForDelete.category}</li>
                          <li>• Status: {getStatusText(selectedContentForDelete.status)}</li>
                          <li>• Visualizações: {formatNumber(selectedContentForDelete.views)}</li>
                        </ul>
                      </div>
                      <div className="flex justify-center space-x-3">
                        <button
                          onClick={() => setShowModal(false)}
                          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleConfirmDelete}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Confirmar Exclusão
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {modalType === 'edit_success' && (
                  <div>
                    <div className="text-center">
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                        <Edit className="h-6 w-6 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-lg text-gray-900 mb-2">Conteúdo Editado com Sucesso!</h4>
                      <p className="text-gray-600 mb-4">
                        As alterações foram salvas no sistema.
                      </p>
                      <div className="mt-4">
                        <button
                          onClick={() => setShowModal(false)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Fechar
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {modalType === 'delete_success' && (
                  <div>
                    <div className="text-center">
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                        <Trash className="h-6 w-6 text-green-600" />
                      </div>
                      <h4 className="font-semibold text-lg text-gray-900 mb-2">Conteúdo Excluído com Sucesso!</h4>
                      <p className="text-gray-600 mb-4">
                        O conteúdo foi removido do sistema.
                      </p>
                      <div className="mt-4">
                        <button
                          onClick={() => setShowModal(false)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Fechar
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {modalType === 'batch_action' && (
                  <div>
                    <div className="text-center">
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 mb-4">
                        <Settings className="h-6 w-6 text-orange-600" />
                      </div>
                      <h4 className="font-semibold text-lg text-gray-900 mb-2">Confirmar Ação em Lote</h4>
                      <p className="text-gray-600 mb-4">
                        Tem certeza que deseja {batchAction === 'publish' ? 'publicar' : 
                          batchAction === 'archive' ? 'arquivar' : 
                          batchAction === 'delete' ? 'excluir' : 
                          'exportar'} {selectedContents.length} conteúdo(s) selecionado(s)?
                      </p>
                      <div className="bg-orange-50 p-4 rounded-lg mb-4">
                        <h5 className="font-semibold text-orange-900 mb-2">Ação a ser executada:</h5>
                        <ul className="text-sm text-orange-700 space-y-1">
                          <li>• Tipo: {batchAction === 'publish' ? 'Publicar Conteúdos' : 
                            batchAction === 'archive' ? 'Arquivar Conteúdos' : 
                            batchAction === 'delete' ? 'Excluir Conteúdos' : 
                            'Exportar Conteúdos'}</li>
                          <li>• Quantidade: {selectedContents.length} item(s)</li>
                          <li>• Status: {batchAction === 'publish' ? 'Serão publicados' : 
                            batchAction === 'archive' ? 'Serão arquivados' : 
                            batchAction === 'delete' ? 'Serão excluídos permanentemente' : 
                            'Serão exportados'}</li>
                        </ul>
                      </div>
                      <div className="flex justify-center space-x-3">
                        <button
                          onClick={() => setShowModal(false)}
                          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleConfirmBatchAction}
                          className={`px-4 py-2 text-white rounded-lg transition-colors ${
                            batchAction === 'publish' ? 'bg-green-600 hover:bg-green-700' :
                            batchAction === 'archive' ? 'bg-yellow-600 hover:bg-yellow-700' :
                            batchAction === 'delete' ? 'bg-red-600 hover:bg-red-700' :
                            'bg-purple-600 hover:bg-purple-700'
                          }`}
                        >
                          Confirmar Ação
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {modalType === 'batch_success' && (
                  <div>
                    <div className="text-center">
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <h4 className="font-semibold text-lg text-gray-900 mb-2">Ação em Lote Executada!</h4>
                      <p className="text-gray-600 mb-4">
                        A ação foi aplicada com sucesso aos conteúdos selecionados.
                      </p>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h5 className="font-semibold text-green-900 mb-2">Detalhes da Operação:</h5>
                        <ul className="text-sm text-green-700 space-y-1">
                          <li>• Ação: {batchAction === 'publish' ? 'Publicação' : 
                            batchAction === 'archive' ? 'Arquivamento' : 
                            batchAction === 'delete' ? 'Exclusão' : 
                            'Exportação'}</li>
                          <li>• Itens processados: {selectedContents.length}</li>
                          <li>• Status: Concluído com sucesso</li>
                          <li>• Tempo: 2 segundos</li>
                        </ul>
                      </div>
                      <div className="mt-4">
                        <button
                          onClick={() => setShowModal(false)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Fechar
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {modalType === 'export_advanced' && (
                  <div>
                    <h4 className="font-semibold text-lg mb-4">Exportação Avançada</h4>
                    <div className="space-y-6">
                      {/* Configurações de Formato */}
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h5 className="font-semibold text-blue-900 mb-3">Formato de Exportação</h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {[
                            { value: 'json', label: 'JSON', icon: '📄', desc: 'Estruturado' },
                            { value: 'csv', label: 'CSV', icon: '📊', desc: 'Planilha' },
                            { value: 'xml', label: 'XML', icon: '🔗', desc: 'Estruturado' },
                            { value: 'excel', label: 'Excel', icon: '📈', desc: 'Planilha' },
                            { value: 'pdf', label: 'PDF', icon: '📋', desc: 'Relatório' },
                            { value: 'zip', label: 'ZIP', icon: '📦', desc: 'Compactado' },
                            { value: 'sql', label: 'SQL', icon: '🗄️', desc: 'Banco de dados' },
                            { value: 'yaml', label: 'YAML', icon: '⚙️', desc: 'Configuração' }
                          ].map((format) => (
                            <button
                              key={format.value}
                              onClick={() => handleExportFormChange('format', format.value)}
                              className={`p-3 rounded-lg border-2 transition-colors ${
                                exportForm.format === format.value
                                  ? 'border-blue-500 bg-blue-100'
                                  : 'border-gray-200 bg-white hover:border-blue-300'
                              }`}
                            >
                              <div className="text-2xl mb-1">{format.icon}</div>
                              <div className="font-medium text-sm">{format.label}</div>
                              <div className="text-xs text-gray-600">{format.desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Opções de Conteúdo */}
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h5 className="font-semibold text-green-900 mb-3">Opções de Conteúdo</h5>
                        <div className="space-y-3">
                          <label className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={exportForm.includeMetadata}
                              onChange={(e) => handleExportFormChange('includeMetadata', e.target.checked)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm">Incluir metadados (tags, categorias, idiomas)</span>
                          </label>
                          <label className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={exportForm.includeStats}
                              onChange={(e) => handleExportFormChange('includeStats', e.target.checked)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm">Incluir estatísticas (visualizações, likes, shares)</span>
                          </label>
                          <label className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={exportForm.includeRelations}
                              onChange={(e) => handleExportFormChange('includeRelations', e.target.checked)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm">Incluir relacionamentos (categorias, idiomas)</span>
                          </label>
                          <label className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={exportForm.compression}
                              onChange={(e) => handleExportFormChange('compression', e.target.checked)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm">Comprimir arquivo (ZIP)</span>
                          </label>
                        </div>
                      </div>

                      {/* Filtros */}
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h5 className="font-semibold text-purple-900 mb-3">Filtros de Exportação</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Período de Data
                            </label>
                            <select
                              value={exportForm.dateRange}
                              onChange={(e) => handleExportFormChange('dateRange', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="all">Todas as datas</option>
                              <option value="today">Hoje</option>
                              <option value="week">Última semana</option>
                              <option value="month">Último mês</option>
                              <option value="quarter">Último trimestre</option>
                              <option value="year">Último ano</option>
                              <option value="custom">Período personalizado</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Categorias
                            </label>
                            <select
                              multiple
                              value={exportForm.categories}
                              onChange={(e) => {
                                const selected = Array.from(e.target.selectedOptions, option => option.value);
                                handleExportFormChange('categories', selected);
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="guias">Guias</option>
                              <option value="videos">Vídeos</option>
                              <option value="fotos">Fotos</option>
                              <option value="artigos">Artigos</option>
                              <option value="noticias">Notícias</option>
                              <option value="eventos">Eventos</option>
                              <option value="promocoes">Promoções</option>
                              <option value="ofertas">Ofertas</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Histórico de Exportações */}
                      {exportHistory.length > 0 && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h5 className="font-semibold text-gray-900 mb-3">Histórico de Exportações</h5>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {exportHistory.slice(0, 5).map((exportItem, index) => (
                              <div key={index} className="flex items-center justify-between text-sm bg-white p-2 rounded">
                                <div>
                                  <span className="font-medium">{exportItem.format.toUpperCase()}</span>
                                  <span className="text-gray-600 ml-2">• {exportItem.records} registros</span>
                                </div>
                                <div className="text-gray-500">
                                  {new Date(exportItem.timestamp).toLocaleDateString('pt-BR')}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Botões de Ação */}
                      <div className="flex justify-end space-x-3 pt-4">
                        <button
                          onClick={() => setShowModal(false)}
                          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleExportData}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Exportar Dados
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {modalType === 'import_advanced' && (
                  <div>
                    <h4 className="font-semibold text-lg mb-4">Importação Avançada</h4>
                    <div className="space-y-6">
                      {/* Seleção de Arquivo */}
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h5 className="font-semibold text-blue-900 mb-3">Selecionar Arquivo</h5>
                        <div className="space-y-3">
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <input
                              type="file"
                              onChange={handleFileSelect}
                              accept=".json,.csv,.xml,.xlsx,.xls,.zip,.sql,.yaml,.yml"
                              className="hidden"
                              id="file-upload"
                            />
                            <label htmlFor="file-upload" className="cursor-pointer">
                              <div className="text-4xl mb-2">📁</div>
                              <div className="text-lg font-medium text-gray-700">
                                {importForm.selectedFile ? importForm.selectedFile.name : 'Clique para selecionar arquivo'}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                Formatos suportados: JSON, CSV, XML, Excel, ZIP, SQL, YAML
                              </div>
                            </label>
                          </div>
                          
                          {importPreview && (
                            <div className="bg-white p-4 rounded-lg border">
                              <h6 className="font-medium text-gray-900 mb-2">Preview do Arquivo</h6>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Nome:</span>
                                  <span className="ml-2 font-medium">{importPreview.fileName}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Tamanho:</span>
                                  <span className="ml-2 font-medium">{importPreview.fileSize}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Formato:</span>
                                  <span className="ml-2 font-medium">{importPreview.format}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Registros:</span>
                                  <span className="ml-2 font-medium">{importPreview.records}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Configurações de Importação */}
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h5 className="font-semibold text-green-900 mb-3">Configurações de Importação</h5>
                        <div className="space-y-3">
                          <label className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={importForm.updateExisting}
                              onChange={(e) => handleImportFormChange('updateExisting', e.target.checked)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm">Atualizar registros existentes</span>
                          </label>
                          <label className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={importForm.createMissing}
                              onChange={(e) => handleImportFormChange('createMissing', e.target.checked)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm">Criar categorias/idiomas ausentes</span>
                          </label>
                          <label className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={importForm.validateData}
                              onChange={(e) => handleImportFormChange('validateData', e.target.checked)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm">Validar dados antes da importação</span>
                          </label>
                          <label className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={importForm.backupBeforeImport}
                              onChange={(e) => handleImportFormChange('backupBeforeImport', e.target.checked)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm">Criar backup antes da importação</span>
                          </label>
                        </div>
                      </div>

                      {/* Formatos Suportados */}
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h5 className="font-semibold text-purple-900 mb-3">Formatos Suportados</h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {[
                            { format: 'JSON', icon: '📄', desc: 'Estruturado', ext: '.json' },
                            { format: 'CSV', icon: '📊', desc: 'Planilha', ext: '.csv' },
                            { format: 'XML', icon: '🔗', desc: 'Estruturado', ext: '.xml' },
                            { format: 'Excel', icon: '📈', desc: 'Planilha', ext: '.xlsx/.xls' },
                            { format: 'ZIP', icon: '📦', desc: 'Compactado', ext: '.zip' },
                            { format: 'SQL', icon: '🗄️', desc: 'Banco de dados', ext: '.sql' },
                            { format: 'YAML', icon: '⚙️', desc: 'Configuração', ext: '.yaml/.yml' },
                            { format: 'PDF', icon: '📋', desc: 'Relatório', ext: '.pdf' }
                          ].map((format) => (
                            <div key={format.format} className="text-center p-3 bg-white rounded-lg border">
                              <div className="text-2xl mb-1">{format.icon}</div>
                              <div className="font-medium text-sm">{format.format}</div>
                              <div className="text-xs text-gray-600">{format.desc}</div>
                              <div className="text-xs text-blue-600 font-mono">{format.ext}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Histórico de Importações */}
                      {importHistory.length > 0 && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h5 className="font-semibold text-gray-900 mb-3">Histórico de Importações</h5>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {importHistory.slice(0, 5).map((importItem, index) => (
                              <div key={index} className="flex items-center justify-between text-sm bg-white p-2 rounded">
                                <div>
                                  <span className="font-medium">{importItem.fileName}</span>
                                  <span className="text-gray-600 ml-2">• {importItem.records} registros</span>
                                </div>
                                <div className="text-gray-500">
                                  {new Date(importItem.timestamp).toLocaleDateString('pt-BR')}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Botões de Ação */}
                      <div className="flex justify-end space-x-3 pt-4">
                        <button
                          onClick={() => setShowModal(false)}
                          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Cancelar
                        </button>
                        {importForm.selectedFile && (
                          <button
                            onClick={handleValidateImport}
                            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                          >
                            Validar
                          </button>
                        )}
                        <button
                          onClick={handleImportData}
                          disabled={!importForm.selectedFile}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                          Importar Dados
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {modalType === 'import_validation' && (
                  <div>
                    <div className="text-center">
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                        <CheckCircle className="h-6 w-6 text-yellow-600" />
                      </div>
                      <h4 className="font-semibold text-lg text-gray-900 mb-2">Validação Concluída</h4>
                      <p className="text-gray-600 mb-4">
                        O arquivo foi validado com sucesso e está pronto para importação.
                      </p>
                      <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                        <h5 className="font-semibold text-yellow-900 mb-2">Resultado da Validação:</h5>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          <li>✅ Estrutura de dados válida</li>
                          <li>✅ Campos obrigatórios presentes</li>
                          <li>✅ Tipos de dados corretos</li>
                          <li>✅ Relacionamentos válidos</li>
                          <li>⚠️ 2 avisos menores encontrados</li>
                        </ul>
                      </div>
                      <div className="mt-4">
                        <button
                          onClick={() => setShowModal(false)}
                          className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                        >
                          Continuar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                <p className="text-gray-900">Processando...</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
} 