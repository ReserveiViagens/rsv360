import React, { useState, useEffect } from 'react';
import { Users, User, FileText, Plus, RefreshCw, Download } from 'lucide-react';
import { CustomerProfile, CustomerProfileData } from '../components/customers/CustomerProfile';
import { CustomerModal, CustomerFormData } from '../components/customers/CustomerModal';
import { CustomerList, CustomerListData } from '../components/customers/CustomerList';
import { DocumentManager, CustomerDocument } from '../components/customers/DocumentManager';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { useUIStore } from '../stores/useUIStore';

// Mock data para demonstração
const mockCustomers: CustomerProfileData[] = [
  {
    id: '1',
    personalInfo: {
      firstName: 'João',
      lastName: 'Silva',
      email: 'joao.silva@email.com',
      phone: '(11) 99999-9999',
      birthDate: new Date('1985-03-15'),
      cpf: '123.456.789-00',
      address: {
        street: 'Rua das Flores, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        country: 'Brasil',
      },
    },
    preferences: [
      { id: '1', category: 'destination', value: 'Praias do Nordeste', priority: 'high' },
      { id: '2', category: 'accommodation', value: 'Resorts 5 estrelas', priority: 'medium' },
      { id: '3', category: 'activities', value: 'Passeios de barco', priority: 'low' },
    ],
    documents: [
      {
        id: '1',
        name: 'CPF_Joao_Silva.pdf',
        type: 'cpf',
        url: '/documents/cpf_joao.pdf',
        size: 1024000,
        uploadedAt: new Date('2024-01-15'),
        status: 'approved',
      },
      {
        id: '2',
        name: 'RG_Joao_Silva.jpg',
        type: 'rg',
        url: '/documents/rg_joao.jpg',
        size: 2048000,
        uploadedAt: new Date('2024-01-16'),
        status: 'pending',
      },
    ],
    travelHistory: [
      {
        id: '1',
        destination: 'Fernando de Noronha',
        checkIn: new Date('2024-02-01'),
        checkOut: new Date('2024-02-08'),
        status: 'completed',
        totalSpent: 8500,
        rating: 5,
        review: 'Experiência incrível! Recomendo muito.',
        package: 'Pacote Completo 7 dias',
      },
      {
        id: '2',
        destination: 'Gramado',
        checkIn: new Date('2024-06-15'),
        checkOut: new Date('2024-06-20'),
        status: 'upcoming',
        totalSpent: 3200,
        package: 'Pacote Romântico 5 dias',
      },
    ],
    statistics: {
      totalTrips: 8,
      totalSpent: 45000,
      averageRating: 4.8,
      favoriteDestination: 'Fernando de Noronha',
      memberSince: new Date('2020-01-10'),
      loyaltyPoints: 1250,
    },
    notes: 'Cliente VIP, sempre viaja em alta temporada. Prefere destinos de praia.',
    tags: ['VIP', 'Praia', 'Alta Temporada', 'Fiel'],
    status: 'vip',
  },
  {
    id: '2',
    personalInfo: {
      firstName: 'Maria',
      lastName: 'Santos',
      email: 'maria.santos@email.com',
      phone: '(21) 88888-8888',
      birthDate: new Date('1990-07-22'),
      cpf: '987.654.321-00',
      address: {
        street: 'Avenida Brasil, 456',
        city: 'Rio de Janeiro',
        state: 'RJ',
        zipCode: '20000-000',
        country: 'Brasil',
      },
    },
    preferences: [
      { id: '1', category: 'destination', value: 'Europa', priority: 'high' },
      { id: '2', category: 'transport', value: 'Trem', priority: 'high' },
      { id: '3', category: 'activities', value: 'Museus e cultura', priority: 'medium' },
    ],
    documents: [
      {
        id: '3',
        name: 'Passaporte_Maria_Santos.pdf',
        type: 'passport',
        url: '/documents/passaporte_maria.pdf',
        size: 1536000,
        uploadedAt: new Date('2024-02-01'),
        status: 'approved',
      },
    ],
    travelHistory: [
      {
        id: '3',
        destination: 'Paris',
        checkIn: new Date('2023-09-10'),
        checkOut: new Date('2023-09-17'),
        status: 'completed',
        totalSpent: 12000,
        rating: 5,
        review: 'Paris é sempre uma boa ideia!',
        package: 'Pacote Europa 7 dias',
      },
    ],
    statistics: {
      totalTrips: 3,
      totalSpent: 18000,
      averageRating: 4.9,
      favoriteDestination: 'Paris',
      memberSince: new Date('2022-03-20'),
      loyaltyPoints: 450,
    },
    notes: 'Cliente que prefere viagens culturais e históricas.',
    tags: ['Cultura', 'Europa', 'Primeira Viagem'],
    status: 'active',
  },
];

