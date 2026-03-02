'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import {
  Store,
  TrendingUp,
  Users,
  DollarSign,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
  Eye,
  Edit,
  Plus,
  Download,
  Filter,
  Search,
  Calendar,
  MapPin,
  Star,
  Building,
  Phone,
  Mail,
  Globe,
  Handshake,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

interface Partner {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  businessType: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  status: 'pending_review' | 'active' | 'suspended' | 'rejected';
  commissionRate: number;
  totalBookings: number;
  totalRevenue: number;
  joinedAt: string;
  lastActivity: string;
  location: string;
  specialties: string[];
  rating: number;
  logo?: string;
}

interface PartnerStats {
  totalPartners: number;
  activePartners: number;
  pendingReview: number;
  totalCommissions: number;
  monthlyRevenue: number;
  topPerformers: Partner[];
}

const MOCK_PARTNERS: Partner[] = [
  {
    id: '1',
    companyName: 'Viagens Premium Ltda',
    contactName: 'João Silva',
    email: 'joao@viagenspremium.com',
    phone: '(11) 99999-9999',
    website: 'https://viagenspremium.com',
    businessType: 'travel_agency',
    tier: 'diamond',
    status: 'active',
    commissionRate: 0.20,
    totalBookings: 1250,
    totalRevenue: 850000,
    joinedAt: '2023-01-15',
    lastActivity: '2025-01-10',
    location: 'São Paulo, SP',
    specialties: ['Turismo de Luxo', 'Viagens Corporativas', 'Lua de Mel'],
    rating: 4.9
  },
  {
    id: '2',
    companyName: 'Aventura & Natureza',
    contactName: 'Maria Santos',
    email: 'maria@aventuranatureza.com',
    phone: '(21) 88888-8888',
    website: 'https://aventuranatureza.com',
    businessType: 'tour_operator',
    tier: 'gold',
    status: 'active',
    commissionRate: 0.10,
    totalBookings: 680,
    totalRevenue: 320000,
    joinedAt: '2023-03-22',
    lastActivity: '2025-01-09',
    location: 'Rio de Janeiro, RJ',
    specialties: ['Ecoturismo', 'Trilhas', 'Turismo de Aventura'],
    rating: 4.7
  },
  {
    id: '3',
    companyName: 'Business Travel Solutions',
    contactName: 'Carlos Oliveira',
    email: 'carlos@businesstravel.com',
    phone: '(11) 77777-7777',
    website: 'https://businesstravel.com',
    businessType: 'corporate',
    tier: 'platinum',
    status: 'active',
    commissionRate: 0.15,
    totalBookings: 920,
    totalRevenue: 650000,
    joinedAt: '2022-11-08',
    lastActivity: '2025-01-08',
    location: 'São Paulo, SP',
    specialties: ['Viagens Corporativas', 'Eventos', 'Hotelaria Executiva'],
    rating: 4.8
  },
  {
    id: '4',
    companyName: 'Férias em Família',
    contactName: 'Ana Costa',
    email: 'ana@feriasfamilia.com',
    phone: '(31) 66666-6666',
    website: 'https://feriasfamilia.com',
    businessType: 'travel_agency',
    tier: 'silver',
    status: 'pending_review',
    commissionRate: 0.07,
    totalBookings: 150,
    totalRevenue: 75000,
    joinedAt: '2024-12-01',
    lastActivity: '2025-01-07',
    location: 'Belo Horizonte, MG',
    specialties: ['Turismo Familiar', 'Parques Temáticos', 'Resorts'],
    rating: 4.5
  }
];

const MOCK_STATS: PartnerStats = {
  totalPartners: 45,
  activePartners: 38,
  pendingReview: 7,
  totalCommissions: 125000,
  monthlyRevenue: 2500000,
  topPerformers: MOCK_PARTNERS.slice(0, 3)
};

