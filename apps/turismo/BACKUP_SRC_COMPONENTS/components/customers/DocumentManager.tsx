import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  Image, 
  File, 
  Download, 
  Eye, 
  Trash2, 
  X, 
  Plus,
  CheckCircle,
  AlertCircle,
  Clock,
  Search,
  Filter,
  User,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select, SelectOption } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { useUIStore } from '../../stores/useUIStore';

export interface CustomerDocument {
  id: string;
  name: string;
  type: 'cpf' | 'rg' | 'passport' | 'vaccine' | 'medical' | 'insurance' | 'other';
  url: string;
  size: number;
  uploadedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  customerId: string;
  customerName: string;
  notes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
}

export interface DocumentManagerProps {
  documents: CustomerDocument[];
  onUpload?: (files: File[], type: string, customerId: string) => void;
  onDelete?: (documentId: string) => void;
  onUpdateStatus?: (documentId: string, status: 'approved' | 'rejected', notes?: string) => void;
  onDownload?: (document: CustomerDocument) => void;
  onPreview?: (document: CustomerDocument) => void;
  className?: string;
}

const documentTypeOptions: SelectOption[] = [
  { value: 'cpf', label: 'CPF' },
  { value: 'rg', label: 'RG' },
  { value: 'passport', label: 'Passaporte' },
  { value: 'vaccine', label: 'Carteira de Vacinação' },
  { value: 'medical', label: 'Atestado Médico' },
  { value: 'insurance', label: 'Seguro Viagem' },
  { value: 'other', label: 'Outro' },
];

const statusOptions: SelectOption[] = [
  { value: 'all', label: 'Todos os Status' },
  { value: 'pending', label: 'Pendente' },
  { value: 'approved', label: 'Aprovado' },
  { value: 'rejected', label: 'Rejeitado' },
];

