import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { useRouter } from 'next/router';
import { 
  FileText, 
  Upload, 
  Download, 
  Search, 
  Filter, 
  Plus,
  Edit,
  Trash,
  Eye,
  Folder,
  File,
  Image,
  Video,
  Archive,
  Calendar,
  User,
  Tag,
  MoreVertical,
  Grid,
  List,
  SortAsc,
  SortDesc
} from 'lucide-react';

interface Document {
  id: number;
  name: string;
  description: string;
  type: 'pdf' | 'doc' | 'docx' | 'xls' | 'xlsx' | 'jpg' | 'png' | 'mp4' | 'zip';
  size: number;
  category: string;
  tags: string[];
  uploaded_by: string;
  uploaded_at: string;
  last_modified: string;
  status: 'active' | 'archived' | 'deleted';
  url: string;
  thumbnail?: string;
}

interface DocumentCategory {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  document_count: number;
}

export default function DocumentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Dados simulados - em produção viriam da API
  const [documents] = useState<Document[]>([
    {
      id: 1,
      name: 'Contrato de Viagem - Rio de Janeiro',
      description: 'Contrato detalhado para pacote de viagem ao Rio de Janeiro',
      type: 'pdf',
      size: 2048576, // 2MB
      category: 'Contratos',
      tags: ['viagem', 'rio de janeiro', 'contrato'],
      uploaded_by: 'João Silva',
      uploaded_at: '2024-01-15T10:30:00Z',
      last_modified: '2024-01-15T10:30:00Z',
      status: 'active',
      url: '/api/documents/1',
      thumbnail: '/api/placeholder/200/150'
    },
    {
      id: 2,
      name: 'Relatório Financeiro Q4 2024',
      description: 'Relatório financeiro do quarto trimestre de 2024',
      type: 'xlsx',
      size: 1048576, // 1MB
      category: 'Relatórios',
      tags: ['financeiro', 'relatório', 'q4'],
      uploaded_by: 'Maria Santos',
      uploaded_at: '2024-01-10T14:20:00Z',
      last_modified: '2024-01-12T09:15:00Z',
      status: 'active',
      url: '/api/documents/2'
    },
    {
      id: 3,
      name: 'Fotos da Viagem - Paris',
      description: 'Galeria de fotos da viagem a Paris',
      type: 'jpg',
      size: 5242880, // 5MB
      category: 'Fotos',
      tags: ['paris', 'fotos', 'viagem'],
      uploaded_by: 'Pedro Costa',
      uploaded_at: '2024-01-08T16:45:00Z',
      last_modified: '2024-01-08T16:45:00Z',
      status: 'active',
      url: '/api/documents/3',
      thumbnail: '/api/placeholder/200/150'
    },
    {
      id: 4,
      name: 'Manual de Procedimentos',
      description: 'Manual completo de procedimentos da empresa',
      type: 'docx',
      size: 3145728, // 3MB
      category: 'Manuais',
      tags: ['manual', 'procedimentos', 'empresa'],
      uploaded_by: 'Ana Oliveira',
      uploaded_at: '2024-01-05T11:00:00Z',
      last_modified: '2024-01-07T15:30:00Z',
      status: 'active',
      url: '/api/documents/4'
    }
  ]);

  const [categories] = useState<DocumentCategory[]>([
    {
      id: 1,
      name: 'Contratos',
      description: 'Documentos contratuais',
      icon: '📄',
      color: 'bg-blue-100 text-blue-800',
      document_count: 15
    },
    {
      id: 2,
      name: 'Relatórios',
      description: 'Relatórios financeiros e operacionais',
      icon: '📊',
      color: 'bg-green-100 text-green-800',
      document_count: 23
    },
    {
      id: 3,
      name: 'Fotos',
      description: 'Imagens e fotografias',
      icon: '📷',
      color: 'bg-purple-100 text-purple-800',
      document_count: 45
    },
    {
      id: 4,
      name: 'Manuais',
      description: 'Manuais e procedimentos',
      icon: '📚',
      color: 'bg-orange-100 text-orange-800',
      document_count: 8
    },
    {
      id: 5,
      name: 'Vídeos',
      description: 'Vídeos promocionais e treinamentos',
      icon: '🎥',
      color: 'bg-red-100 text-red-800',
      document_count: 12
    }
  ]);

  const [stats] = useState({
    total_documents: 103,
    total_size: 256000000, // 256MB
    categories_count: 8,
    recent_uploads: 15,
    storage_used: 75.5, // 75.5%
    storage_limit: 500000000 // 500MB
  });

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="h-6 w-6 text-red-500" />;
      case 'doc':
      case 'docx': return <FileText className="h-6 w-6 text-blue-500" />;
      case 'xls':
      case 'xlsx': return <FileText className="h-6 w-6 text-green-500" />;
      case 'jpg':
      case 'png': return <Image className="h-6 w-6 text-purple-500" />;
      case 'mp4': return <Video className="h-6 w-6 text-red-500" />;
      case 'zip': return <Archive className="h-6 w-6 text-orange-500" />;
      default: return <File className="h-6 w-6 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesTab = activeTab === 'all' || doc.status === activeTab;
    
    return matchesSearch && matchesCategory && matchesTab;
  });

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'date':
        aValue = new Date(a.uploaded_at).getTime();
        bValue = new Date(b.uploaded_at).getTime();
        break;
      case 'size':
        aValue = a.size;
        bValue = b.size;
        break;
      case 'type':
        aValue = a.type;
        bValue = b.type;
        break;
      default:
        return 0;
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <button
                  onClick={handleBackToDashboard}
                  className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  ← Voltar
                </button>
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestão de Documentos</h1>
                    <p className="text-sm text-gray-500">Organize e gerencie todos os documentos</p>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowUploadModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total de Documentos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_documents}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Folder className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Categorias</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.categories_count}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Upload className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Uploads Recentes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.recent_uploads}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Archive className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Armazenamento</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.storage_used}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Storage Progress */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Uso de Armazenamento</span>
              <span className="text-sm text-gray-500">
                {formatFileSize(stats.total_size)} / {formatFileSize(stats.storage_limit)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${stats.storage_used}%` }}
              ></div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                {[
                  { id: 'all', name: 'Todos', count: documents.length },
                  { id: 'active', name: 'Ativos', count: documents.filter(d => d.status === 'active').length },
                  { id: 'archived', name: 'Arquivados', count: documents.filter(d => d.status === 'archived').length }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.name}
                    <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Filters and Search */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Buscar documentos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todas as categorias</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.name} ({category.document_count})
                    </option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="date">Data</option>
                  <option value="name">Nome</option>
                  <option value="size">Tamanho</option>
                  <option value="type">Tipo</option>
                </select>

                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </button>

                <div className="flex border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Documents List */}
            <div className="p-6">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {sortedDocuments.map((doc) => (
                    <div key={doc.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          {getFileIcon(doc.type)}
                          <div className="flex space-x-1">
                            <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                              <Trash className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        <h3 className="font-medium text-gray-900 mb-1 truncate">{doc.name}</h3>
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{doc.description}</p>
                        
                        <div className="space-y-2 text-xs text-gray-500">
                          <div className="flex justify-between">
                            <span>Tamanho:</span>
                            <span>{formatFileSize(doc.size)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Categoria:</span>
                            <span>{doc.category}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Upload:</span>
                            <span>{formatDate(doc.uploaded_at)}</span>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex flex-wrap gap-1">
                          {doc.tags.slice(0, 2).map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              #{tag}
                            </span>
                          ))}
                          {doc.tags.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              +{doc.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                      <div className="flex items-center space-x-4">
                        {getFileIcon(doc.type)}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{doc.name}</h3>
                          <p className="text-sm text-gray-500 truncate">{doc.description}</p>
                          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                            <span>{doc.category}</span>
                            <span>{formatFileSize(doc.size)}</span>
                            <span>por {doc.uploaded_by}</span>
                            <span>{formatDate(doc.uploaded_at)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                          <Download className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Upload de Documento</h3>
              <p className="text-gray-500 mb-4">Funcionalidade em desenvolvimento...</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Upload
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
} 