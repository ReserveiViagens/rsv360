import React, { useState, useEffect } from 'react';
import { 
    UserPlus, 
    Building2, 
    Home, 
    Hotel, 
    Mountain, 
    TreePine, 
    Users, 
    Plus, 
    Edit, 
    Trash, 
    X, 
    Save, 
    Upload, 
    Image as ImageIcon,
    Eye,
    Search,
    Download,
    Phone,
    Globe,
    Calendar,
    MapPin,
    Star,
    DollarSign,
    Mail,
    FileText,
    Shield,
    Award,
    Play
} from 'lucide-react';
import NavigationButtons from '../components/NavigationButtons';
import ProtectedRoute from '../components/ProtectedRoute';

// Interfaces para diferentes tipos de proprietÃ¡rios
interface BaseUser {
    id: number;
    name: string;
    email: string;
    phone: string;
    document: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    status: 'ativo' | 'inativo' | 'pendente';
    rating: number;
    joinDate: string;
    images: string[];
    videos: string[];
}

interface Broker extends BaseUser {
    type: 'corretor';
    license: string;
    commission: number;
    specialties: string[];
    propertiesCount: number;
    totalSales: number;
    certifications: string[];
}

interface HotelOwner extends BaseUser {
    type: 'hotel';
    propertyName: string;
    propertyType: 'hotel' | 'pousada' | 'resort';
    rooms: number;
    capacity: number;
    amenities: string[];
    category: 'econÃ´mico' | 'turÃ­stico' | 'luxo' | 'executivo';
    averagePrice: number;
    occupancyRate: number;
}

interface ChaletOwner extends BaseUser {
    type: 'chalet';
    propertyName: string;
    propertyType: 'chalet' | 'chÃ¡cara' | 'casa';
    rooms: number;
    capacity: number;
    amenities: string[];
    location: 'montanha' | 'praia' | 'campo' | 'cidade';
    averagePrice: number;
    availability: string[];
}

interface HostelOwner extends BaseUser {
    type: 'hostel';
    propertyName: string;
    propertyType: 'hostel' | 'albergue';
    beds: number;
    capacity: number;
    amenities: string[];
    targetAudience: 'jovens' | 'famÃ­lia' | 'executivo' | 'mochileiros';
    averagePrice: number;
    sharedRooms: boolean;
}

interface ApartmentOwner extends BaseUser {
    type: 'apartment';
    propertyName: string;
    propertyType: 'apartamento' | 'flat' | 'studio';
    rooms: number;
    capacity: number;
    amenities: string[];
    buildingType: 'residencial' | 'comercial' | 'misto';
    averagePrice: number;
    floor: number;
}

type Owner = Broker | HotelOwner | ChaletOwner | HostelOwner | ApartmentOwner;