const DocumentManager: React.FC<DocumentManagerProps> = ({
  documents,
  onUpload,
  onDelete,
  onUpdateStatus,
  onDownload,
  onPreview,
  className
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<CustomerDocument | null>(null);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadType, setUploadType] = useState('cpf');
  const [uploadCustomerId, setUploadCustomerId] = useState('');
  const [uploadCustomerName, setUploadCustomerName] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [newStatus, setNewStatus] = useState<'approved' | 'rejected'>('approved');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showNotification } = useUIStore();

  // Filtros
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (uploadFiles.length === 0 || !uploadCustomerId) {
      showNotification('Selecione arquivos e um cliente para fazer upload', 'error');
      return;
    }

    if (onUpload) {
      onUpload(uploadFiles, uploadType, uploadCustomerId);
      showNotification(`${uploadFiles.length} documento(s) enviado(s) com sucesso!`, 'success');
      setShowUploadModal(false);
      setUploadFiles([]);
      setUploadType('cpf');
      setUploadCustomerId('');
      setUploadCustomerName('');
    }
  };

  const handleDelete = (document: CustomerDocument) => {
    if (window.confirm(`Tem certeza que deseja excluir o documento "${document.name}"?`)) {
      if (onDelete) {
        onDelete(document.id);
        showNotification('Documento excluído com sucesso!', 'success');
      }
    }
  };

  const handleStatusUpdate = () => {
    if (!selectedDocument || !newStatus) return;

    if (onUpdateStatus) {
      onUpdateStatus(selectedDocument.id, newStatus, statusNotes);
      showNotification(`Status do documento atualizado para ${newStatus === 'approved' ? 'Aprovado' : 'Rejeitado'}`, 'success');
      setShowStatusModal(false);
      setSelectedDocument(null);
      setStatusNotes('');
      setNewStatus('approved');
    }
  };

  const openPreview = (document: CustomerDocument) => {
    setSelectedDocument(document);
    setShowPreviewModal(true);
  };

  const openStatusUpdate = (document: CustomerDocument) => {
    setSelectedDocument(document);
    setNewStatus(document.status === 'pending' ? 'approved' : document.status);
    setStatusNotes(document.notes || '');
    setShowStatusModal(true);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'cpf': return '📄';
      case 'rg': return '🆔';
      case 'passport': return '🛂';
      case 'vaccine': return '💉';
      case 'medical': return '🏥';
      case 'insurance': return '🛡️';
      default: return '📋';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprovado';
      case 'pending': return 'Pendente';
      case 'rejected': return 'Rejeitado';
      default: return status;
    }
  };

  const isImageFile = (url: string) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    return imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
  };

  const isPdfFile = (url: string) => {
    return url.toLowerCase().endsWith('.pdf');
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Documentos</h2>
          <p className="text-gray-600">
            {filteredDocuments.length} documento{filteredDocuments.length !== 1 ? 's' : ''} encontrado{filteredDocuments.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <Button onClick={() => setShowUploadModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Upload Documentos
        </Button>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Buscar por nome do documento ou cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
          
          <Select
            label="Tipo de Documento"
            options={[{ value: 'all', label: 'Todos os Tipos' }, ...documentTypeOptions]}
            value={typeFilter}
            onChange={setTypeFilter}
          />
          
          <Select
            label="Status"
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
          />
          
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('all');
                setStatusFilter('all');
              }}
              className="w-full"
            >
              Limpar Filtros
            </Button>
          </div>
        </div>
      </Card>

      {/* Lista de documentos */}
      <div className="space-y-4">
        {filteredDocuments.map((document) => (
          <Card key={document.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className="text-3xl">{getDocumentTypeIcon(document.type)}</div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-semibold text-gray-900">{document.name}</h3>
                    <Badge variant={getStatusColor(document.status)}>
                      {getStatusLabel(document.status)}
                    </Badge>
                    <Badge variant="outline">{document.type.toUpperCase()}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>{document.customerName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4" />
                      <span>{formatFileSize(document.size)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>{format(document.uploadedAt, 'dd/MM/yyyy', { locale: ptBR })}</span>
                    </div>
                    {document.reviewedBy && (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Revisado por {document.reviewedBy}</span>
                      </div>
                    )}
                  </div>
                  
                  {document.notes && (
                    <p className="text-sm text-gray-600 italic">"{document.notes}"</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {onPreview && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openPreview(document)}
                    title="Visualizar documento"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                )}
                
                {onDownload && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDownload(document)}
                    title="Download documento"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                )}
                
                {onUpdateStatus && document.status === 'pending' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openStatusUpdate(document)}
                    title="Atualizar status"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                )}
                
                {onDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(document)}
                    className="text-red-600 hover:text-red-700"
                    title="Excluir documento"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}

        {/* Mensagem quando não há documentos */}
        {filteredDocuments.length === 0 && (
          <Card className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum documento encontrado</h3>
            <p className="text-gray-600">
              Tente ajustar os filtros de busca ou fazer upload de novos documentos.
            </p>
          </Card>
        )}
      </div>

      {/* Modal de Upload */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload de Documentos"
        size="2xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="ID do Cliente"
              placeholder="Digite o ID do cliente"
              value={uploadCustomerId}
              onChange={(e) => setUploadCustomerId(e.target.value)}
            />
            <Input
              label="Nome do Cliente"
              placeholder="Digite o nome do cliente"
              value={uploadCustomerName}
              onChange={(e) => setUploadCustomerName(e.target.value)}
            />
          </div>
          
          <Select
            label="Tipo de Documento"
            options={documentTypeOptions}
            value={uploadType}
            onChange={setUploadType}
          />
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.bmp,.webp"
                aria-label="Selecionar arquivos para upload"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Selecionar Arquivos
              </Button>
            </div>
            
            {uploadFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Arquivos selecionados:</p>
                {uploadFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">{file.name}</span>
                      <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowUploadModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpload} disabled={uploadFiles.length === 0 || !uploadCustomerId}>
              <Upload className="w-4 h-4 mr-2" />
              Fazer Upload
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de Preview */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title={`Visualizar: ${selectedDocument?.name}`}
        size="4xl"
      >
        {selectedDocument && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{getDocumentTypeIcon(selectedDocument.type)}</span>
                <div>
                  <p className="font-medium">{selectedDocument.name}</p>
                  <p className="text-sm text-gray-600">Cliente: {selectedDocument.customerName}</p>
                </div>
              </div>
              <Badge variant={getStatusColor(selectedDocument.status)}>
                {getStatusLabel(selectedDocument.status)}
              </Badge>
            </div>
            
            <div className="border rounded-lg p-4 bg-gray-50">
              {isImageFile(selectedDocument.url) ? (
                <img
                  src={selectedDocument.url}
                  alt={selectedDocument.name}
                  className="max-w-full h-auto mx-auto"
                />
              ) : isPdfFile(selectedDocument.url) ? (
                <iframe
                  src={selectedDocument.url}
                  className="w-full h-96 border-0"
                  title={selectedDocument.name}
                />
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Visualização não disponível para este tipo de arquivo</p>
                  {onDownload && (
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => onDownload(selectedDocument)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowPreviewModal(false)}>
                Fechar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Atualização de Status */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Atualizar Status do Documento"
        size="lg"
      >
        {selectedDocument && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium">{selectedDocument.name}</p>
              <p className="text-sm text-gray-600">Cliente: {selectedDocument.customerName}</p>
            </div>
            
            <Select
              label="Novo Status"
              options={[
                { value: 'approved', label: 'Aprovado' },
                { value: 'rejected', label: 'Rejeitado' }
              ]}
              value={newStatus}
              onChange={setNewStatus}
            />
            
                         <div>
               <label htmlFor="status-notes" className="block text-sm font-medium text-gray-700 mb-2">
                 Observações
               </label>
               <textarea
                 id="status-notes"
                 value={statusNotes}
                 onChange={(e) => setStatusNotes(e.target.value)}
                 rows={3}
                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                 placeholder="Digite observações sobre a aprovação/rejeição..."
               />
             </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowStatusModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleStatusUpdate}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Atualizar Status
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export { DocumentManager };
export type { CustomerDocument, DocumentManagerProps };
