import React, { useState, useEffect } from 'react';
import { 
    Truck, 
    MapPin, 
    Star, 
    Clock, 
    DollarSign, 
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
    Car,
    Plane,
    Ship,
    Bus,
    Train,
    Play
} from 'lucide-react';
import NavigationButtons from '../components/NavigationButtons';
import ProtectedRoute from '../components/ProtectedRoute';

interface Transport {
    id: number;
    name: string;
    location: string;
    description: string;
    type: 'aéreo' | 'terrestre' | 'marítimo' | 'ferroviário';
    category: 'público' | 'privado' | 'executivo' | 'turístico';
    rating: number;
    price: number;
    duration: string;
    capacity: number;
    frequency: string;
    amenities: string[];
    contact: string;
    website: string;
    departureTime: string;
    arrivalTime: string;
    facilities: string[];
    restrictions: string[];
    images: string[];
    videos: string[];
}

export default function TransportPage() {
    const [transports, setTransports] = useState<Transport[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewTransportModal, setShowNewTransportModal] = useState(false);
    const [showEditTransportModal, setShowEditTransportModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [editingTransport, setEditingTransport] = useState<Transport | null>(null);
    const [selectedTransport, setSelectedTransport] = useState<Transport | null>(null);
    const [selectedImage, setSelectedImage] = useState<string>('');
    const [selectedVideo, setSelectedVideo] = useState<string>('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [showStatsDetails, setShowStatsDetails] = useState(false);
    const [selectedStatsType, setSelectedStatsType] = useState<string>('');
    const [statsSearchTerm, setStatsSearchTerm] = useState('');
    const [statsFilter, setStatsFilter] = useState('all');
    const [statsPeriod, setStatsPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'annual'>('daily');
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
    const [exportGenerating, setExportGenerating] = useState(false);

    // Dados mockados para transportes
    const mockTransports: Transport[] = [
        {
            id: 1,
            name: "Aeroporto de Congonhas",
            location: "São Paulo, SP",
            description: "Aeroporto doméstico principal de São Paulo, com voos para todo o Brasil.",
            type: "aéreo",
            category: "privado",
            rating: 4.2,
            price: 150.00,
            duration: "1-2 horas",
            capacity: 8000000,
            frequency: "Diário",
            amenities: ["Wi-Fi", "Entretenimento", "Refeição", "Bagagem"],
            contact: "0800 123 4567",
            website: "https://www.congonhas.com",
            departureTime: "08:00",
            arrivalTime: "10:30",
            facilities: ["Wi-Fi", "Entretenimento", "Refeição", "Bagagem"],
            restrictions: ["Não aceita pets"],
            images: ["/images/transport/congonhas-1.jpg", "/images/transport/congonhas-2.jpg"],
            videos: ["/videos/transport/congonhas.mp4"]
        },
        {
            id: 2,
            name: "Metrô de São Paulo",
            location: "São Paulo, SP",
            description: "Sistema de metrô da cidade de São Paulo, com 6 linhas e 89 estações.",
            type: "terrestre",
            category: "público",
            rating: 4.5,
            price: 4.50,
            duration: "30-60 minutos",
            capacity: 12000000,
            frequency: "A cada 3 min",
            amenities: ["Ar condicionado", "Wi-Fi", "Acessibilidade"],
            contact: "0800 770 7722",
            website: "https://www.metrosp.com",
            departureTime: "05:00",
            arrivalTime: "00:00",
            facilities: ["Estacionamento", "Banheiros", "Loja de souvenirs"],
            restrictions: ["Não aceita pets"],
            images: ["/images/transport/metro-sp-1.jpg", "/images/transport/metro-sp-2.jpg"],
            videos: ["/videos/transport/metro-sp.mp4"]
        },
        {
            id: 3,
            name: "Rodoviária Tietê",
            location: "São Paulo, SP",
            description: "Terminal rodoviário principal de São Paulo, com ônibus para todo o Brasil.",
            type: "marítimo",
            category: "público",
            rating: 3.8,
            price: 80.00,
            duration: "2-8 horas",
            capacity: 5000000,
            frequency: "Sob demanda",
            amenities: ["Wi-Fi", "Restaurante", "Loja de conveniência"],
            contact: "0800 721 1010",
            website: "https://www.tiete.com",
            departureTime: "Sob demanda",
            arrivalTime: "Sob demanda",
            facilities: ["Estacionamento", "Banheiros", "Guichês"],
            restrictions: ["Não aceita pets"],
            images: ["/images/transport/tiete-1.jpg", "/images/transport/tiete-2.jpg"],
            videos: ["/videos/transport/tiete.mp4"]
        },
        {
            id: 4,
            name: "Porto de Santos",
            location: "Santos, SP",
            description: "Maior porto da América Latina, com cruzeiros e navios de carga.",
            type: "ferroviário",
            category: "turístico",
            rating: 4.0,
            price: 200.00,
            duration: "1-7 dias",
            capacity: 2000000,
            frequency: "Semanal",
            amenities: ["Wi-Fi", "Restaurante", "Loja de souvenirs"],
            contact: "0800 333 9999",
            website: "https://www.santos.com",
            departureTime: "18:00",
            arrivalTime: "08:00",
            facilities: ["Estacionamento", "Banheiros", "Terminal"],
            restrictions: ["Documentação obrigatória"],
            images: ["/images/transport/santos-1.jpg", "/images/transport/santos-2.jpg"],
            videos: ["/videos/transport/santos.mp4"]
        }
    ];

    useEffect(() => {
        const loadTransports = async () => {
            try {
                // Simular carregamento de dados
                await new Promise(resolve => setTimeout(resolve, 1000));
                setTransports(mockTransports);
            } catch (error) {
                console.error('Erro ao carregar transportes:', error);
            } finally {
                setLoading(false);
            }
        };

        loadTransports();
    }, []);

    // Funções de gestão de transportes
    const handleNewTransport = () => {
        setShowNewTransportModal(true);
    };

    const handleEditTransport = (transport: Transport) => {
        setEditingTransport(transport);
        setShowEditTransportModal(true);
    };

    const handleDeleteTransport = (transportId: number) => {
        if (confirm('Tem certeza que deseja excluir este transporte?')) {
            setTransports(transports.filter(transport => transport.id !== transportId));
        }
    };

    // Funções de gestão de imagens
    const handleViewImages = (transport: Transport) => {
        setSelectedTransport(transport);
        setShowImageModal(true);
    };

    const handleUploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !selectedTransport) return;

        setUploadingImage(true);
        try {
            // Simular upload
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const newImageUrl = URL.createObjectURL(file);
            const updatedTransport = {
                ...selectedTransport,
                images: [...selectedTransport.images, newImageUrl]
            };
            
            setTransports(transports.map(transport => 
                transport.id === selectedTransport.id ? updatedTransport : transport
            ));
            setSelectedTransport(updatedTransport);
            
            alert('Imagem enviada com sucesso!');
        } catch (error) {
            console.error('Erro ao enviar imagem:', error);
            alert('Erro ao enviar imagem. Tente novamente.');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleDeleteImage = (imageUrl: string) => {
        if (!selectedTransport) return;
        
        if (confirm('Tem certeza que deseja excluir esta imagem?')) {
            const updatedTransport = {
                ...selectedTransport,
                images: selectedTransport.images.filter(url => url !== imageUrl)
            };
            
            setTransports(transports.map(transport => 
                transport.id === selectedTransport.id ? updatedTransport : transport
            ));
            setSelectedTransport(updatedTransport);
        }
    };

    // Funções de gestão de vídeos
    const handleViewVideos = (transport: Transport) => {
        setSelectedTransport(transport);
        setShowVideoModal(true);
    };

    const handleUploadVideo = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !selectedTransport) return;

        setUploadingVideo(true);
        try {
            // Simular upload
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const newVideoUrl = URL.createObjectURL(file);
            const updatedTransport = {
                ...selectedTransport,
                videos: [...selectedTransport.videos, newVideoUrl]
            };
            
            setTransports(transports.map(transport => 
                transport.id === selectedTransport.id ? updatedTransport : transport
            ));
            setSelectedTransport(updatedTransport);
            
            alert('Vídeo enviado com sucesso!');
        } catch (error) {
            console.error('Erro ao enviar vídeo:', error);
            alert('Erro ao enviar vídeo. Tente novamente.');
        } finally {
            setUploadingVideo(false);
        }
    };

    const handleDeleteVideo = (videoUrl: string) => {
        if (!selectedTransport) return;
        
        if (confirm('Tem certeza que deseja excluir este vídeo?')) {
            const updatedTransport = {
                ...selectedTransport,
                videos: selectedTransport.videos.filter(url => url !== videoUrl)
            };
            
            setTransports(transports.map(transport => 
                transport.id === selectedTransport.id ? updatedTransport : transport
            ));
            setSelectedTransport(updatedTransport);
        }
    };

    // Funções de estatísticas e relatórios
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
            // Simular geração de relatório
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const filename = `transport-report-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
            const content = `Relatório de Transportes\n\n`;
            
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
            alert('Relatório exportado com sucesso!');
        } catch (error) {
            console.error('Erro ao exportar relatório:', error);
            alert('Erro ao exportar relatório. Tente novamente.');
        } finally {
            setExportGenerating(false);
        }
    };

    // Funções auxiliares
    const getTypeColor = (type: string) => {
        switch (type) {
            case 'aéreo': return 'bg-blue-100 text-blue-800';
            case 'terrestre': return 'bg-green-100 text-green-800';
            case 'marítimo': return 'bg-cyan-100 text-cyan-800';
            case 'ferroviário': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'público': return 'bg-purple-100 text-purple-800';
            case 'privado': return 'bg-indigo-100 text-indigo-800';
            case 'executivo': return 'bg-yellow-100 text-yellow-800';
            case 'turístico': return 'bg-pink-100 text-pink-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'aéreo': return <Plane className="w-5 h-5" />;
            case 'terrestre': return <Car className="w-5 h-5" />;
            case 'marítimo': return <Ship className="w-5 h-5" />;
            case 'ferroviário': return <Train className="w-5 h-5" />;
            default: return <Truck className="w-5 h-5" />;
        }
    };

    const getStatsTitle = (statsType: string) => {
        switch (statsType) {
            case 'total': return 'Total de Transportes';
            case 'capacity': return 'Capacidade Total';
            case 'rating': return 'Avaliação Média';
            case 'revenue': return 'Receita Média';
            default: return 'Estatísticas';
        }
    };

    const getStatsIcon = (statsType: string) => {
        switch (statsType) {
            case 'total': return <Truck className="w-6 h-6" />;
            case 'capacity': return <Users className="w-6 h-6" />;
            case 'rating': return <Star className="w-6 h-6" />;
            case 'revenue': return <DollarSign className="w-6 h-6" />;
            default: return <Truck className="w-6 h-6" />;
        }
    };

    const getFilteredStatsData = () => {
        const data = transports.map(transport => ({
            name: transport.name,
            location: transport.location,
            type: transport.type,
            category: transport.category,
            rating: transport.rating,
            price: transport.price,
            capacity: transport.capacity
        }));

        if (statsSearchTerm) {
            return data.filter(item => 
                item.name.toLowerCase().includes(statsSearchTerm.toLowerCase()) ||
                item.location.toLowerCase().includes(statsSearchTerm.toLowerCase())
            );
        }

        if (statsFilter !== 'all') {
            return data.filter(item => item.type === statsFilter);
        }

        return data;
    };

    const getStatsDataByPeriod = () => {
        const baseData = getFilteredStatsData();
        
        switch (statsPeriod) {
            case 'daily':
                return baseData.slice(0, 5);
            case 'weekly':
                return baseData.slice(0, 10);
            case 'monthly':
                return baseData;
            case 'annual':
                return baseData;
            default:
                return baseData;
        }
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Carregando transportes...</p>
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
                                <h1 className="text-2xl font-bold text-gray-900">Gestão de Transportes</h1>
                                <p className="text-gray-600">Gerencie transportes aéreos, terrestres, marítimos e ferroviários</p>
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
                                    onClick={handleNewTransport}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Novo Transporte
                                </button>
                            </div>
                        </div>
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
                                    <p className="text-sm font-medium text-gray-600">Total de Transportes</p>
                                    <p className="text-2xl font-bold text-gray-900">{transports.length}</p>
                                </div>
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Truck className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div 
                            className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => handleStatsClick('capacity')}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Capacidade Total</p>
                                    <p className="text-2xl font-bold text-gray-900">6.5K</p>
                                </div>
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Users className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div 
                            className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => handleStatsClick('rating')}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Avaliação Média</p>
                                    <p className="text-2xl font-bold text-gray-900">4.5</p>
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
                                    <p className="text-sm font-medium text-gray-600">Receita Média</p>
                                    <p className="text-2xl font-bold text-gray-900">R$ 515</p>
                                </div>
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <DollarSign className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Transports Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {transports.map((transport) => (
                            <div key={transport.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                <div className="relative">
                                    <img
                                        src={transport.images[0] || "https://via.placeholder.com/300x200"}
                                        alt={transport.name}
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="absolute top-2 left-2 flex gap-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(transport.type)} flex items-center gap-1`}>
                                            {getTypeIcon(transport.type)}
                                            {transport.type}
                                        </span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(transport.category)}`}>
                                            {transport.category}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900">{transport.name}</h3>
                                        <div className="flex items-center">
                                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                            <span className="ml-1 text-sm text-gray-600">{transport.rating}</span>
                                        </div>
                                    </div>
                                    
                                    <p className="text-sm text-gray-600 mb-3 flex items-center">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        {transport.location}
                                    </p>
                                    
                                    <p className="text-sm text-gray-700 mb-4 line-clamp-2">{transport.description}</p>
                                    
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Users className="w-4 h-4 mr-1" />
                                            {transport.capacity} passageiros
                                        </div>
                                        <div className="text-lg font-bold text-blue-600">
                                            R$ {transport.price.toFixed(2)}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleViewImages(transport)}
                                            className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                                        >
                                            <ImageIcon className="h-4 w-4 inline mr-1" />
                                            Imagens
                                        </button>
                                        <button 
                                            onClick={() => handleViewVideos(transport)}
                                            className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                                        >
                                            <Play className="h-4 w-4 inline mr-1" />
                                            Vídeos
                                        </button>
                                        <button 
                                            onClick={() => handleEditTransport(transport)}
                                            className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                                        >
                                            <Edit className="h-4 w-4 inline mr-1" />
                                            Editar
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteTransport(transport.id)}
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

                {/* Image Management Modal */}
                {showImageModal && selectedTransport && (
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
                                            <p className="text-sm text-gray-600">{selectedTransport.name}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setShowImageModal(false);
                                            setSelectedTransport(null);
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
                                    {selectedTransport.images.map((image, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={image}
                                                alt={`${selectedTransport.name} - Imagem ${index + 1}`}
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

                                {selectedTransport.images.length === 0 && (
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
                                            setSelectedTransport(null);
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
                {showVideoModal && selectedTransport && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-purple-100 rounded-lg">
                                            <Play className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold">Gerenciar Vídeos</h3>
                                            <p className="text-sm text-gray-600">{selectedTransport.name}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setShowVideoModal(false);
                                            setSelectedTransport(null);
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
                                        <p className="text-sm text-gray-600 mb-2">Adicionar novo vídeo</p>
                                        <input
                                            type="file"
                                            accept="video/*"
                                            onChange={handleUploadVideo}
                                            disabled={uploadingVideo}
                                            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                                        />
                                        {uploadingVideo && (
                                            <p className="mt-2 text-sm text-gray-600">Fazendo upload do vídeo...</p>
                                        )}
                                    </div>
                                </div>

                                {/* Videos Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {selectedTransport.videos.map((video, index) => (
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

                                {selectedTransport.videos.length === 0 && (
                                    <div className="text-center py-8">
                                        <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500">Nenhum vídeo adicionado ainda</p>
                                    </div>
                                )}

                                {/* Footer */}
                                <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
                                    <button
                                        onClick={() => {
                                            setShowVideoModal(false);
                                            setSelectedTransport(null);
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
                                            <p className="text-sm text-gray-600">Detalhes por período</p>
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
                                            placeholder="Buscar transportes..."
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
                                        <option value="all">Todos os tipos</option>
                                        <option value="aéreo">Aéreo</option>
                                        <option value="terrestre">Terrestre</option>
                                        <option value="marítimo">Marítimo</option>
                                        <option value="ferroviário">Ferroviário</option>
                                    </select>
                                    <select
                                        value={statsPeriod}
                                        onChange={(e) => setStatsPeriod(e.target.value as any)}
                                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="daily">Diário</option>
                                        <option value="weekly">Semanal</option>
                                        <option value="monthly">Mensal</option>
                                        <option value="annual">Anual</option>
                                    </select>
                                </div>

                                {/* Data Table */}
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-white border border-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Transporte</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Localização</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Avaliação</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Preço</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Capacidade</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {getStatsDataByPeriod().map((transport, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="px-4 py-2 text-sm text-gray-900">{transport.name}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-900">{transport.location}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-900">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(transport.type)}`}>
                                                            {transport.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2 text-sm text-gray-900">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(transport.category)}`}>
                                                            {transport.category}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2 text-sm text-gray-900">{transport.rating}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-900">R$ {transport.price.toFixed(2)}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-900">{transport.capacity.toLocaleString()}</td>
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
                                <h3 className="text-lg font-semibold">Exportar Relatório</h3>
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