const mockDocuments: CustomerDocument[] = [
  {
    id: '1',
    name: 'CPF_Joao_Silva.pdf',
    type: 'cpf',
    url: '/documents/cpf_joao.pdf',
    size: 1024000,
    uploadedAt: new Date('2024-01-15'),
    status: 'approved',
    customerId: '1',
    customerName: 'João Silva',
    notes: 'Documento aprovado sem observações',
    reviewedBy: 'Ana Costa',
    reviewedAt: new Date('2024-01-16'),
  },
  {
    id: '2',
    name: 'RG_Joao_Silva.jpg',
    type: 'rg',
    url: '/documents/rg_joao.jpg',
    size: 2048000,
    uploadedAt: new Date('2024-01-16'),
    status: 'pending',
    customerId: '1',
    customerName: 'João Silva',
  },
  {
    id: '3',
    name: 'Passaporte_Maria_Santos.pdf',
    type: 'passport',
    url: '/documents/passaporte_maria.pdf',
    size: 1536000,
    uploadedAt: new Date('2024-02-01'),
    status: 'approved',
    customerId: '2',
    customerName: 'Maria Santos',
    notes: 'Passaporte válido até 2028',
    reviewedBy: 'Ana Costa',
    reviewedAt: new Date('2024-02-02'),
  },
];

