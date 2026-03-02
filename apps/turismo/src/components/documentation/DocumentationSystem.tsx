import React, { useState, useEffect } from 'react';
import { FileText, BookOpen, Search, Plus, Edit, Trash2, Download, Share, Eye, Clock, User, Tag, FolderOpen, ArrowRight } from 'lucide-react';
import { Card, Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger, Input, Select, Modal, Textarea } from '../ui';
import { useUIStore } from '../../stores/useUIStore';

interface DocumentationItem {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  createdAt: string;
  updatedAt: string;
  version: string;
  status: 'draft' | 'published' | 'archived';
  views: number;
  downloads: number;
}

interface DocumentationCategory {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  color: string;
}

interface DocumentationSystemProps {
  onDocumentCreated?: (document: DocumentationItem) => void;
  onDocumentUpdated?: (document: DocumentationItem) => void;
  onDocumentDeleted?: (id: string) => void;
}

const DocumentationSystem: React.FC<DocumentationSystemProps> = ({
  onDocumentCreated,
  onDocumentUpdated,
  onDocumentDeleted
}) => {
  const [documents, setDocuments] = useState<DocumentationItem[]>([]);
  const [categories, setCategories] = useState<DocumentationCategory[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<DocumentationItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  const { showNotification } = useUIStore();

  // Mock data
  useEffect(() => {
    const mockCategories: DocumentationCategory[] = [
      { id: 'user-guide', name: 'Guia do Usuário', description: 'Documentação para usuários finais', itemCount: 12, color: 'bg-blue-500' },
      { id: 'api', name: 'Documentação da API', description: 'Referência completa da API', itemCount: 8, color: 'bg-green-500' },
      { id: 'deployment', name: 'Deploy e DevOps', description: 'Guia de implantação e operações', itemCount: 6, color: 'bg-purple-500' },
      { id: 'troubleshooting', name: 'Solução de Problemas', description: 'FAQ e resolução de erros', itemCount: 15, color: 'bg-orange-500' },
      { id: 'development', name: 'Desenvolvimento', description: 'Guia para desenvolvedores', itemCount: 10, color: 'bg-indigo-500' }
    ];

    const mockDocuments: DocumentationItem[] = [
      {
        id: '1',
        title: 'Primeiros Passos no Sistema RSV',
        content: 'Guia completo para começar a usar o sistema de onboarding RSV...',
        category: 'user-guide',
        tags: ['iniciante', 'onboarding', 'primeiros-passos'],
        author: 'Equipe RSV',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-20',
        version: '1.2',
        status: 'published',
        views: 1250,
        downloads: 89
      },
      {
        id: '2',
        title: 'API de Reservas - Referência Completa',
        content: 'Documentação completa da API de reservas incluindo endpoints, parâmetros...',
        category: 'api',
        tags: ['api', 'reservas', 'endpoints', 'rest'],
        author: 'Dev Team',
        createdAt: '2024-01-10',
        updatedAt: '2024-01-18',
        version: '2.1',
        status: 'published',
        views: 890,
        downloads: 156
      },
      {
        id: '3',
        title: 'Deploy em Produção - VPS ICP MAX',
        content: 'Guia detalhado para deploy do sistema em ambiente de produção...',
        category: 'deployment',
        tags: ['deploy', 'vps', 'docker', 'produção'],
        author: 'DevOps Team',
        createdAt: '2024-01-05',
        updatedAt: '2024-01-15',
        version: '1.0',
        status: 'published',
        views: 567,
        downloads: 234
      }
    ];

    setCategories(mockCategories);
    setDocuments(mockDocuments);
  }, []);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateDocument = () => {
    setShowCreateModal(true);
  };

  const handleEditDocument = (document: DocumentationItem) => {
    setSelectedDocument(document);
    setShowEditModal(true);
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(docs => docs.filter(doc => doc.id !== id));
    onDocumentDeleted?.(id);
    showNotification('Documento excluído com sucesso!', 'success');
  };

  const handleDownload = (document: DocumentationItem) => {
    // Simular download
    const content = `${document.title}\n\n${document.content}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${document.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    // Atualizar contador de downloads
    setDocuments(docs => docs.map(doc => 
      doc.id === document.id ? { ...doc, downloads: doc.downloads + 1 } : doc
    ));
    
    showNotification('Download iniciado!', 'success');
  };

  const handleShare = (document: DocumentationItem) => {
    navigator.clipboard.writeText(`${window.location.origin}/docs/${document.id}`);
    showNotification('Link copiado para a área de transferência!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sistema de Documentação</h2>
          <p className="text-gray-600">Gerencie toda a documentação do sistema RSV</p>
        </div>
        <Button onClick={handleCreateDocument} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Documento
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar documentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <option value="all">Todas as Categorias</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name} ({category.itemCount})
            </option>
          ))}
        </Select>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Documentos</p>
              <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Eye className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Visualizações</p>
              <p className="text-2xl font-bold text-gray-900">
                {documents.reduce((sum, doc) => sum + doc.views, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Download className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Downloads</p>
              <p className="text-2xl font-bold text-gray-900">
                {documents.reduce((sum, doc) => sum + doc.downloads, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Categorias</p>
              <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Categorias */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Categorias de Documentação</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(category => (
              <div
                key={category.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                  selectedCategory === category.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{category.name}</h4>
                    <p className="text-sm text-gray-600">{category.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{category.itemCount} documentos</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Lista de Documentos */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Documentos {selectedCategory !== 'all' && `- ${categories.find(c => c.id === selectedCategory)?.name}`}
          </h3>
          
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum documento encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDocuments.map(document => {
                const category = categories.find(c => c.id === document.category);
                return (
                  <div key={document.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900">{document.title}</h4>
                          <Badge variant={document.status === 'published' ? 'default' : 'secondary'}>
                            {document.status === 'published' ? 'Publicado' : 
                             document.status === 'draft' ? 'Rascunho' : 'Arquivado'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            v{document.version}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{document.content}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {document.author}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(document.updatedAt).toLocaleDateString('pt-BR')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {document.views} visualizações
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="h-3 w-3" />
                            {document.downloads} downloads
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-3">
                          {category && (
                            <Badge variant="outline" className="text-xs">
                              {category.name}
                            </Badge>
                          )}
                          {document.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(document)}
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShare(document)}
                          title="Compartilhar"
                        >
                          <Share className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditDocument(document)}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteDocument(document.id)}
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Modal de Criação */}
      <Modal open={showCreateModal} onOpenChange={setShowCreateModal}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Novo Documento</h3>
          <div className="space-y-4">
            <Input placeholder="Título do documento" />
            <Select>
              <option value="">Selecionar categoria</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
            <Textarea placeholder="Conteúdo do documento" rows={6} />
            <Input placeholder="Tags (separadas por vírgula)" />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancelar
              </Button>
              <Button onClick={() => {
                setShowCreateModal(false);
                showNotification('Documento criado com sucesso!', 'success');
              }}>
                Criar Documento
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal de Edição */}
      <Modal open={showEditModal} onOpenChange={setShowEditModal}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Editar Documento</h3>
          {selectedDocument && (
            <div className="space-y-4">
              <Input defaultValue={selectedDocument.title} placeholder="Título do documento" />
              <Select defaultValue={selectedDocument.category}>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
              <Textarea defaultValue={selectedDocument.content} placeholder="Conteúdo do documento" rows={6} />
              <Input defaultValue={selectedDocument.tags.join(', ')} placeholder="Tags (separadas por vírgula)" />
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowEditModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => {
                  setShowEditModal(false);
                  showNotification('Documento atualizado com sucesso!', 'success');
                }}>
                  Salvar Alterações
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export { DocumentationSystem };
export type { DocumentationItem, DocumentationCategory, DocumentationSystemProps };