export default function MarketplaceParceiros() {
  const [partners, setPartners] = useState<Partner[]>(MOCK_PARTNERS);
  const [stats, setStats] = useState<PartnerStats>(MOCK_STATS);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTier, setFilterTier] = useState('all');
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'diamond': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'platinum': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'gold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'silver': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'bronze': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending_review': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'rejected': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'pending_review': return <Clock className="h-4 w-4" />;
      case 'suspended': return <XCircle className="h-4 w-4" />;
      case 'rejected': return <AlertCircle className="h-4 w-4" />;
      default: return <Minus className="h-4 w-4" />;
    }
  };

  const getBusinessTypeLabel = (type: string) => {
    const types = {
      'travel_agency': 'Agência de Viagens',
      'tour_operator': 'Operadora de Turismo',
      'corporate': 'Viagens Corporativas',
      'hotel_chain': 'Rede Hoteleira',
      'booking_platform': 'Plataforma de Reservas'
    };
    return types[type] || type;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const filteredPartners = partners.filter(partner => {
    const matchesSearch = partner.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partner.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partner.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || partner.status === filterStatus;
    const matchesTier = filterTier === 'all' || partner.tier === filterTier;

    return matchesSearch && matchesStatus && matchesTier;
  });

  const handleApprovePartner = (partnerId: string) => {
    setPartners(prev => prev.map(p =>
      p.id === partnerId ? { ...p, status: 'active' as const } : p
    ));
  };

  const handleRejectPartner = (partnerId: string) => {
    setPartners(prev => prev.map(p =>
      p.id === partnerId ? { ...p, status: 'rejected' as const } : p
    ));
  };

  const handleSuspendPartner = (partnerId: string) => {
    setPartners(prev => prev.map(p =>
      p.id === partnerId ? { ...p, status: 'suspended' as const } : p
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <Store className="h-8 w-8 mr-3 text-blue-600" />
              🤝 Marketplace de Parceiros
            </h1>
            <p className="text-gray-600">
              Gerencie parceiros, comissões e performance do marketplace
            </p>
          </div>

          <div className="flex gap-4 mt-4 lg:mt-0">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Relatório
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Parceiro
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total de Parceiros</p>
                  <p className="text-2xl font-bold">{stats.totalPartners}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Parceiros Ativos</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activePartners}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Aguardando Análise</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingReview}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Comissões Mensais</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalCommissions)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Receita Mensal</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.monthlyRevenue)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="partners" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="partners">
              <Users className="h-4 w-4 mr-2" />
              Parceiros
            </TabsTrigger>
            <TabsTrigger value="applications">
              <Clock className="h-4 w-4 mr-2" />
              Candidaturas
            </TabsTrigger>
            <TabsTrigger value="commissions">
              <DollarSign className="h-4 w-4 mr-2" />
              Comissões
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Lista de Parceiros */}
          <TabsContent value="partners">
            <Card>
              <CardHeader>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <CardTitle>Parceiros Registrados</CardTitle>
                    <CardDescription>
                      Gerencie todos os parceiros do marketplace
                    </CardDescription>
                  </div>

                  <div className="flex gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar parceiros..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>

                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os Status</SelectItem>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="pending_review">Pendente</SelectItem>
                        <SelectItem value="suspended">Suspenso</SelectItem>
                        <SelectItem value="rejected">Rejeitado</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filterTier} onValueChange={setFilterTier}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os Tiers</SelectItem>
                        <SelectItem value="diamond">Diamond</SelectItem>
                        <SelectItem value="platinum">Platinum</SelectItem>
                        <SelectItem value="gold">Gold</SelectItem>
                        <SelectItem value="silver">Silver</SelectItem>
                        <SelectItem value="bronze">Bronze</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {filteredPartners.map(partner => (
                    <div key={partner.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                            {partner.logo ? (
                              <img src={partner.logo} alt={partner.companyName} className="w-full h-full object-cover rounded-lg" />
                            ) : (
                              <Building className="h-8 w-8 text-gray-400" />
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold text-lg">{partner.companyName}</h3>
                              <Badge className={getTierColor(partner.tier)}>
                                <Award className="h-3 w-3 mr-1" />
                                {partner.tier.toUpperCase()}
                              </Badge>
                              <Badge className={getStatusColor(partner.status)}>
                                {getStatusIcon(partner.status)}
                                <span className="ml-1 capitalize">{partner.status.replace('_', ' ')}</span>
                              </Badge>
                            </div>

                            <div className="text-sm text-gray-600 space-y-1">
                              <div className="flex items-center space-x-4">
                                <span className="flex items-center">
                                  <Users className="h-4 w-4 mr-1" />
                                  {partner.contactName}
                                </span>
                                <span className="flex items-center">
                                  <Mail className="h-4 w-4 mr-1" />
                                  {partner.email}
                                </span>
                                <span className="flex items-center">
                                  <Phone className="h-4 w-4 mr-1" />
                                  {partner.phone}
                                </span>
                              </div>

                              <div className="flex items-center space-x-4">
                                <span className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  {partner.location}
                                </span>
                                <span className="flex items-center">
                                  <Building className="h-4 w-4 mr-1" />
                                  {getBusinessTypeLabel(partner.businessType)}
                                </span>
                                {partner.website && (
                                  <span className="flex items-center">
                                    <Globe className="h-4 w-4 mr-1" />
                                    <a href={partner.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                      Website
                                    </a>
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mt-3">
                              {partner.specialties.map(specialty => (
                                <Badge key={specialty} variant="outline" className="text-xs">
                                  {specialty}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="text-right space-y-2">
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Reservas</p>
                              <p className="font-semibold">{partner.totalBookings}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Receita</p>
                              <p className="font-semibold">{formatCurrency(partner.totalRevenue)}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Comissão</p>
                              <p className="font-semibold">{(partner.commissionRate * 100).toFixed(1)}%</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < Math.floor(partner.rating)
                                      ? 'text-yellow-500 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">{partner.rating.toFixed(1)}</span>
                          </div>

                          <div className="flex space-x-2 mt-4">
                            <Button size="sm" variant="outline" onClick={() => setSelectedPartner(partner)}>
                              <Eye className="h-4 w-4 mr-1" />
                              Ver
                            </Button>

                            {partner.status === 'pending_review' && (
                              <>
                                <Button size="sm" onClick={() => handleApprovePartner(partner.id)}>
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Aprovar
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleRejectPartner(partner.id)}>
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Rejeitar
                                </Button>
                              </>
                            )}

                            {partner.status === 'active' && (
                              <Button size="sm" variant="outline" onClick={() => handleSuspendPartner(partner.id)}>
                                <AlertCircle className="h-4 w-4 mr-1" />
                                Suspender
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Candidaturas */}
          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>Candidaturas Pendentes</CardTitle>
                <CardDescription>
                  Analise e aprove novos parceiros
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {partners.filter(p => p.status === 'pending_review').map(partner => (
                    <div key={partner.id} className="border rounded-lg p-6 bg-yellow-50 border-yellow-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{partner.companyName}</h3>
                          <p className="text-gray-600">Contato: {partner.contactName}</p>
                          <p className="text-gray-600">Email: {partner.email}</p>
                          <p className="text-gray-600">Tipo: {getBusinessTypeLabel(partner.businessType)}</p>
                          <p className="text-sm text-gray-500 mt-2">
                            Candidatura enviada em: {formatDate(partner.joinedAt)}
                          </p>
                        </div>

                        <div className="flex space-x-2">
                          <Button onClick={() => handleApprovePartner(partner.id)}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Aprovar
                          </Button>
                          <Button variant="destructive" onClick={() => handleRejectPartner(partner.id)}>
                            <XCircle className="h-4 w-4 mr-2" />
                            Rejeitar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comissões */}
          <TabsContent value="commissions">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Comissões por Tier</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries({
                      diamond: { rate: 20, partners: 2, label: 'Diamond' },
                      platinum: { rate: 15, partners: 5, label: 'Platinum' },
                      gold: { rate: 10, partners: 12, label: 'Gold' },
                      silver: { rate: 7, partners: 18, label: 'Silver' },
                      bronze: { rate: 5, partners: 8, label: 'Bronze' }
                    }).map(([tier, data]) => (
                      <div key={tier} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Badge className={getTierColor(tier)}>
                            {data.label}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {data.partners} parceiros
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{data.rate}%</p>
                          <p className="text-sm text-gray-600">comissão</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Performers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.topPerformers.map((partner, index) => (
                      <div key={partner.id} className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{partner.companyName}</p>
                          <p className="text-sm text-gray-600">{formatCurrency(partner.totalRevenue)}</p>
                        </div>
                        <Badge className={getTierColor(partner.tier)}>
                          {partner.tier}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Mensal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                    <div className="text-center">
                      <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Gráfico de Performance</p>
                      <p className="text-sm text-gray-500">Receita e comissões mensais</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Tier</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                    <div className="text-center">
                      <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Gráfico de Distribuição</p>
                      <p className="text-sm text-gray-500">Parceiros por categoria</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