const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerProfileData[]>(mockCustomers);
  const [documents, setDocuments] = useState<CustomerDocument[]>(mockDocuments);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfileData | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [activeTab, setActiveTab] = useState('list');
  const [viewMode, setViewMode] = useState<'list' | 'profile'>('list');

  const { showNotification } = useUIStore();

  // Converter CustomerProfileData para CustomerListData
  const customersListData: CustomerListData[] = customers.map(customer => ({
    id: customer.id,
    name: `${customer.personalInfo.firstName} ${customer.personalInfo.lastName}`,
    email: customer.personalInfo.email,
    phone: customer.personalInfo.phone,
    city: customer.personalInfo.address.city,
    state: customer.personalInfo.address.state,
    status: customer.status,
    totalTrips: customer.statistics.totalTrips,
    totalSpent: customer.statistics.totalSpent,
    averageRating: customer.statistics.averageRating,
    memberSince: customer.statistics.memberSince,
    tags: customer.tags,
  }));

  const handleCreateCustomer = () => {
    setModalMode('create');
    setSelectedCustomer(null);
    setShowCustomerModal(true);
  };

  const handleEditCustomer = (customer: CustomerListData) => {
    const fullCustomer = customers.find(c => c.id === customer.id);
    if (fullCustomer) {
      setModalMode('edit');
      setSelectedCustomer(fullCustomer);
      setShowCustomerModal(true);
    }
  };

  const handleViewCustomer = (customer: CustomerListData) => {
    const fullCustomer = customers.find(c => c.id === customer.id);
    if (fullCustomer) {
      setSelectedCustomer(fullCustomer);
      setViewMode('profile');
      setActiveTab('profile');
    }
  };

  const handleDeleteCustomer = (customer: CustomerListData) => {
    setCustomers(prev => prev.filter(c => c.id !== customer.id));
    setDocuments(prev => prev.filter(d => d.customerId !== customer.id));
    showNotification('Cliente excluído com sucesso!', 'success');
  };

  const handleSaveCustomer = async (data: CustomerFormData) => {
    try {
      if (modalMode === 'create') {
        const newCustomer: CustomerProfileData = {
          ...data,
          id: Date.now().toString(),
          documents: [],
          travelHistory: [],
          statistics: {
            totalTrips: 0,
            totalSpent: 0,
            averageRating: 0,
            favoriteDestination: 'N/A',
            memberSince: new Date(),
            loyaltyPoints: 0,
          },
          notes: data.notes || '',
          tags: data.tags || [],
        };
        setCustomers(prev => [...prev, newCustomer]);
        showNotification('Cliente criado com sucesso!', 'success');
      } else {
        setCustomers(prev => prev.map(c => c.id === selectedCustomer?.id ? { ...c, ...data } : c));
        showNotification('Cliente atualizado com sucesso!', 'success');
      }
      setShowCustomerModal(false);
    } catch (error) {
      showNotification('Erro ao salvar cliente', 'error');
    }
  };

  const handleDocumentUpload = (files: File[], type: string, customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    const newDocuments: CustomerDocument[] = files.map((file, index) => ({
      id: Date.now().toString() + index,
      name: file.name,
      type: type as any,
      url: URL.createObjectURL(file),
      size: file.size,
      uploadedAt: new Date(),
      status: 'pending',
      customerId,
      customerName: `${customer.personalInfo.firstName} ${customer.personalInfo.lastName}`,
    }));

    setDocuments(prev => [...prev, ...newDocuments]);
    
    // Atualizar documentos do cliente
    setCustomers(prev => prev.map(c => 
      c.id === customerId 
        ? { ...c, documents: [...c.documents, ...newDocuments] }
        : c
    ));
  };

  const handleDocumentDelete = (documentId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== documentId));
    
    // Atualizar documentos do cliente
    setCustomers(prev => prev.map(c => ({
      ...c,
      documents: c.documents.filter(d => d.id !== documentId)
    })));
  };

  const handleDocumentStatusUpdate = (documentId: string, status: 'approved' | 'rejected', notes?: string) => {
    setDocuments(prev => prev.map(d => 
      d.id === documentId 
        ? { 
            ...d, 
            status, 
            notes, 
            reviewedBy: 'Usuário Atual',
            reviewedAt: new Date()
          }
        : d
    ));
    
    // Atualizar documentos do cliente
    setCustomers(prev => prev.map(c => ({
      ...c,
      documents: c.documents.map(d => 
        d.id === documentId 
          ? { 
              ...d, 
              status, 
              notes, 
              reviewedBy: 'Usuário Atual',
              reviewedAt: new Date()
            }
          : d
      )
    })));
  };

  const handleExport = () => {
    // Simular exportação
    const dataStr = JSON.stringify(customers, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'clientes.json';
    link.click();
    URL.revokeObjectURL(url);
    showNotification('Exportação realizada com sucesso!', 'success');
  };

  const handleRefresh = () => {
    // Simular refresh dos dados
    showNotification('Dados atualizados!', 'success');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedCustomer(null);
    setActiveTab('list');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestão de Clientes</h1>
              <p className="text-gray-600 mt-2">
                Gerencie clientes, perfis e documentos do sistema RSV
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
              <Button variant="outline" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button onClick={handleCreateCustomer}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Cliente
              </Button>
            </div>
          </div>
        </div>

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
                <p className="text-sm text-gray-600">Total de Clientes</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <User className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {customers.filter(c => c.status === 'active').length}
                </p>
                <p className="text-sm text-gray-600">Clientes Ativos</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <User className="w-8 h-8 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {customers.filter(c => c.status === 'vip').length}
                </p>
                <p className="text-sm text-gray-600">Clientes VIP</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
                <p className="text-sm text-gray-600">Documentos</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Conteúdo principal */}
        {viewMode === 'list' ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">Lista de Clientes</TabsTrigger>
              <TabsTrigger value="documents">Documentos</TabsTrigger>
            </TabsList>

            <TabsContent value="list">
              <CustomerList
                customers={customersListData}
                onView={handleViewCustomer}
                onEdit={handleEditCustomer}
                onDelete={handleDeleteCustomer}
                onExport={handleExport}
                onNewCustomer={handleCreateCustomer}
              />
            </TabsContent>

            <TabsContent value="documents">
              <DocumentManager
                documents={documents}
                onUpload={handleDocumentUpload}
                onDelete={handleDocumentDelete}
                onUpdateStatus={handleDocumentStatusUpdate}
                onDownload={(doc) => {
                  // Simular download
                  const link = document.createElement('a');
                  link.href = doc.url;
                  link.download = doc.name;
                  link.click();
                }}
                onPreview={(doc) => {
                  // Simular preview
                  window.open(doc.url, '_blank');
                }}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={handleBackToList}>
                ← Voltar à Lista
              </Button>
              <div className="flex items-center space-x-3">
                <Button variant="outline" onClick={() => handleEditCustomer(customersListData.find(c => c.id === selectedCustomer?.id)!)}>
                  Editar Cliente
                </Button>
                <Button variant="outline" onClick={() => handleDeleteCustomer(customersListData.find(c => c.id === selectedCustomer?.id)!)}>
                  Excluir Cliente
                </Button>
              </div>
            </div>
            
            {selectedCustomer && (
              <CustomerProfile
                customer={selectedCustomer}
                onEdit={() => handleEditCustomer(customersListData.find(c => c.id === selectedCustomer.id)!)}
                onDelete={() => handleDeleteCustomer(customersListData.find(c => c.id === selectedCustomer.id)!)}
                onDocumentUpload={() => setActiveTab('documents')}
                onDocumentDelete={handleDocumentDelete}
              />
            )}
          </div>
        )}

        {/* Modal de Cliente */}
        <CustomerModal
          isOpen={showCustomerModal}
          onClose={() => setShowCustomerModal(false)}
          onSave={handleSaveCustomer}
          customer={selectedCustomer || undefined}
          mode={modalMode}
        />
      </div>
    </div>
  );
};

export { CustomersPage };
