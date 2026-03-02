import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Star, 
  Heart, 
  FileText, 
  Download, 
  Edit, 
  Trash2, 
  Plus,
  Globe,
  CreditCard,
  Award,
  Clock,
  TrendingUp,
  MapPinIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';

export interface CustomerDocument {
  id: string;
  name: string;
  type: 'cpf' | 'rg' | 'passport' | 'vaccine' | 'other';
  url: string;
  size: number;
  uploadedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
}

export interface CustomerPreference {
  id: string;
  category: 'destination' | 'accommodation' | 'transport' | 'activities';
  value: string;
  priority: 'low' | 'medium' | 'high';
}

export interface CustomerTravel {
  id: string;
  destination: string;
  checkIn: Date;
  checkOut: Date;
  status: 'completed' | 'upcoming' | 'cancelled';
  totalSpent: number;
  rating?: number;
  review?: string;
  package: string;
}

export interface CustomerProfileData {
  id: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    birthDate: Date;
    cpf: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
  preferences: CustomerPreference[];
  documents: CustomerDocument[];
  travelHistory: CustomerTravel[];
  statistics: {
    totalTrips: number;
    totalSpent: number;
    averageRating: number;
    favoriteDestination: string;
    memberSince: Date;
    loyaltyPoints: number;
  };
  notes: string;
  tags: string[];
  status: 'active' | 'inactive' | 'vip';
}

export interface CustomerProfileProps {
  customer: CustomerProfileData;
  onEdit?: () => void;
  onDelete?: () => void;
  onDocumentUpload?: () => void;
  onDocumentDelete?: (documentId: string) => void;
  className?: string;
}