export default function CadastrosPage() {
    const [activeTab, setActiveTab] = useState<'brokers' | 'hotels' | 'chalets' | 'hostels' | 'apartments'>('brokers');
    const [users, setUsers] = useState<Owner[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewUserModal, setShowNewUserModal] = useState(false);
    const [showEditUserModal, setShowEditUserModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [editingUser, setEditingUser] = useState<Owner | null>(null);
    const [selectedUser, setSelectedUser] = useState<Owner | null>(null);
    const [selectedImage, setSelectedImage] = useState<string>('');
    const [selectedVideo, setSelectedVideo] = useState<string>('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [showStatsDetails, setShowStatsDetails] = useState(false);
    const [selectedStatsType, setSelectedStatsType] = useState<string>('');
    const [statsSearchTerm, setStatsSearchTerm] = useState('');
    const [statsFilter, setStatsFilter] = useState('all');
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
    const [exportGenerating, setExportGenerating] = useState(false);

    // Dados mockados para corretores
    const mockBrokers: Broker[] = [
        {
            id: 1,
            type: 'corretor',
            name: "JoÃ£o Silva",
            email: "joao.silva@imoveis.com",
            phone: "(11) 99999-9999",
            document: "123.456.789-00",
            address: "Rua das Flores, 123",
            city: "SÃ£o Paulo",
            state: "SP",
            zipCode: "01234-567",
            status: "ativo",
            rating: 4.8,
            joinDate: "2023-01-15",
            license: "CRECI 123456",
            commission: 5.0,
            specialties: ["HotÃ©is", "Resorts", "Pousadas"],
            propertiesCount: 25,
            totalSales: 1500000,
            certifications: ["CRECI", "GestÃ£o Hoteleira"],
            images: ["https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=JoÃ£o+Silva"],
            videos: []
        },
        {
            id: 2,
            type: 'corretor',
            name: "Maria Santos",
            email: "maria.santos@imoveis.com",
            phone: "(21) 88888-8888",
            document: "987.654.321-00",
            address: "Av. Copacabana, 456",
            city: "Rio de Janeiro",
            state: "RJ",
            zipCode: "22070-001",
            status: "ativo",
            rating: 4.9,
            joinDate: "2022-08-20",
            license: "CRECI 654321",
            commission: 6.0,
            specialties: ["Chalets", "ChÃ¡caras", "Casas"],
            propertiesCount: 18,
            totalSales: 2200000,
            certifications: ["CRECI", "GestÃ£o ImobiliÃ¡ria"],
            images: ["https://via.placeholder.com/300x200/10B981/FFFFFF?text=Maria+Santos"],
            videos: []
        }
    ];

    // Dados mockados para proprietÃ¡rios de hotÃ©is
    const mockHotelOwners: HotelOwner[] = [
        {
            id: 3,
            type: 'hotel',
            name: "Carlos Oliveira",
            email: "carlos@hotelmarina.com",
            phone: "(11) 77777-7777",
            document: "111.222.333-44",
            address: "Rua do ComÃ©rcio, 789",
            city: "SÃ£o Paulo",
            state: "SP",
            zipCode: "01310-100",
            status: "ativo",
            rating: 4.7,
            joinDate: "2023-03-10",
            propertyName: "Hotel Marina",
            propertyType: "hotel",
            rooms: 120,
            capacity: 240,
            amenities: ["Wi-Fi", "Piscina", "Restaurante", "Academia"],
            category: "luxo",
            averagePrice: 350.00,
            occupancyRate: 85,
            images: ["https://via.placeholder.com/300x200/F59E0B/FFFFFF?text=Hotel+Marina"],
            videos: []
        },
        {
            id: 4,
            type: 'hotel',
            name: "Ana Costa",
            email: "ana@pousadaparaiso.com",
            phone: "(31) 66666-6666",
            document: "555.666.777-88",
            address: "Rua das Palmeiras, 321",
            city: "Belo Horizonte",
            state: "MG",
            zipCode: "30112-000",
            status: "ativo",
            rating: 4.6,
            joinDate: "2023-05-22",
            propertyName: "Pousada ParaÃ­so",
            propertyType: "pousada",
            rooms: 15,
            capacity: 30,
            amenities: ["Wi-Fi", "CafÃ© da manhÃ£", "Estacionamento"],
            category: "turÃ­stico",
            averagePrice: 180.00,
            occupancyRate: 70,
            images: ["https://via.placeholder.com/300x200/EF4444/FFFFFF?text=Pousada+ParaÃ­so"],
            videos: []
        }
    ];

    // Dados mockados para proprietÃ¡rios de chalets
    const mockChaletOwners: ChaletOwner[] = [
        {
            id: 5,
            type: 'chalet',
            name: "Roberto Almeida",
            email: "roberto@chaletmontanha.com",
            phone: "(54) 55555-5555",
            document: "999.888.777-66",
            address: "Estrada da Serra, 100",
            city: "Gramado",
            state: "RS",
            zipCode: "95670-000",
            status: "ativo",
            rating: 4.8,
            joinDate: "2023-02-15",
            propertyName: "Chalet Montanha",
            propertyType: "chalet",
            rooms: 3,
            capacity: 6,
            amenities: ["Lareira", "Wi-Fi", "Churrasqueira"],
            location: "montanha",
            averagePrice: 280.00,
            availability: ["Janeiro", "Julho", "Dezembro"],
            images: ["https://via.placeholder.com/300x200/8B5CF6/FFFFFF?text=Chalet+Montanha"],
            videos: []
        }
    ];

    // Dados mockados para proprietÃ¡rios de hostels
    const mockHostelOwners: HostelOwner[] = [
        {
            id: 6,
            type: 'hostel',
            name: "Fernanda Lima",
            email: "fernanda@hostelbackpacker.com",
            phone: "(48) 44444-4444",
            document: "333.444.555-66",
            address: "Rua da Praia, 200",
            city: "FlorianÃ³polis",
            state: "SC",
            zipCode: "88010-000",
            status: "ativo",
            rating: 4.4,
            joinDate: "2023-04-18",
            propertyName: "Hostel Backpacker",
            propertyType: "hostel",
            beds: 50,
            capacity: 50,
            amenities: ["Wi-Fi", "Cozinha compartilhada", "Lavanderia"],
            targetAudience: "mochileiros",
            averagePrice: 45.00,
            sharedRooms: true,
            images: ["https://via.placeholder.com/300x200/06B6D4/FFFFFF?text=Hostel+Backpacker"],
            videos: []
        }
    ];

    // Dados mockados para proprietÃ¡rios de apartamentos
    const mockApartmentOwners: ApartmentOwner[] = [
        {
            id: 7,
            type: 'apartment',
            name: "Pedro Mendes",
            email: "pedro@aptexecutivo.com",
            phone: "(11) 33333-3333",
            document: "777.888.999-00",
            address: "Av. Paulista, 1000",
            city: "SÃ£o Paulo",
            state: "SP",
            zipCode: "01310-100",
            status: "ativo",
            rating: 4.5,
            joinDate: "2023-06-30",
            propertyName: "Apartamento Executivo",
            propertyType: "apartamento",
            rooms: 2,
            capacity: 4,
            amenities: ["Wi-Fi", "Ar condicionado", "Cozinha"],
            buildingType: "residencial",
            averagePrice: 200.00,
            floor: 15,
            images: ["https://via.placeholder.com/300x200/84CC16/FFFFFF?text=Apt+Executivo"],
            videos: []
        }
    ];

    useEffect(() => {
        const loadUsers = async () => {
            try {
                // Simular carregamento de dados
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                switch (activeTab) {
                    case 'brokers':
                        setUsers(mockBrokers);
                        break;
                    case 'hotels':
                        setUsers(mockHotelOwners);
                        break;
                    case 'chalets':
                        setUsers(mockChaletOwners);
                        break;
                    case 'hostels':
                        setUsers(mockHostelOwners);
                        break;
                    case 'apartments':
                        setUsers(mockApartmentOwners);
                        break;
                }
            } catch (error) {
                console.error('Erro ao carregar usuÃ¡rios:', error);
            } finally {
                setLoading(false);
            }
        };

        setLoading(true);
        loadUsers();
    }, [activeTab]);

    // FunÃ§Ãµes de gestÃ£o de usuÃ¡rios
    const handleNewUser = () => {
        setShowNewUserModal(true);
    };

    const handleEditUser = (user: Owner) => {
        setEditingUser(user);
        setShowEditUserModal(true);
    };

    const handleDeleteUser = (userId: number) => {
        if (confirm('Tem certeza que deseja excluir este cadastro?')) {
            setUsers(users.filter(user => user.id !== userId));
        }
    };

    // FunÃ§Ãµes de gestÃ£o de imagens
    const handleViewImages = (user: Owner) => {
        setSelectedUser(user);
        setShowImageModal(true);
    };

    const handleUploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !selectedUser) return;

        setUploadingImage(true);
        try {
            // Simular upload
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const newImageUrl = URL.createObjectURL(file);
            const updatedUser = {
                ...selectedUser,
                images: [...selectedUser.images, newImageUrl]
            };
            
            setUsers(users.map(user => 
                user.id === selectedUser.id ? updatedUser : user
            ));
            setSelectedUser(updatedUser);
            
            alert('Imagem enviada com sucesso!');
        } catch (error) {
            console.error('Erro ao enviar imagem:', error);
            alert('Erro ao enviar imagem. Tente novamente.');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleDeleteImage = (imageUrl: string) => {
        if (!selectedUser) return;
        
        if (confirm('Tem certeza que deseja excluir esta imagem?')) {
            const updatedUser = {
                ...selectedUser,
                images: selectedUser.images.filter(url => url !== imageUrl)
            };
            
            setUsers(users.map(user => 
                user.id === selectedUser.id ? updatedUser : user
            ));
            setSelectedUser(updatedUser);
        }
    };

    // FunÃ§Ãµes de gestÃ£o de vÃ­deos
    const handleViewVideos = (user: Owner) => {
        setSelectedUser(user);
        setShowVideoModal(true);
    };

    const handleUploadVideo = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !selectedUser) return;

        setUploadingVideo(true);
        try {
            // Simular upload
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const newVideoUrl = URL.createObjectURL(file);
            const updatedUser = {
                ...selectedUser,
                videos: [...selectedUser.videos, newVideoUrl]
            };
            
            setUsers(users.map(user => 
                user.id === selectedUser.id ? updatedUser : user
            ));
            setSelectedUser(updatedUser);
            
            alert('VÃ­deo enviado com sucesso!');
        } catch (error) {
            console.error('Erro ao enviar vÃ­deo:', error);
            alert('Erro ao enviar vÃ­deo. Tente novamente.');
        } finally {
            setUploadingVideo(false);
        }
    };

    const handleDeleteVideo = (videoUrl: string) => {
        if (!selectedUser) return;
        
        if (confirm('Tem certeza que deseja excluir este vÃ­deo?')) {
            const updatedUser = {
                ...selectedUser,
                videos: selectedUser.videos.filter(url => url !== videoUrl)
            };
            
            setUsers(users.map(user => 
                user.id === selectedUser.id ? updatedUser : user
            ));
            setSelectedUser(updatedUser);
        }
    };

    // FunÃ§Ãµes de estatÃ­sticas e relatÃ³rios
    const handleStatsClick = (statsType: string) => {
        setSelectedStatsType(statsType);
        setShowStatsDetails(true);
    };

    const handleExportReport = () => {
        setShowExportModal(true);
    };

    const handleExportSubmit = async () => {
        setExportGenerating(true);
        try {
            // Simular geraÃ§Ã£o de relatÃ³rio
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const filename = `cadastros-${activeTab}-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
            const content = `RelatÃ³rio de Cadastros - ${activeTab}\n\n`;
            
            // Simular download
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            setShowExportModal(false);
            alert('RelatÃ³rio exportado com sucesso!');
        } catch (error) {
            console.error('Erro ao exportar relatÃ³rio:', error);
            alert('Erro ao exportar relatÃ³rio. Tente novamente.');
        } finally {
            setExportGenerating(false);
        }
    };

    // FunÃ§Ãµes auxiliares
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ativo': return 'bg-green-100 text-green-800';
            case 'inativo': return 'bg-red-100 text-red-800';
            case 'pendente': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'corretor': return <Users className="w-5 h-5" />;
            case 'hotel': return <Hotel className="w-5 h-5" />;
            case 'chalet': return <Mountain className="w-5 h-5" />;
            case 'hostel': return <Home className="w-5 h-5" />;
            case 'apartment': return <Building2 className="w-5 h-5" />;
            default: return <UserPlus className="w-5 h-5" />;
        }
    };

    const getStatsTitle = (statsType: string) => {
        switch (statsType) {
            case 'total': return 'Total de Cadastros';
            case 'active': return 'Cadastros Ativos';
            case 'rating': return 'AvaliaÃ§Ã£o MÃ©dia';
            case 'revenue': return 'Receita Total';
            default: return 'EstatÃ­sticas';
        }
    };

    const getStatsIcon = (statsType: string) => {
        switch (statsType) {
            case 'total': return <UserPlus className="w-6 h-6" />;
            case 'active': return <Shield className="w-6 h-6" />;
            case 'rating': return <Star className="w-6 h-6" />;
            case 'revenue': return <DollarSign className="w-6 h-6" />;
            default: return <UserPlus className="w-6 h-6" />;
        }
    };

    const getFilteredStatsData = () => {
        const data = users.map(user => ({
            name: user.name,
            email: user.email,
            type: user.type,
            status: user.status,
            rating: user.rating,
            joinDate: user.joinDate
        }));

        if (statsSearchTerm) {
            return data.filter(item => 
                item.name.toLowerCase().includes(statsSearchTerm.toLowerCase()) ||
                item.email.toLowerCase().includes(statsSearchTerm.toLowerCase())
            );
        }

        if (statsFilter !== 'all') {
            return data.filter(item => item.status === statsFilter);
        }

        return data;
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Carregando cadastros...</p>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">GestÃ£o de Cadastros</h1>
                                <p className="text-gray-600">Gerencie corretores e proprietÃ¡rios de acomodaÃ§Ãµes</p>
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleExportReport}
                                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                                >
                                    <Download className="w-4 h-4" />
                                    Exportar
                                </button>
                                <button
                                    onClick={handleNewUser}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Novo Cadastro
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <nav className="flex space-x-8">
                            <button
                                onClick={() => setActiveTab('brokers')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'brokers'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <Users className="w-4 h-4 inline mr-2" />
                                Corretores
                            </button>
                            <button
                                onClick={() => setActiveTab('hotels')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'hotels'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <Hotel className="w-4 h-4 inline mr-2" />
                                HotÃ©is/Pousadas/Resorts
                            </button>
                            <button
                                onClick={() => setActiveTab('chalets')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'chalets'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <Mountain className="w-4 h-4 inline mr-2" />
                                Chalets/ChÃ¡caras
                            </button>
                            <button
                                onClick={() => setActiveTab('hostels')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'hostels'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <Home className="w-4 h-4 inline mr-2" />
                                Hostels
                            </button>
                            <button
                                onClick={() => setActiveTab('apartments')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'apartments'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <Building2 className="w-4 h-4 inline mr-2" />
                                Apartamentos
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div 
                            className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => handleStatsClick('total')}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total de Cadastros</p>
                                    <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                                </div>
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <UserPlus className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div 
                            className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => handleStatsClick('active')}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Cadastros Ativos</p>
                                    <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.status === 'ativo').length}</p>
                                </div>
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Shield className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div 
                            className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => handleStatsClick('rating')}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">AvaliaÃ§Ã£o MÃ©dia</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {(users.reduce((acc, user) => acc + user.rating, 0) / users.length).toFixed(1)}
                                    </p>
                                </div>
                                <div className="p-2 bg-yellow-100 rounded-lg">
                                    <Star className="w-6 h-6 text-yellow-600" />
                                </div>
                            </div>
                        </div>

                        <div 
                            className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => handleStatsClick('revenue')}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Receita Total</p>
                                    <p className="text-2xl font-bold text-gray-900">R$ 3.7M</p>
                                </div>
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <DollarSign className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Users Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {users.map((user) => (
                            <div key={user.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                <div className="relative">
                                    <img
                                        src={user.images[0] || "https://via.placeholder.com/300x200"}
                                        alt={user.name}
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="absolute top-2 left-2 flex gap-2">
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex items-center gap-1">
                                            {getTypeIcon(user.type)}
                                            {user.type}
                                        </span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                                            {user.status}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                                        <div className="flex items-center">
                                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                            <span className="ml-1 text-sm text-gray-600">{user.rating}</span>
                                        </div>
                                    </div>
                                    
                                    <p className="text-sm text-gray-600 mb-3 flex items-center">
                                        <Mail className="w-4 h-4 mr-1" />
                                        {user.email}
                                    </p>
                                    
                                    <p className="text-sm text-gray-600 mb-3 flex items-center">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        {user.city}, {user.state}
                                    </p>

                                    {/* InformaÃ§Ãµes especÃ­ficas por tipo */}
                                    {user.type === 'corretor' && (
                                        <div className="mb-4">
                                            <p className="text-sm text-gray-700">
                                                <strong>LicenÃ§a:</strong> {(user as Broker).license}
                                            </p>
                                            <p className="text-sm text-gray-700">
                                                <strong>Propriedades:</strong> {(user as Broker).propertiesCount}
                                            </p>
                                        </div>
                                    )}

                                    {user.type === 'hotel' && (
                                        <div className="mb-4">
                                            <p className="text-sm text-gray-700">
                                                <strong>Propriedade:</strong> {(user as HotelOwner).propertyName}
                                            </p>
                                            <p className="text-sm text-gray-700">
                                                <strong>Quartos:</strong> {(user as HotelOwner).rooms}
                                            </p>
                                        </div>
                                    )}

                                    {user.type === 'chalet' && (
                                        <div className="mb-4">
                                            <p className="text-sm text-gray-700">
                                                <strong>Propriedade:</strong> {(user as ChaletOwner).propertyName}
                                            </p>
                                            <p className="text-sm text-gray-700">
                                                <strong>LocalizaÃ§Ã£o:</strong> {(user as ChaletOwner).location}
                                            </p>
                                        </div>
                                    )}

                                    {user.type === 'hostel' && (
                                        <div className="mb-4">
                                            <p className="text-sm text-gray-700">
                                                <strong>Propriedade:</strong> {(user as HostelOwner).propertyName}
                                            </p>
                                            <p className="text-sm text-gray-700">
                                                <strong>Leitos:</strong> {(user as HostelOwner).beds}
                                            </p>
                                        </div>
                                    )}

                                    {user.type === 'apartment' && (
                                        <div className="mb-4">
                                            <p className="text-sm text-gray-700">
                                                <strong>Propriedade:</strong> {(user as ApartmentOwner).propertyName}
                                            </p>
                                            <p className="text-sm text-gray-700">
                                                <strong>Andar:</strong> {(user as ApartmentOwner).floor}
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleViewImages(user)}
                                            className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                                        >
                                            <ImageIcon className="h-4 w-4 inline mr-1" />
                                            Imagens
                                        </button>
                                        <button 
                                            onClick={() => handleViewVideos(user)}
                                            className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                                        >
                                            <Play className="h-4 w-4 inline mr-1" />
                                            VÃ­deos
                                        </button>
                                        <button 
                                            onClick={() => handleEditUser(user)}
                                            className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                                        >
                                            <Edit className="h-4 w-4 inline mr-1" />
                                            Editar
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteUser(user.id)}
                                            className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                                        >
                                            <Trash className="h-4 w-4 inline mr-1" />
                                            Excluir
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Modais serÃ£o implementados nas prÃ³ximas etapas */}

                {/* New User Modal */}
                {showNewUserModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <UserPlus className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold">Novo Cadastro</h3>
                                            <p className="text-sm text-gray-600">
                                                {activeTab === 'brokers' && 'Cadastrar novo corretor'}
                                                {activeTab === 'hotels' && 'Cadastrar proprietÃ¡rio de hotel/pousada/resort'}
                                                {activeTab === 'chalets' && 'Cadastrar proprietÃ¡rio de chalet/chÃ¡cara'}
                                                {activeTab === 'hostels' && 'Cadastrar proprietÃ¡rio de hostel'}
                                                {activeTab === 'apartments' && 'Cadastrar proprietÃ¡rio de apartamento'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowNewUserModal(false)}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>

                                <UserForm 
                                    type={activeTab}
                                    onSubmit={(data) => {
                                        console.log('Novo usuÃ¡rio:', data);
                                        setShowNewUserModal(false);
                                        alert('Cadastro criado com sucesso!');
                                    }}
                                    onCancel={() => setShowNewUserModal(false)}
                                    isEditing={false}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit User Modal */}
                {showEditUserModal && editingUser && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Edit className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold">Editar Cadastro</h3>
                                            <p className="text-sm text-gray-600">{editingUser.name}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setShowEditUserModal(false);
                                            setEditingUser(null);
                                        }}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>

                                <UserForm 
                                    type={editingUser.type}
                                    onSubmit={(data) => {
                                        console.log('UsuÃ¡rio editado:', data);
                                        setShowEditUserModal(false);
                                        setEditingUser(null);
                                        alert('Cadastro atualizado com sucesso!');
                                    }}
                                    onCancel={() => {
                                        setShowEditUserModal(false);
                                        setEditingUser(null);
                                    }}
                                    isEditing={true}
                                    initialData={editingUser}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Image Management Modal */}
                {showImageModal && selectedUser && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-purple-100 rounded-lg">
                                            <ImageIcon className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold">Gerenciar Imagens</h3>
                                            <p className="text-sm text-gray-600">{selectedUser.name}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setShowImageModal(false);
                                            setSelectedUser(null);
                                        }}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>

                                {/* Upload Section */}
                                <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                                    <div className="text-center">
                                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-600 mb-2">Adicionar nova imagem</p>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleUploadImage}
                                            disabled={uploadingImage}
                                            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                                        />
                                        {uploadingImage && (
                                            <p className="mt-2 text-sm text-gray-600">Fazendo upload da imagem...</p>
                                        )}
                                    </div>
                                </div>

                                {/* Images Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {selectedUser.images.map((image, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={image}
                                                alt={`${selectedUser.name} - Imagem ${index + 1}`}
                                                className="w-full h-48 object-cover rounded-lg"
                                            />
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                                                    <button
                                                        onClick={() => setSelectedImage(image)}
                                                        className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                                                        title="Visualizar"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteImage(image)}
                                                        className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors"
                                                        title="Excluir"
                                                    >
                                                        <Trash className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {selectedUser.images.length === 0 && (
                                    <div className="text-center py-8">
                                        <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500">Nenhuma imagem adicionada ainda</p>
                                    </div>
                                )}

                                {/* Footer */}
                                <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
                                    <button
                                        onClick={() => {
                                            setShowImageModal(false);
                                            setSelectedUser(null);
                                        }}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                    >
                                        Fechar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Video Management Modal */}
                {showVideoModal && selectedUser && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-purple-100 rounded-lg">
                                            <Play className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold">Gerenciar VÃ­deos</h3>
                                            <p className="text-sm text-gray-600">{selectedUser.name}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setShowVideoModal(false);
                                            setSelectedUser(null);
                                        }}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>

                                {/* Upload Section */}
                                <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                                    <div className="text-center">
                                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-600 mb-2">Adicionar novo vÃ­deo</p>
                                        <input
                                            type="file"
                                            accept="video/*"
                                            onChange={handleUploadVideo}
                                            disabled={uploadingVideo}
                                            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                                        />
                                        {uploadingVideo && (
                                            <p className="mt-2 text-sm text-gray-600">Fazendo upload do vÃ­deo...</p>
                                        )}
                                    </div>
                                </div>

                                {/* Videos Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {selectedUser.videos.map((video, index) => (
                                        <div key={index} className="relative group">
                                            <video
                                                src={video}
                                                className="w-full h-48 object-cover rounded-lg"
                                                controls
                                            />
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <button
                                                    onClick={() => handleDeleteVideo(video)}
                                                    className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors"
                                                    title="Excluir"
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {selectedUser.videos.length === 0 && (
                                    <div className="text-center py-8">
                                        <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500">Nenhum vÃ­deo adicionado ainda</p>
                                    </div>
                                )}

                                {/* Footer */}
                                <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
                                    <button
                                        onClick={() => {
                                            setShowVideoModal(false);
                                            setSelectedUser(null);
                                        }}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                    >
                                        Fechar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Details Modal */}
                {showStatsDetails && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            {getStatsIcon(selectedStatsType)}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold">{getStatsTitle(selectedStatsType)}</h3>
                                            <p className="text-sm text-gray-600">Detalhes por perÃ­odo</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowStatsDetails(false)}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>

                                {/* Filters */}
                                <div className="flex flex-wrap gap-4 mb-6">
                                    <div className="flex-1 min-w-64">
                                        <input
                                            type="text"
                                            placeholder="Buscar cadastros..."
                                            value={statsSearchTerm}
                                            onChange={(e) => setStatsSearchTerm(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <select
                                        value={statsFilter}
                                        onChange={(e) => setStatsFilter(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="all">Todos os status</option>
                                        <option value="ativo">Ativo</option>
                                        <option value="inativo">Inativo</option>
                                        <option value="pendente">Pendente</option>
                                    </select>
                                </div>

                                {/* Data Table */}
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-white border border-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">AvaliaÃ§Ã£o</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Data de Cadastro</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {getFilteredStatsData().map((user, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="px-4 py-2 text-sm text-gray-900">{user.name}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-900">{user.email}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-900">
                                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            {user.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2 text-sm text-gray-900">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                                                            {user.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2 text-sm text-gray-900">{user.rating}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-900">{user.joinDate}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Footer */}
                                <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
                                    <button
                                        onClick={() => setShowStatsDetails(false)}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                    >
                                        Fechar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Export Modal */}
                {showExportModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md mx-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Exportar RelatÃ³rio</h3>
                                <button onClick={() => setShowExportModal(false)} className="text-gray-500 hover:text-gray-700">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Formato
                                    </label>
                                    <select
                                        value={exportFormat}
                                        onChange={(e) => setExportFormat(e.target.value as 'csv' | 'pdf')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="csv">CSV</option>
                                        <option value="pdf">PDF</option>
                                    </select>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={handleExportSubmit}
                                        disabled={exportGenerating}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                    >
                                        {exportGenerating ? 'Gerando...' : 'Exportar'}
                                    </button>
                                    <button
                                        onClick={() => setShowExportModal(false)}
                                        className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Image Preview Modal */}
                {selectedImage && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60">
                        <div className="relative max-w-4xl max-h-[90vh]">
                            <img
                                src={selectedImage}
                                alt="Preview"
                                className="max-w-full max-h-full object-contain"
                            />
                            <button
                                onClick={() => setSelectedImage('')}
                                className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full p-2"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}

// Componente de formulÃ¡rio genÃ©rico
interface UserFormProps {
    type: string;
    onSubmit: (data: any) => void;
    onCancel: () => void;
    isEditing: boolean;
    initialData?: Owner;
}

const UserForm: React.FC<UserFormProps> = ({ type, onSubmit, onCancel, isEditing, initialData }) => {
    const [formData, setFormData] = useState<any>({
        name: '',
        email: '',
        phone: '',
        document: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        status: 'ativo',
        ...(type === 'brokers' && {
            license: '',
            commission: 5.0,
            specialties: [],
            certifications: []
        }),
        ...(type === 'hotels' && {
            propertyName: '',
            propertyType: 'hotel',
            rooms: 1,
            capacity: 2,
            amenities: [],
            category: 'turÃ­stico',
            averagePrice: 0
        }),
        ...(type === 'chalets' && {
            propertyName: '',
            propertyType: 'chalet',
            rooms: 1,
            capacity: 2,
            amenities: [],
            location: 'montanha',
            averagePrice: 0
        }),
        ...(type === 'hostels' && {
            propertyName: '',
            propertyType: 'hostel',
            beds: 10,
            capacity: 10,
            amenities: [],
            targetAudience: 'mochileiros',
            averagePrice: 0,
            sharedRooms: true
        }),
        ...(type === 'apartments' && {
            propertyName: '',
            propertyType: 'apartamento',
            rooms: 1,
            capacity: 2,
            amenities: [],
            buildingType: 'residencial',
            averagePrice: 0,
            floor: 1
        })
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev: any) => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : value
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* InformaÃ§Ãµes bÃ¡sicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome Completo *
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefone *
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        CPF/CNPJ *
                    </label>
                    <input
                        type="text"
                        name="document"
                        value={formData.document}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        EndereÃ§o *
                    </label>
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cidade *
                    </label>
                    <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado *
                    </label>
                    <select
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Selecione...</option>
                        <option value="AC">Acre</option>
                        <option value="AL">Alagoas</option>
                        <option value="AP">AmapÃ¡</option>
                        <option value="AM">Amazonas</option>
                        <option value="BA">Bahia</option>
                        <option value="CE">CearÃ¡</option>
                        <option value="DF">Distrito Federal</option>
                        <option value="ES">EspÃ­rito Santo</option>
                        <option value="GO">GoiÃ¡s</option>
                        <option value="MA">MaranhÃ£o</option>
                        <option value="MT">Mato Grosso</option>
                        <option value="MS">Mato Grosso do Sul</option>
                        <option value="MG">Minas Gerais</option>
                        <option value="PA">ParÃ¡</option>
                        <option value="PB">ParaÃ­ba</option>
                        <option value="PR">ParanÃ¡</option>
                        <option value="PE">Pernambuco</option>
                        <option value="PI">PiauÃ­</option>
                        <option value="RJ">Rio de Janeiro</option>
                        <option value="RN">Rio Grande do Norte</option>
                        <option value="RS">Rio Grande do Sul</option>
                        <option value="RO">RondÃ´nia</option>
                        <option value="RR">Roraima</option>
                        <option value="SC">Santa Catarina</option>
                        <option value="SP">SÃ£o Paulo</option>
                        <option value="SE">Sergipe</option>
                        <option value="TO">Tocantins</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        CEP *
                    </label>
                    <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                    </label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="ativo">Ativo</option>
                        <option value="inativo">Inativo</option>
                        <option value="pendente">Pendente</option>
                    </select>
                </div>
            </div>

            {/* Campos especÃ­ficos por tipo */}
            {type === 'brokers' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            LicenÃ§a CRECI *
                        </label>
                        <input
                            type="text"
                            name="license"
                            value={formData.license}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            ComissÃ£o (%)
                        </label>
                        <input
                            type="number"
                            name="commission"
                            value={formData.commission}
                            onChange={handleChange}
                            step="0.1"
                            min="0"
                            max="100"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            )}

            {(type === 'hotels' || type === 'chalets' || type === 'hostels' || type === 'apartments') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nome da Propriedade *
                        </label>
                        <input
                            type="text"
                            name="propertyName"
                            value={formData.propertyName}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipo de Propriedade
                        </label>
                        <select
                            name="propertyType"
                            value={formData.propertyType}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {type === 'hotels' && (
                                <>
                                    <option value="hotel">Hotel</option>
                                    <option value="pousada">Pousada</option>
                                    <option value="resort">Resort</option>
                                </>
                            )}
                            {type === 'chalets' && (
                                <>
                                    <option value="chalet">Chalet</option>
                                    <option value="chÃ¡cara">ChÃ¡cara</option>
                                    <option value="casa">Casa</option>
                                </>
                            )}
                            {type === 'hostels' && (
                                <>
                                    <option value="hostel">Hostel</option>
                                    <option value="albergue">Albergue</option>
                                </>
                            )}
                            {type === 'apartments' && (
                                <>
                                    <option value="apartamento">Apartamento</option>
                                    <option value="flat">Flat</option>
                                    <option value="studio">Studio</option>
                                </>
                            )}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {type === 'hostels' ? 'NÃºmero de Leitos' : 'NÃºmero de Quartos'}
                        </label>
                        <input
                            type="number"
                            name={type === 'hostels' ? 'beds' : 'rooms'}
                            value={formData[type === 'hostels' ? 'beds' : 'rooms']}
                            onChange={handleChange}
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Capacidade (Pessoas)
                        </label>
                        <input
                            type="number"
                            name="capacity"
                            value={formData.capacity}
                            onChange={handleChange}
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            PreÃ§o MÃ©dio (R$)
                        </label>
                        <input
                            type="number"
                            name="averagePrice"
                            value={formData.averagePrice}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {type === 'hotels' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Categoria
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="econÃ´mico">EconÃ´mico</option>
                                <option value="turÃ­stico">TurÃ­stico</option>
                                <option value="luxo">Luxo</option>
                                <option value="executivo">Executivo</option>
                            </select>
                        </div>
                    )}

                    {type === 'chalets' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                LocalizaÃ§Ã£o
                            </label>
                            <select
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="montanha">Montanha</option>
                                <option value="praia">Praia</option>
                                <option value="campo">Campo</option>
                                <option value="cidade">Cidade</option>
                            </select>
                        </div>
                    )}

                    {type === 'hostels' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                PÃºblico-Alvo
                            </label>
                            <select
                                name="targetAudience"
                                value={formData.targetAudience}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="mochileiros">Mochileiros</option>
                                <option value="jovens">Jovens</option>
                                <option value="famÃ­lia">FamÃ­lia</option>
                                <option value="executivo">Executivo</option>
                            </select>
                        </div>
                    )}

                    {type === 'apartments' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tipo de EdifÃ­cio
                            </label>
                            <select
                                name="buildingType"
                                value={formData.buildingType}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="residencial">Residencial</option>
                                <option value="comercial">Comercial</option>
                                <option value="misto">Misto</option>
                            </select>
                        </div>
                    )}

                    {type === 'apartments' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Andar
                            </label>
                            <input
                                type="number"
                                name="floor"
                                value={formData.floor}
                                onChange={handleChange}
                                min="1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    )}
                </div>
            )}

            {/* BotÃµes */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {isEditing ? 'Atualizar' : 'Cadastrar'}
                </button>
            </div>
        </form>
    );
}; 
