import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { useRouter } from 'next/router';
import { 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  Users, 
  DollarSign,
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
  ShoppingBag,
  CreditCard,
  Truck,
  CheckCircle,
  XCircle
} from 'lucide-react';
import NavigationButtons from '../components/NavigationButtons';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  category: string;
  stock: number;
  sold: number;
  rating: number;
  reviews: number;
  image: string;
  status: 'active' | 'inactive' | 'out_of_stock';
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  items: number;
  created_at: string;
  shipping_address: string;
  payment_method: string;
}

interface Category {
  id: number;
  name: string;
  description: string;
  product_count: number;
  total_sales: number;
  icon: string;
  color: string;
}

export default function EcommercePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Dados simulados
  const [stats] = useState({
    total_revenue: 1250000,
    total_orders: 3450,
    total_products: 1250,
    total_customers: 8900,
    average_order_value: 362,
    conversion_rate: 3.2,
    active_products: 980,
    low_stock_products: 45
  });

  // Cards clicáveis de estatísticas
  const statsCards = [
    {
      id: 'total_revenue',
      title: 'Receita Total',
      value: `R$ ${(stats.total_revenue / 1000).toFixed(0)}k`,
      icon: <DollarSign className="h-6 w-6" />,
      color: 'bg-green-500',
      description: 'Receita total das vendas',
      onClick: () => handleCardClick('revenue')
    },
    {
      id: 'total_orders',
      title: 'Total de Pedidos',
      value: stats.total_orders.toLocaleString(),
      icon: <ShoppingCart className="h-6 w-6" />,
      color: 'bg-blue-500',
      description: 'Número total de pedidos',
      onClick: () => handleCardClick('orders')
    },
    {
      id: 'total_products',
      title: 'Total de Produtos',
      value: stats.total_products.toLocaleString(),
      icon: <Package className="h-6 w-6" />,
      color: 'bg-purple-500',
      description: 'Produtos cadastrados',
      onClick: () => handleCardClick('products')
    },
    {
      id: 'total_customers',
      title: 'Total de Clientes',
      value: stats.total_customers.toLocaleString(),
      icon: <Users className="h-6 w-6" />,
      color: 'bg-orange-500',
      description: 'Clientes cadastrados',
      onClick: () => handleCardClick('customers')
    },
    {
      id: 'average_order',
      title: 'Ticket Médio',
      value: `R$ ${stats.average_order_value}`,
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'bg-yellow-500',
      description: 'Valor médio por pedido',
      onClick: () => handleCardClick('average_order')
    },
    {
      id: 'conversion_rate',
      title: 'Taxa de Conversão',
      value: `${stats.conversion_rate}%`,
      icon: <Star className="h-6 w-6" />,
      color: 'bg-pink-500',
      description: 'Taxa de conversão de vendas',
      onClick: () => handleCardClick('conversion')
    }
  ];

  const [products] = useState<Product[]>([
    {
      id: 1,
      name: 'Pacote Paris Premium',
      description: 'Viagem completa para Paris com hotel 5 estrelas',
      price: 8500.00,
      original_price: 9500.00,
      category: 'Viagens Internacionais',
      stock: 15,
      sold: 45,
      rating: 4.8,
      reviews: 128,
      image: '/api/placeholder/300/200',
      status: 'active',
      tags: ['Premium', 'Europa', 'Romântico'],
      created_at: '2025-01-15',
      updated_at: '2025-01-20'
    },
    {
      id: 2,
      name: 'Ingresso Disney World',
      description: 'Ingresso para 3 dias nos parques da Disney',
      price: 1200.00,
      category: 'Ingressos',
      stock: 50,
      sold: 120,
      rating: 4.9,
      reviews: 89,
      image: '/api/placeholder/300/200',
      status: 'active',
      tags: ['Família', 'Parques', 'EUA'],
      created_at: '2025-01-10',
      updated_at: '2025-01-18'
    },
    {
      id: 3,
      name: 'Pacote Praia Nordeste',
      description: '7 dias em resort all-inclusive no Nordeste',
      price: 3200.00,
      original_price: 3800.00,
      category: 'Viagens Nacionais',
      stock: 8,
      sold: 32,
      rating: 4.6,
      reviews: 67,
      image: '/api/placeholder/300/200',
      status: 'active',
      tags: ['Praia', 'Nacional', 'All-inclusive'],
      created_at: '2025-01-12',
      updated_at: '2025-01-19'
    }
  ]);

  const [orders] = useState<Order[]>([
    {
      id: 1,
      order_number: 'ECO-2025-001',
      customer_name: 'Maria Silva',
      customer_email: 'maria@email.com',
      total_amount: 8500.00,
      status: 'delivered',
      payment_status: 'paid',
      items: 1,
      created_at: '2025-01-25',
      shipping_address: 'Rua das Flores, 123 - São Paulo, SP',
      payment_method: 'Cartão de Crédito'
    },
    {
      id: 2,
      order_number: 'ECO-2025-002',
      customer_name: 'João Santos',
      customer_email: 'joao@email.com',
      total_amount: 2400.00,
      status: 'processing',
      payment_status: 'paid',
      items: 2,
      created_at: '2025-01-26',
      shipping_address: 'Av. Paulista, 456 - São Paulo, SP',
      payment_method: 'PIX'
    }
  ]);

  const [categories] = useState<Category[]>([
    {
      id: 1,
      name: 'Viagens Internacionais',
      description: 'Destinos internacionais',
      product_count: 450,
      total_sales: 850000,
      icon: '✈️',
      color: 'bg-blue-500'
    },
    {
      id: 2,
      name: 'Viagens Nacionais',
      description: 'Destinos nacionais',
      product_count: 380,
      total_sales: 320000,
      icon: '🏖️',
      color: 'bg-green-500'
    },
    {
      id: 3,
      name: 'Ingressos',
      description: 'Ingressos para eventos',
      product_count: 220,
      total_sales: 80000,
      icon: '🎫',
      color: 'bg-purple-500'
    }
  ]);

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const handleCardClick = (cardType: string) => {
    setModalType(cardType);
    setShowModal(true);
  };

  const handleProductClick = (product: Product) => {
    setSelectedItem(product);
    setModalType('product_details');
    setShowModal(true);
  };

  const handleOrderClick = (order: Order) => {
    setSelectedItem(order);
    setModalType('order_details');
    setShowModal(true);
  };

  const handleCategoryClick = (category: Category) => {
    setSelectedItem(category);
    setModalType('category_details');
    setShowModal(true);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'new_product':
        setModalType('new_product');
        setShowModal(true);
        break;
      case 'new_order':
        setModalType('new_order');
        setShowModal(true);
        break;
      case 'export_data':
        handleExportData();
        break;
      case 'import_data':
        handleImportData();
        break;
      default:
        break;
    }
  };

  const handleExportData = () => {
    const data = {
      products,
      orders,
      categories,
      stats
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ecommerce_data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            console.log('Dados importados:', data);
          } catch (error) {
            console.error('Erro ao importar dados:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      case 'out_of_stock': return 'Sem Estoque';
      case 'pending': return 'Pendente';
      case 'processing': return 'Processando';
      case 'shipped': return 'Enviado';
      case 'delivered': return 'Entregue';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
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
                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">E-commerce</h1>
                    <p className="text-sm text-gray-500">Gerencie produtos, pedidos e vendas</p>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <NavigationButtons className="mr-4" />
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Produto
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Visão Geral', icon: '📊' },
                { id: 'products', name: 'Produtos', icon: '📦' },
                { id: 'orders', name: 'Pedidos', icon: '🛒' },
                { id: 'categories', name: 'Categorias', icon: '🏷️' },
                { id: 'analytics', name: 'Analytics', icon: '📈' }
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
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statsCards.map((card) => (
                  <div
                    key={card.id}
                    onClick={card.onClick}
                    className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105 border border-transparent hover:border-gray-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`p-2 ${card.color.replace('bg-', 'bg-').replace('-500', '-100')} rounded-lg`}>
                          <div className={`${card.color.replace('bg-', 'text-')}`}>
                            {card.icon}
                          </div>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">{card.title}</p>
                          <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                        </div>
                      </div>
                      <div className="text-gray-400 hover:text-gray-600">
                        <span className="text-xs">Clique para detalhes</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-xs text-gray-500">{card.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button
                    onClick={() => handleQuickAction('new_product')}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <Plus className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Novo Produto</p>
                      <p className="text-sm text-gray-500">Adicionar produto</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleQuickAction('new_order')}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                      <ShoppingCart className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Novo Pedido</p>
                      <p className="text-sm text-gray-500">Criar pedido</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleQuickAction('export_data')}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                      <Download className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Exportar Dados</p>
                      <p className="text-sm text-gray-500">Baixar relatórios</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleQuickAction('import_data')}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                      <Upload className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Importar Dados</p>
                      <p className="text-sm text-gray-500">Carregar informações</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-6">
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Buscar produtos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todos os produtos</option>
                  <option value="active">Ativos</option>
                  <option value="inactive">Inativos</option>
                  <option value="out_of_stock">Sem estoque</option>
                </select>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Produto
                </button>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer transform hover:scale-105 transition-transform duration-200"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(product.status)}`}>
                          {getStatusText(product.status)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">{product.description}</p>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <span className="text-2xl font-bold text-gray-900">{formatCurrency(product.price)}</span>
                          {product.original_price && (
                            <span className="ml-2 text-sm text-gray-500 line-through">
                              {formatCurrency(product.original_price)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="ml-1 text-sm text-gray-600">{product.rating}</span>
                          <span className="ml-1 text-sm text-gray-500">({product.reviews})</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Estoque: {product.stock}</span>
                        <span>Vendidos: {product.sold}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6">
              {/* Orders List */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Pedidos Recentes</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      onClick={() => handleOrderClick(order)}
                      className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h4 className="text-lg font-medium text-gray-900">{order.order_number}</h4>
                            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                          </div>
                          <p className="text-gray-500 mt-1">{order.customer_name} - {order.customer_email}</p>
                          <div className="flex items-center space-x-6 mt-3 text-sm text-gray-600">
                            <span>Total: {formatCurrency(order.total_amount)}</span>
                            <span>Itens: {order.items}</span>
                            <span>Data: {formatDate(order.created_at)}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-6">
              {/* Categories Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    onClick={() => handleCategoryClick(category)}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer transform hover:scale-105 transition-transform duration-200"
                  >
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <span className="text-3xl mr-3">{category.icon}</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                          <p className="text-gray-500">{category.description}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Produtos</p>
                          <p className="font-semibold text-gray-900">{category.product_count}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Vendas</p>
                          <p className="font-semibold text-gray-900">{formatCurrency(category.total_sales)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Analytics de E-commerce</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-500">Funcionalidade em desenvolvimento...</p>
              </div>
            </div>
          )}
        </div>

        {/* Modais */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {modalType === 'revenue' && 'Detalhes da Receita'}
                  {modalType === 'orders' && 'Detalhes dos Pedidos'}
                  {modalType === 'products' && 'Detalhes dos Produtos'}
                  {modalType === 'customers' && 'Detalhes dos Clientes'}
                  {modalType === 'average_order' && 'Ticket Médio'}
                  {modalType === 'conversion' && 'Taxa de Conversão'}
                  {modalType === 'product_details' && 'Detalhes do Produto'}
                  {modalType === 'order_details' && 'Detalhes do Pedido'}
                  {modalType === 'category_details' && 'Detalhes da Categoria'}
                  {modalType === 'new_product' && 'Novo Produto'}
                  {modalType === 'new_order' && 'Novo Pedido'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-6">
                {modalType === 'revenue' && (
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-green-900">Receita Total</h3>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.total_revenue)}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900">Ticket Médio</h3>
                        <p className="text-xl font-bold text-gray-600">{formatCurrency(stats.average_order_value)}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900">Total de Pedidos</h3>
                        <p className="text-xl font-bold text-gray-600">{stats.total_orders.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}

                {modalType === 'product_details' && selectedItem && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{selectedItem.name}</h3>
                      <p className="text-gray-500">{selectedItem.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900">Preço</h4>
                        <p className="text-xl font-bold text-gray-600">{formatCurrency(selectedItem.price)}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900">Estoque</h4>
                        <p className="text-xl font-bold text-gray-600">{selectedItem.stock}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedItem.tags.map((tag: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {modalType === 'order_details' && selectedItem && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{selectedItem.order_number}</h3>
                      <p className="text-gray-500">{selectedItem.customer_name} - {selectedItem.customer_email}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900">Total</h4>
                        <p className="text-xl font-bold text-gray-600">{formatCurrency(selectedItem.total_amount)}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900">Status</h4>
                        <p className="text-xl font-bold text-gray-600">{getStatusText(selectedItem.status)}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Endereço de Entrega</h4>
                      <p className="text-gray-600">{selectedItem.shipping_address}</p>
                    </div>
                  </div>
                )}

                {modalType === 'new_product' && (
                  <div className="space-y-4">
                    <p className="text-gray-600">Formulário para criar novo produto...</p>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Criar Produto
                      </button>
                    </div>
                  </div>
                )}

                {modalType === 'new_order' && (
                  <div className="space-y-4">
                    <p className="text-gray-600">Formulário para criar novo pedido...</p>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Criar Pedido
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
} 