const CustomerProfile: React.FC<CustomerProfileProps> = ({
  customer,
  onEdit,
  onDelete,
  onDocumentUpload,
  onDocumentDelete,
  className
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'vip': return 'warning';
      default: return 'default';
    }
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'cpf': return '📄';
      case 'rg': return '🆔';
      case 'passport': return '🛂';
      case 'vaccine': return '💉';
      default: return '📋';
    }
  };

  const getDocumentStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header com informações básicas */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <Avatar
              size="lg"
              src={`https://ui-avatars.com/api/?name=${customer.personalInfo.firstName}+${customer.personalInfo.lastName}&background=2563eb&color=fff`}
              alt={`${customer.personalInfo.firstName} ${customer.personalInfo.lastName}`}
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {customer.personalInfo.firstName} {customer.personalInfo.lastName}
              </h1>
              <div className="flex items-center space-x-4 mt-2 text-gray-600">
                <div className="flex items-center space-x-1">
                  <Mail className="w-4 h-4" />
                  <span>{customer.personalInfo.email}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Phone className="w-4 h-4" />
                  <span>{customer.personalInfo.phone}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{customer.personalInfo.address.city}, {customer.personalInfo.address.state}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={getStatusColor(customer.status)}>
              {customer.status.toUpperCase()}
            </Badge>
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            )}
            {onDelete && (
              <Button variant="outline" size="sm" onClick={onDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Globe className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Viagens</p>
              <p className="text-2xl font-bold text-gray-900">{customer.statistics.totalTrips}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Gasto</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(customer.statistics.totalSpent)}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avaliação Média</p>
              <p className="text-2xl font-bold text-gray-900">{customer.statistics.averageRating.toFixed(1)}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pontos Fidelidade</p>
              <p className="text-2xl font-bold text-gray-900">{customer.statistics.loyaltyPoints}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="travels">Histórico</TabsTrigger>
          <TabsTrigger value="preferences">Preferências</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="notes">Anotações</TabsTrigger>
        </TabsList>

        {/* Tab: Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informações pessoais */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Informações Pessoais
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nome Completo:</span>
                  <span className="font-medium">{customer.personalInfo.firstName} {customer.personalInfo.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{customer.personalInfo.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Telefone:</span>
                  <span className="font-medium">{customer.personalInfo.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Data de Nascimento:</span>
                  <span className="font-medium">{format(customer.personalInfo.birthDate, 'dd/MM/yyyy', { locale: ptBR })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">CPF:</span>
                  <span className="font-medium">{customer.personalInfo.cpf}</span>
                </div>
              </div>
            </Card>

            {/* Endereço */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Endereço
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Rua:</span>
                  <span className="font-medium">{customer.personalInfo.address.street}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cidade:</span>
                  <span className="font-medium">{customer.personalInfo.address.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado:</span>
                  <span className="font-medium">{customer.personalInfo.address.state}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">CEP:</span>
                  <span className="font-medium">{customer.personalInfo.address.zipCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">País:</span>
                  <span className="font-medium">{customer.personalInfo.address.country}</span>
                </div>
              </div>
            </Card>

            {/* Destino favorito */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPinIcon className="w-5 h-5 mr-2" />
                Destino Favorito
              </h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {customer.statistics.favoriteDestination}
                </div>
                <p className="text-gray-600">Local mais visitado</p>
              </div>
            </Card>

            {/* Membro desde */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Membro Desde
              </h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {format(customer.statistics.memberSince, 'MMM yyyy', { locale: ptBR })}
                </div>
                <p className="text-gray-600">Cliente fiel</p>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Histórico de Viagens */}
        <TabsContent value="travels" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Histórico de Viagens</h3>
            <Badge variant="outline">{customer.travelHistory.length} viagens</Badge>
          </div>
          
          <div className="space-y-3">
            {customer.travelHistory.map((travel) => (
              <Card key={travel.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-gray-900">{travel.destination}</h4>
                      <Badge variant={travel.status === 'completed' ? 'success' : travel.status === 'upcoming' ? 'warning' : 'error'}>
                        {travel.status === 'completed' ? 'Concluída' : travel.status === 'upcoming' ? 'Próxima' : 'Cancelada'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Check-in:</span> {format(travel.checkIn, 'dd/MM/yyyy', { locale: ptBR })}
                      </div>
                      <div>
                        <span className="font-medium">Check-out:</span> {format(travel.checkOut, 'dd/MM/yyyy', { locale: ptBR })}
                      </div>
                      <div>
                        <span className="font-medium">Pacote:</span> {travel.package}
                      </div>
                      <div>
                        <span className="font-medium">Valor:</span> {formatCurrency(travel.totalSpent)}
                      </div>
                    </div>
                    {travel.rating && (
                      <div className="flex items-center space-x-2 mt-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "w-4 h-4",
                                i < travel.rating! ? "text-yellow-400 fill-current" : "text-gray-300"
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">({travel.rating}/5)</span>
                      </div>
                    )}
                    {travel.review && (
                      <p className="text-sm text-gray-600 mt-2 italic">"{travel.review}"</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab: Preferências */}
        <TabsContent value="preferences" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Preferências de Viagem</h3>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Preferência
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customer.preferences.map((preference) => (
              <Card key={preference.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">{preference.category}</Badge>
                  <Badge variant={preference.priority === 'high' ? 'error' : preference.priority === 'medium' ? 'warning' : 'default'}>
                    {preference.priority}
                  </Badge>
                </div>
                <p className="font-medium text-gray-900">{preference.value}</p>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab: Documentos */}
        <TabsContent value="documents" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Documentos</h3>
            <Button variant="outline" size="sm" onClick={onDocumentUpload}>
              <Plus className="w-4 h-4 mr-2" />
              Upload Documento
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customer.documents.map((document) => (
              <Card key={document.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getDocumentTypeIcon(document.type)}</span>
                    <div>
                      <p className="font-medium text-gray-900">{document.name}</p>
                      <p className="text-sm text-gray-600">{document.type.toUpperCase()}</p>
                    </div>
                  </div>
                  <Badge variant={getDocumentStatusColor(document.status)}>
                    {document.status === 'approved' ? 'Aprovado' : document.status === 'pending' ? 'Pendente' : 'Rejeitado'}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Tamanho:</span>
                    <span>{formatFileSize(document.size)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Upload:</span>
                    <span>{format(document.uploadedAt, 'dd/MM/yyyy', { locale: ptBR })}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 mt-3">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  {onDocumentDelete && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onDocumentDelete(document.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab: Anotações */}
        <TabsContent value="notes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Anotações e Tags</h3>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </div>
          
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Anotações</h4>
                <p className="text-gray-600 whitespace-pre-wrap">{customer.notes || 'Nenhuma anotação registrada.'}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {customer.tags.length > 0 ? (
                    customer.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-gray-500">Nenhuma tag definida</span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export { CustomerProfile };
export type { CustomerProfileData, CustomerDocument, CustomerPreference, CustomerTravel };
