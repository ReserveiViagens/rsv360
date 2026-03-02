import React, { useState, useEffect } from 'react';
import { useAuth } from '../src/context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { useRouter } from 'next/router';
import {
  Plane,
  Calendar,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash,
  Eye,
  Download,
  Search,
  Filter,
  ArrowLeft,
  Users,
  MapPin,
  DollarSign,
  Clock,
  Star,
  Settings,
  FileText,
  BarChart3,
  Ticket
} from 'lucide-react';

interface Travel {
    id: number;
    title: string;
    destination: string;
    departure_date: string;
    return_date: string;
    price: number;
    status: 'active' | 'completed' | 'cancelled' | 'pending';
    passengers: number;
    type: 'business' | 'leisure' | 'group';
    description: string;
    rating?: number;
    notes?: string;
}

interface TravelCategory {
    name: string;
    icon: React.ReactNode;
    color: string;
    description: string;
    count: number;
    status: Travel['status'];
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

// Componente Modal reutilizável
function Modal({ isOpen, onClose, title, children }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
                </div>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <XCircle className="h-6 w-6" />
                            </button>
                        </div>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Travel() {
    const { user } = useAuth();
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [travels, setTravels] = useState<Travel[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [showNewTravel, setShowNewTravel] = useState(false);
    const [showEditTravel, setShowEditTravel] = useState(false);
    const [showTravelDetails, setShowTravelDetails] = useState(false);
    const [selectedTravel, setSelectedTravel] = useState<Travel | null>(null);

    // Categorias de viagem
    const categories: TravelCategory[] = [
        {
            name: 'Viagens Ativas',
            icon: <Plane className="h-6 w-6" />,
            color: 'blue',
            description: 'Viagens em andamento',
            count: 12,
            status: 'active'
        },
        {
            name: 'Reservas Pendentes',
            icon: <Calendar className="h-6 w-6" />,
            color: 'yellow',
            description: 'Reservas aguardando confirmação',
            count: 5,
            status: 'pending'
        },
        {
            name: 'Viagens Concluídas',
            icon: <CheckCircle className="h-6 w-6" />,
            color: 'green',
            description: 'Viagens finalizadas',
            count: 28,
            status: 'completed'
        },
        {
            name: 'Viagens Canceladas',
            icon: <XCircle className="h-6 w-6" />,
            color: 'red',
            description: 'Viagens canceladas',
            count: 3,
            status: 'cancelled'
        }
    ];

    // Dados mock de viagens
    const mockTravels: Travel[] = [
        {
            id: 1,
            title: 'Férias em Paris',
            destination: 'Paris, França',
            departure_date: '2024-08-15',
            return_date: '2024-08-22',
            price: 4500.00,
            status: 'active',
            passengers: 2,
            type: 'leisure',
            description: 'Uma semana incrível na cidade luz',
            rating: 4.8,
            notes: 'Hotel próximo ao Louvre, passeios de barco no Sena'
        },
        {
            id: 2,
            title: 'Conferência Tech',
            destination: 'São Paulo, Brasil',
            departure_date: '2024-09-10',
            return_date: '2024-09-12',
            price: 1200.00,
            status: 'active',
            passengers: 1,
            type: 'business',
            description: 'Participação na conferência de tecnologia',
            rating: 4.5,
            notes: 'Hotel próximo ao centro de eventos, traslado incluído'
        },
        {
            id: 3,
            title: 'Grupo Família',
            destination: 'Orlando, EUA',
            departure_date: '2024-12-20',
            return_date: '2024-12-27',
            price: 8500.00,
            status: 'active',
            passengers: 4,
            type: 'group',
            description: 'Viagem em família para os parques da Disney',
            rating: 4.9,
            notes: 'Pacote completo com ingressos para todos os parques'
        },
        {
            id: 4,
            title: 'Lua de Mel',
            destination: 'Maldives',
            departure_date: '2024-10-15',
            return_date: '2024-10-22',
            price: 12000.00,
            status: 'pending',
            passengers: 2,
            type: 'leisure',
            description: 'Lua de mel em resort exclusivo',
            rating: 5.0,
            notes: 'Bangalô sobre a água, pensão completa'
        },
        {
            id: 5,
            title: 'Expedição Amazônica',
            destination: 'Manaus, Brasil',
            departure_date: '2024-07-01',
            return_date: '2024-07-08',
            price: 3200.00,
            status: 'completed',
            passengers: 6,
            type: 'group',
            description: 'Expedição científica na Amazônia',
            rating: 4.7,
            notes: 'Guia especializado, equipamentos incluídos'
        }
    ];

    useEffect(() => {
        // Simular carregamento de dados
        setTimeout(() => {
            setTravels(mockTravels);
            setLoading(false);
        }, 1000);
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'completed': return 'bg-blue-100 text-blue-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'business': return 'bg-purple-100 text-purple-800';
            case 'leisure': return 'bg-orange-100 text-orange-800';
            case 'group': return 'bg-pink-100 text-pink-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(price);
    };

    const handleNewTravel = () => {
        setShowNewTravel(true);
    };

    const handleEditTravel = (travel: Travel) => {
        setSelectedTravel(travel);
        setShowEditTravel(true);
    };

    const handleViewTravel = (travel: Travel) => {
        setSelectedTravel(travel);
        setShowTravelDetails(true);
    };

    const handleDeleteTravel = (travelId: number) => {
        if (confirm('Tem certeza que deseja cancelar esta viagem?')) {
            setTravels(prev => prev.map(t => 
                t.id === travelId ? { ...t, status: 'cancelled' as const } : t
            ));
        }
    };

    const handleQuickAction = (action: string) => {
        switch (action) {
            case 'new':
                handleNewTravel();
                break;
            case 'schedule':
                router.push('/calendar');
                break;
            case 'reports':
                router.push('/reports');
                break;
            case 'tickets':
                router.push('/tickets');
                break;
            default:
                break;
        }
    };

    // Filtros
    const filteredTravels = travels.filter(travel => {
        const matchesSearch = travel.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             travel.destination.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = selectedFilter === 'all' || travel.status === selectedFilter;
        return matchesSearch && matchesFilter;
    });

    // Formulário de Nova Viagem
    const NewTravelForm = () => {
        const [formData, setFormData] = useState({
            title: '',
            destination: '',
            departure_date: '',
            return_date: '',
            passengers: 1,
            type: 'leisure',
            price: '',
            description: '',
            notes: ''
        });

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            const newTravel: Travel = {
                id: Date.now(),
                title: formData.title,
                destination: formData.destination,
                departure_date: formData.departure_date,
                return_date: formData.return_date,
                price: parseFloat(formData.price),
                status: 'pending',
                passengers: formData.passengers,
                type: formData.type as Travel['type'],
                description: formData.description,
                notes: formData.notes
            };
            
            setTravels(prev => [...prev, newTravel]);
            setShowNewTravel(false);
        };

        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título da Viagem</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Destino</label>
                    <input
                        type="text"
                        value={formData.destination}
                        onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data Ida</label>
                        <input
                            type="date"
                            value={formData.departure_date}
                            onChange={(e) => setFormData(prev => ({ ...prev, departure_date: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data Volta</label>
                        <input
                            type="date"
                            value={formData.return_date}
                            onChange={(e) => setFormData(prev => ({ ...prev, return_date: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Passageiros</label>
                        <input
                            type="number"
                            min="1"
                            value={formData.passengers}
                            onChange={(e) => setFormData(prev => ({ ...prev, passengers: parseInt(e.target.value) }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="leisure">Lazer</option>
                            <option value="business">Negócio</option>
                            <option value="group">Grupo</option>
                        </select>
                    </div>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                    <input
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={() => setShowNewTravel(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                        Criar Viagem
                    </button>
                </div>
            </form>
        );
    };

    // Detalhes da Viagem
    const TravelDetails = () => {
        if (!selectedTravel) return null;

        return (
            <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">{selectedTravel.title}</h4>
                    <p className="text-gray-600">{selectedTravel.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Destino</label>
                        <p className="text-sm text-gray-900">{selectedTravel.destination}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Passageiros</label>
                        <p className="text-sm text-gray-900">{selectedTravel.passengers}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Data Ida</label>
                        <p className="text-sm text-gray-900">{formatDate(selectedTravel.departure_date)}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Data Volta</label>
                        <p className="text-sm text-gray-900">{formatDate(selectedTravel.return_date)}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Preço</label>
                        <p className="text-sm text-gray-900">{formatPrice(selectedTravel.price)}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTravel.status)}`}>
                            {selectedTravel.status}
                        </span>
                    </div>
                </div>
                
                {selectedTravel.notes && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Observações</label>
                        <p className="text-sm text-gray-900">{selectedTravel.notes}</p>
                    </div>
                )}
                
                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        onClick={() => setShowTravelDetails(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                        Fechar
                    </button>
                    <button
                        onClick={() => {
                            setShowTravelDetails(false);
                            handleEditTravel(selectedTravel);
                        }}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                        Editar
                    </button>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <Plane className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
                        <p className="text-lg font-medium text-gray-900">Carregando viagens...</p>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">✈️ Viagens</h1>
                                <p className="text-gray-600 mt-2">Gestão completa de viagens e reservas</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => router.push('/turismo')}
                                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Voltar ao Turismo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Estatísticas */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        {categories.map((category) => (
                            <div key={category.name} className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <div className={`p-2 bg-${category.color}-100 rounded-lg`}>
                                        {category.icon}
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">{category.name}</p>
                                        <p className="text-2xl font-bold text-gray-900">{category.count}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Barra de Ferramentas */}
                    <div className="bg-white rounded-lg shadow mb-6">
                        <div className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                                <div className="flex items-center space-x-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Buscar viagens..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    
                                    <select
                                        value={selectedFilter}
                                        onChange={(e) => setSelectedFilter(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="all">Todos os Status</option>
                                        <option value="active">Ativas</option>
                                        <option value="pending">Pendentes</option>
                                        <option value="completed">Concluídas</option>
                                        <option value="cancelled">Canceladas</option>
                                    </select>
                                </div>
                                
                                <button
                                    onClick={handleNewTravel}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Nova Viagem
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Lista de Viagens */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold">📋 Todas as Viagens</h2>
                                <span className="text-sm text-gray-600">
                                    {filteredTravels.length} viagens encontradas
                                </span>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Viagem
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Destino
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Datas
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Preço
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Tipo
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Ações
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredTravels.map((travel) => (
                                            <tr key={travel.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{travel.title}</div>
                                                        <div className="text-sm text-gray-500">{travel.passengers} passageiros</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {travel.destination}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatDate(travel.departure_date)} - {formatDate(travel.return_date)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {formatPrice(travel.price)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(travel.status)}`}>
                                                        {travel.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(travel.type)}`}>
                                                        {travel.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center space-x-2">
                                                        <button 
                                                            onClick={() => handleViewTravel(travel)}
                                                            className="text-blue-600 hover:text-blue-900"
                                                            title="Ver detalhes"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleEditTravel(travel)}
                                                            className="text-green-600 hover:text-green-900"
                                                            title="Editar"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteTravel(travel.id)}
                                                            className="text-red-600 hover:text-red-900"
                                                            title="Cancelar"
                                                        >
                                                            <Trash className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Ações Rápidas */}
                    <div className="bg-white rounded-lg shadow mt-6">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4">⚡ Ações Rápidas</h2>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <button 
                                    onClick={() => handleQuickAction('new')}
                                    className="p-4 border rounded-lg hover:bg-blue-50 transition-colors text-center"
                                >
                                    <Plane className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                                    <p className="text-sm font-medium">Nova Viagem</p>
                                </button>
                                
                                <button 
                                    onClick={() => handleQuickAction('schedule')}
                                    className="p-4 border rounded-lg hover:bg-green-50 transition-colors text-center"
                                >
                                    <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                    <p className="text-sm font-medium">Agendar</p>
                                </button>
                                
                                <button 
                                    onClick={() => handleQuickAction('reports')}
                                    className="p-4 border rounded-lg hover:bg-purple-50 transition-colors text-center"
                                >
                                    <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                                    <p className="text-sm font-medium">Relatórios</p>
                                </button>
                                
                                <button 
                                    onClick={() => handleQuickAction('tickets')}
                                    className="p-4 border rounded-lg hover:bg-yellow-50 transition-colors text-center"
                                >
                                    <Ticket className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                                    <p className="text-sm font-medium">Ingressos</p>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modais */}
                <Modal
                    isOpen={showNewTravel}
                    onClose={() => setShowNewTravel(false)}
                    title="Nova Viagem"
                >
                    <NewTravelForm />
                </Modal>

                <Modal
                    isOpen={showTravelDetails}
                    onClose={() => setShowTravelDetails(false)}
                    title="Detalhes da Viagem"
                >
                    <TravelDetails />
                </Modal>
            </div>
        </ProtectedRoute>
    );
} 