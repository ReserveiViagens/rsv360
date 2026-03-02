import React, { useState, useEffect } from 'react';
import { 
    Mountain, 
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
    Play
} from 'lucide-react';
import NavigationButtons from '../components/NavigationButtons';
import ProtectedRoute from '../components/ProtectedRoute';

interface Attraction {
    id: number;
    name: string;
    location: string;
    description: string;
    rating: number;
    price: number;
    duration: string;
    visitors: number;
    image?: string;
    category: string;
    contact: {
        phone: string;
        email: string;
        website: string;
    };
    website: string;
    openingHours: string;
    bestTime: string;
    facilities: string[];
    restrictions: string[];
    images: string[];
    videos: string[];
    status?: string;
    createdAt?: string;
    updatedAt?: string;
    amenities?: string[];
    dailyVisitors?: number;
    weeklyVisitors?: number;
    monthlyVisitors?: number;
    annualVisitors?: number;
    dailyRevenue?: number;
    weeklyRevenue?: number;
    monthlyRevenue?: number;
    annualRevenue?: number;
}

export default function AttractionsPage() {
    const [attractions, setAttractions] = useState<Attraction[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewAttractionModal, setShowNewAttractionModal] = useState(false);
    const [showEditAttractionModal, setShowEditAttractionModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [editingAttraction, setEditingAttraction] = useState<Attraction | null>(null);
    const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null);
    const [selectedImage, setSelectedImage] = useState<string>('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [showStatsDetails, setShowStatsDetails] = useState(false);
    const [selectedStatsType, setSelectedStatsType] = useState<string>('');
    const [statsSearchTerm, setStatsSearchTerm] = useState('');
    const [statsFilter, setStatsFilter] = useState('all');
    const [statsPeriod, setStatsPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'annual'>('daily');
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
    const [exportGenerating, setExportGenerating] = useState(false);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState<string>('');
    const [uploadingVideo, setUploadingVideo] = useState(false);

    // Dados mockados para atrações
    const mockAttractions: Attraction[] = [
        {
            id: 1,
            name: "Cristo Redentor",
            location: "Rio de Janeiro, RJ",
            description: "Monumento art déco de Jesus Cristo no topo do Corcovado, oferecendo vistas panorâmicas da cidade.",
            category: "monumento",
            rating: 4.8,
            price: 85.00,
            duration: "2-3 horas",
            visitors: 2500000,
            amenities: ["Vista panorâmica", "Restaurante", "Loja de souvenirs"],
            facilities: ["Estacionamento", "Banheiros", "Acessibilidade"],
            restrictions: ["Não aceita pets"],
            images: ["/images/attractions/cristo-redentor-1.jpg", "/images/attractions/cristo-redentor-2.jpg"],
            videos: ["/videos/attractions/cristo-redentor.mp4"],
            contact: {
                phone: "(21) 2558-1329",
                email: "info@cristoredentor.com",
                website: "www.cristoredentor.com"
            },
            website: "www.cristoredentor.com",
            openingHours: "08:00 - 19:00",
            bestTime: "Manhã cedo ou fim da tarde",
            status: "active",
            createdAt: "2024-01-15",
            updatedAt: "2024-01-20"
        },
        {
            id: 2,
            name: "Pão de Açúcar",
            location: "Rio de Janeiro, RJ",
            description: "Complexo de bondinhos que leva ao topo do Pão de Açúcar, com vistas espetaculares da Baía de Guanabara.",
            category: "monumento",
            rating: 4.7,
            price: 120.00,
            duration: "3-4 horas",
            visitors: 1800000,
            amenities: ["Bondinho", "Vista panorâmica", "Restaurante"],
            facilities: ["Estacionamento", "Banheiros", "Loja de souvenirs"],
            restrictions: ["Não aceita pets"],
            images: ["/images/attractions/pao-acucar-1.jpg", "/images/attractions/pao-acucar-2.jpg"],
            videos: ["/videos/attractions/pao-acucar.mp4"],
            contact: {
                phone: "(21) 2546-8400",
                email: "info@paodeacucar.com",
                website: "www.paodeacucar.com"
            },
            website: "www.paodeacucar.com",
            openingHours: "08:30 - 19:30",
            bestTime: "Manhã ou fim da tarde",
            status: "active",
            createdAt: "2024-01-10",
            updatedAt: "2024-01-18"
        },
        {
            id: 3,
            name: "Cataratas do Iguaçu",
            location: "Foz do Iguaçu, PR",
            description: "Uma das maiores cachoeiras do mundo, com 275 quedas d'água em meio à Mata Atlântica.",
            category: "natureza",
            rating: 4.9,
            price: 95.00,
            duration: "4-5 horas",
            visitors: 1500000,
            amenities: ["Trilhas", "Passeio de barco", "Restaurante"],
            facilities: ["Estacionamento", "Banheiros", "Loja de souvenirs"],
            restrictions: ["Não aceita pets"],
            images: ["/images/attractions/cataratas-iguacu-1.jpg", "/images/attractions/cataratas-iguacu-2.jpg"],
            videos: ["/videos/attractions/cataratas-iguacu.mp4"],
            contact: {
                phone: "(45) 3521-4400",
                email: "info@cataratasdoiguacu.com",
                website: "www.cataratasdoiguacu.com"
            },
            website: "www.cataratasdoiguacu.com",
            openingHours: "09:00 - 17:00",
            bestTime: "Manhã para evitar multidões",
            status: "active",
            createdAt: "2024-01-05",
            updatedAt: "2024-01-12"
        }
    ];

    useEffect(() => {
        // Simular carregamento de dados
        const loadAttractions = async () => {
            setLoading(true);
            // Simular delay de API
            await new Promise(resolve => setTimeout(resolve, 1000));
            setAttractions(mockAttractions);
            setLoading(false);
        };

        loadAttractions();
    }, []);

    const handleNewAttraction = () => {
        setShowNewAttractionModal(true);
    };

    const handleEditAttraction = (attraction: Attraction) => {
        setEditingAttraction(attraction);
        setShowEditAttractionModal(true);
    };

    const handleDeleteAttraction = (attractionId: number) => {
        if (confirm('Tem certeza que deseja excluir esta atração?')) {
            setAttractions(prev => prev.filter(attraction => attraction.id !== attractionId));
            alert('Atração excluída com sucesso!');
        }
    };

    const handleViewImages = (attraction: Attraction) => {
        setSelectedAttraction(attraction);
        setShowImageModal(true);
    };

    const handleUploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !selectedAttraction) return;

        setUploadingImage(true);
        
        // Simular upload de imagem
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const newImageUrl = URL.createObjectURL(file);
        
        setAttractions(prev => prev.map(attraction => 
            attraction.id === selectedAttraction.id 
                ? { ...attraction, images: [...attraction.images, newImageUrl] }
                : attraction
        ));
        
        setSelectedAttraction(prev => prev ? { ...prev, images: [...prev.images, newImageUrl] } : null);
        
        setUploadingImage(false);
        alert('Imagem adicionada com sucesso!');
    };

    const handleDeleteImage = (imageUrl: string) => {
        if (!selectedAttraction) return;
        
        if (confirm('Tem certeza que deseja excluir esta imagem?')) {
            const updatedAttraction = {
                ...selectedAttraction,
                images: selectedAttraction.images.filter(url => url !== imageUrl)
            };
            
            setAttractions(attractions.map(attraction => 
                attraction.id === selectedAttraction.id ? updatedAttraction : attraction
            ));
            setSelectedAttraction(updatedAttraction);
        }
    };

    // Funções para gestão de vídeos
    const handleViewVideos = (attraction: Attraction) => {
        setSelectedAttraction(attraction);
        setShowVideoModal(true);
    };

    const handleUploadVideo = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !selectedAttraction) return;

        setUploadingVideo(true);
        try {
            // Simular upload
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const newVideoUrl = URL.createObjectURL(file);
            const updatedAttraction = {
                ...selectedAttraction,
                videos: [...selectedAttraction.videos, newVideoUrl]
            };
            
            setAttractions(attractions.map(attraction => 
                attraction.id === selectedAttraction.id ? updatedAttraction : attraction
            ));
            setSelectedAttraction(updatedAttraction);
            
            alert('Vídeo enviado com sucesso!');
        } catch (error) {
            console.error('Erro ao enviar vídeo:', error);
            alert('Erro ao enviar vídeo. Tente novamente.');
        } finally {
            setUploadingVideo(false);
        }
    };

    const handleDeleteVideo = (videoUrl: string) => {
        if (!selectedAttraction) return;
        
        if (confirm('Tem certeza que deseja excluir este vídeo?')) {
            const updatedAttraction = {
                ...selectedAttraction,
                videos: selectedAttraction.videos.filter(url => url !== videoUrl)
            };
            
            setAttractions(attractions.map(attraction => 
                attraction.id === selectedAttraction.id ? updatedAttraction : attraction
            ));
            setSelectedAttraction(updatedAttraction);
        }
    };

    const handleSaveAttraction = (attractionData: Partial<Attraction>) => {
        if (editingAttraction) {
            // Editar atração existente
            setAttractions(prev => prev.map(attraction => 
                attraction.id === editingAttraction.id 
                    ? { ...attraction, ...attractionData }
                    : attraction
            ));
            alert('Atração editada com sucesso!');
            setShowEditAttractionModal(false);
            setEditingAttraction(null);
        } else {
            // Criar nova atração
            const newAttraction: Attraction = {
                id: Math.max(...attractions.map(a => a.id)) + 1,
                name: attractionData.name || '',
                location: attractionData.location || '',
                description: attractionData.description || '',
                rating: attractionData.rating || 0,
                price: attractionData.price || 0,
                duration: attractionData.duration || '',
                visitors: attractionData.visitors || 0,
                category: attractionData.category || '',
                contact: attractionData.contact || { phone: '', email: '', website: '' },
                website: attractionData.website || '',
                openingHours: attractionData.openingHours || '',
                bestTime: attractionData.bestTime || '',
                facilities: attractionData.facilities || [],
                restrictions: attractionData.restrictions || [],
                images: [],
                videos: []
            };
            
            setAttractions(prev => [...prev, newAttraction]);
            alert('Atração criada com sucesso!');
            setShowNewAttractionModal(false);
        }
    };

    const handleStatsClick = (statsType: string) => {
        setSelectedStatsType(statsType);
        setShowStatsDetails(true);
    };

    const handleExportReport = () => {
        setShowExportModal(true);
    };

    const handleExportSubmit = async () => {
        setExportGenerating(true);
        
        // Simular geração de relatório
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const periodText = {
            daily: 'Diário',
            weekly: 'Semanal',
            monthly: 'Mensal',
            annual: 'Anual'
        }[statsPeriod];
        
        const fileName = `relatorio_atracoes_${selectedStatsType}_${periodText.toLowerCase()}_${new Date().toISOString().split('T')[0]}.${exportFormat}`;
        
        // Simular download do arquivo
        const link = document.createElement('a');
        link.href = `data:text/${exportFormat};charset=utf-8,${encodeURIComponent('Dados das atrações')}`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('Relatório exportado:', fileName);
        alert(`Relatório exportado com sucesso: ${fileName}`);
        
        setExportGenerating(false);
        setShowExportModal(false);
    };

    const getStatsTitle = (statsType: string) => {
        switch (statsType) {
            case 'total': return 'Total de Atrações';
            case 'visitors': return 'Visitantes/Ano';
            case 'rating': return 'Avaliação Média';
            case 'revenue': return 'Receita Média';
            default: return 'Estatísticas';
        }
    };

    const getStatsIcon = (statsType: string) => {
        switch (statsType) {
            case 'total': return <Mountain className="h-6 w-6 text-blue-600" />;
            case 'visitors': return <Users className="h-6 w-6 text-green-600" />;
            case 'rating': return <Star className="h-6 w-6 text-purple-600" />;
            case 'revenue': return <DollarSign className="h-6 w-6 text-orange-600" />;
            default: return <Mountain className="h-6 w-6 text-gray-600" />;
        }
    };

    const getFilteredStatsData = () => {
        let filteredAttractions = attractions;

        if (statsSearchTerm) {
            filteredAttractions = filteredAttractions.filter(attraction =>
                attraction.name.toLowerCase().includes(statsSearchTerm.toLowerCase()) ||
                attraction.location.toLowerCase().includes(statsSearchTerm.toLowerCase()) ||
                attraction.category.toLowerCase().includes(statsSearchTerm.toLowerCase())
            );
        }

        if (statsFilter !== 'all') {
            filteredAttractions = filteredAttractions.filter(attraction => attraction.category === statsFilter);
        }

        return filteredAttractions;
    };

    const getStatsDataByPeriod = () => {
        const filteredData = getFilteredStatsData();
        
        switch (statsPeriod) {
            case 'daily':
                return filteredData.map(attraction => ({
                    ...attraction,
                    dailyVisitors: Math.floor(attraction.visitors / 365),
                    dailyRevenue: (attraction.price * Math.floor(attraction.visitors / 365)).toFixed(2)
                }));
            case 'weekly':
                return filteredData.map(attraction => ({
                    ...attraction,
                    weeklyVisitors: Math.floor(attraction.visitors / 52),
                    weeklyRevenue: (attraction.price * Math.floor(attraction.visitors / 52)).toFixed(2)
                }));
            case 'monthly':
                return filteredData.map(attraction => ({
                    ...attraction,
                    monthlyVisitors: Math.floor(attraction.visitors / 12),
                    monthlyRevenue: (attraction.price * Math.floor(attraction.visitors / 12)).toFixed(2)
                }));
            case 'annual':
                return filteredData.map(attraction => ({
                    ...attraction,
                    annualVisitors: attraction.visitors,
                    annualRevenue: (attraction.price * attraction.visitors).toFixed(2)
                }));
            default:
                return filteredData;
        }
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <Mountain className="h-12 w-12 text-blue-600 animate-pulse mx-auto mb-4" />
                        <p className="text-lg font-medium text-gray-900">Carregando atrações...</p>
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
                                <h1 className="text-3xl font-bold text-gray-900">Atrações Turísticas</h1>
                                <p className="mt-2 text-sm text-gray-600">
                                    Descubra os melhores pontos turísticos do Brasil
                                </p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <button 
                                    onClick={handleNewAttraction}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Plus className="h-5 w-5 inline mr-2" />
                                    Nova Atração
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div 
                            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => handleStatsClick('total')}
                        >
                            <div className="flex items-center">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Mountain className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total de Atrações</p>
                                    <p className="text-2xl font-bold text-gray-900">{attractions.length}</p>
                                </div>
                            </div>
                        </div>

                        <div 
                            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => handleStatsClick('visitors')}
                        >
                            <div className="flex items-center">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Users className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Visitantes/Ano</p>
                                    <p className="text-2xl font-bold text-gray-900">7.5M</p>
                                </div>
                            </div>
                        </div>

                        <div 
                            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => handleStatsClick('rating')}
                        >
                            <div className="flex items-center">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Star className="h-6 w-6 text-purple-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Avaliação Média</p>
                                    <p className="text-2xl font-bold text-gray-900">4.8</p>
                                </div>
                            </div>
                        </div>

                        <div 
                            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => handleStatsClick('revenue')}
                        >
                            <div className="flex items-center">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <DollarSign className="h-6 w-6 text-orange-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Receita Média</p>
                                    <p className="text-2xl font-bold text-gray-900">R$ 115</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Attractions Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {attractions.map(attraction => (
                            <div key={attraction.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                                    <Mountain className="h-16 w-16 text-white" />
                                </div>
                                
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xl font-semibold text-gray-900">{attraction.name}</h3>
                                        <div className="flex items-center">
                                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                            <span className="ml-1 text-sm font-medium text-gray-600">{attraction.rating}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center text-gray-600 mb-3">
                                        <MapPin className="h-4 w-4 mr-1" />
                                        <span className="text-sm">{attraction.location}</span>
                                    </div>
                                    
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{attraction.description}</p>
                                    
                                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                        <div className="flex items-center">
                                            <Clock className="h-4 w-4 mr-1" />
                                            <span>{attraction.duration}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Users className="h-4 w-4 mr-1" />
                                            <span>{attraction.visitors.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-bold text-green-600">
                                            R$ {attraction.price.toFixed(2)}
                                        </span>
                                        <div className="flex space-x-2">
                                            <button 
                                                onClick={() => handleViewImages(attraction)}
                                                className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                                            >
                                                <ImageIcon className="h-4 w-4 inline mr-1" />
                                                Imagens
                                            </button>
                                            <button 
                                                onClick={() => handleViewVideos(attraction)}
                                                className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                                            >
                                                <Play className="h-4 w-4 inline mr-1" />
                                                Vídeos
                                            </button>
                                            <button 
                                                onClick={() => handleEditAttraction(attraction)}
                                                className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                                            >
                                                <Edit className="h-4 w-4 inline mr-1" />
                                                Editar
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteAttraction(attraction.id)}
                                                className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                                            >
                                                <Trash className="h-4 w-4 inline mr-1" />
                                                Excluir
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* New Attraction Modal */}
            {showNewAttractionModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <Plus className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold">Nova Atração</h3>
                                        <p className="text-sm text-gray-600">Criar nova atração turística</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowNewAttractionModal(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <AttractionForm 
                                onSubmit={handleSaveAttraction}
                                onCancel={() => setShowNewAttractionModal(false)}
                                isEditing={false}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Attraction Modal */}
            {showEditAttractionModal && editingAttraction && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Edit className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold">Editar Atração</h3>
                                        <p className="text-sm text-gray-600">{editingAttraction.name}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowEditAttractionModal(false);
                                        setEditingAttraction(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <AttractionForm 
                                onSubmit={handleSaveAttraction}
                                onCancel={() => {
                                    setShowEditAttractionModal(false);
                                    setEditingAttraction(null);
                                }}
                                isEditing={true}
                                initialData={editingAttraction}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Image Management Modal */}
            {showImageModal && selectedAttraction && (
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
                                        <p className="text-sm text-gray-600">{selectedAttraction.name}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowImageModal(false);
                                        setSelectedAttraction(null);
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
                                {selectedAttraction.images.map((image, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={image}
                                            alt={`${selectedAttraction.name} - Imagem ${index + 1}`}
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

                            {selectedAttraction.images.length === 0 && (
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
                                        setSelectedAttraction(null);
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
            {showVideoModal && selectedAttraction && (
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
                                        <p className="text-sm text-gray-600">{selectedAttraction.name}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowVideoModal(false);
                                        setSelectedAttraction(null);
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
                                {selectedAttraction.videos.map((video, index) => (
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

                            {selectedAttraction.videos.length === 0 && (
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
                                        setSelectedAttraction(null);
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
                    <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        {getStatsIcon(selectedStatsType)}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold">{getStatsTitle(selectedStatsType)}</h3>
                                        <p className="text-sm text-gray-600">Relatório detalhado por período</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowStatsDetails(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Search and Filter */}
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Buscar por nome, localização ou categoria..."
                                            value={statsSearchTerm}
                                            onChange={(e) => setStatsSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                                <select
                                    value={statsFilter}
                                    onChange={(e) => setStatsFilter(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">Todas as Categorias</option>
                                    <option value="Cultura">Cultura</option>
                                    <option value="Natureza">Natureza</option>
                                    <option value="Aventura">Aventura</option>
                                    <option value="Praia">Praia</option>
                                    <option value="Histórico">Histórico</option>
                                    <option value="Religioso">Religioso</option>
                                </select>
                                <select
                                    value={statsPeriod}
                                    onChange={(e) => setStatsPeriod(e.target.value as 'daily' | 'weekly' | 'monthly' | 'annual')}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="daily">Diário</option>
                                    <option value="weekly">Semanal</option>
                                    <option value="monthly">Mensal</option>
                                    <option value="annual">Anual</option>
                                </select>
                                <button
                                    onClick={handleExportReport}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Exportar
                                </button>
                            </div>

                            {/* Stats Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Total de Atrações</p>
                                    <p className="text-lg font-semibold">{getFilteredStatsData().length}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Visitantes Totais</p>
                                    <p className="text-lg font-semibold">
                                        {getFilteredStatsData().reduce((sum, attraction) => sum + attraction.visitors, 0).toLocaleString()}
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Avaliação Média</p>
                                    <p className="text-lg font-semibold">
                                        {(getFilteredStatsData().reduce((sum, attraction) => sum + attraction.rating, 0) / getFilteredStatsData().length || 0).toFixed(1)}
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Receita Total</p>
                                    <p className="text-lg font-semibold">
                                        R$ {getFilteredStatsData().reduce((sum, attraction) => sum + (attraction.price * attraction.visitors), 0).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Attractions List */}
                            <div className="space-y-4">
                                <h4 className="font-semibold text-gray-900">Atrações</h4>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Atração</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Localização</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avaliação</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visitantes</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receita</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {getStatsDataByPeriod().map(attraction => (
                                                <tr key={attraction.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">{attraction.name}</div>
                                                            <div className="text-sm text-gray-500">{attraction.duration}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{attraction.location}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                                            {attraction.category}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                                            <span className="ml-1 text-sm text-gray-900">{attraction.rating}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">R$ {attraction.price.toFixed(2)}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                        {statsPeriod === 'daily' && attraction.dailyVisitors?.toLocaleString()}
                                                        {statsPeriod === 'weekly' && attraction.weeklyVisitors?.toLocaleString()}
                                                        {statsPeriod === 'monthly' && attraction.monthlyVisitors?.toLocaleString()}
                                                        {statsPeriod === 'annual' && attraction.annualVisitors?.toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                        R$ {statsPeriod === 'daily' && attraction.dailyRevenue}
                                                        {statsPeriod === 'weekly' && attraction.weeklyRevenue}
                                                        {statsPeriod === 'monthly' && attraction.monthlyRevenue}
                                                        {statsPeriod === 'annual' && attraction.annualRevenue}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
                                <button
                                    onClick={() => setShowStatsDetails(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                    Fechar
                                </button>
                                <button
                                    onClick={handleExportReport}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Exportar Relatório
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Export Modal */}
            {showExportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h3 className="text-2xl font-semibold mb-4">Exportar Relatório</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Escolha o formato para exportar o relatório de {getStatsTitle(selectedStatsType)}.
                            </p>
                            <div className="mb-4">
                                <label htmlFor="exportFormat" className="block text-sm font-medium text-gray-700">Formato</label>
                                <select
                                    id="exportFormat"
                                    value={exportFormat}
                                    onChange={(e) => setExportFormat(e.target.value as 'csv' | 'pdf')}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                >
                                    <option value="csv">CSV</option>
                                    <option value="pdf">PDF</option>
                                </select>
                            </div>
                            {exportGenerating && (
                                <p className="mt-2 text-sm text-gray-600">Gerando relatório...</p>
                            )}
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowExportModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleExportSubmit}
                                    disabled={exportGenerating}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    {exportGenerating ? 'Exportando...' : 'Exportar Relatório'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Preview Modal */}
            {selectedImage && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="relative max-w-4xl max-h-[90vh] mx-4">
                        <img
                            src={selectedImage}
                            alt="Preview"
                            className="max-w-full max-h-full object-contain rounded-lg"
                        />
                        <button
                            onClick={() => setSelectedImage('')}
                            className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            )}
        </ProtectedRoute>
    );
}

interface AttractionFormProps {
    onSubmit: (data: Partial<Attraction>) => void;
    onCancel: () => void;
    isEditing: boolean;
    initialData?: Attraction;
}

const AttractionForm: React.FC<AttractionFormProps> = ({ onSubmit, onCancel, isEditing, initialData }) => {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        location: initialData?.location || '',
        description: initialData?.description || '',
        rating: initialData?.rating || 0,
        price: initialData?.price || 0,
        duration: initialData?.duration || '',
        visitors: initialData?.visitors || 0,
        category: initialData?.category || '',
        contact: initialData?.contact || { phone: '', email: '', website: '' },
        website: initialData?.website || '',
        openingHours: initialData?.openingHours || '',
        bestTime: initialData?.bestTime || '',
        facilities: initialData?.facilities.join(', ') || '',
        restrictions: initialData?.restrictions.join(', ') || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            facilities: formData.facilities.split(',').map(s => s.trim()).filter(s => s),
            restrictions: formData.restrictions.split(',').map(s => s.trim()).filter(s => s)
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome *</label>
                    <input 
                        type="text" 
                        id="name" 
                        name="name" 
                        value={formData.name}
                        onChange={handleChange}
                        required 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" 
                    />
                </div>
                <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">Localização *</label>
                    <input 
                        type="text" 
                        id="location" 
                        name="location" 
                        value={formData.location}
                        onChange={handleChange}
                        required 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" 
                    />
                </div>
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoria *</label>
                    <select 
                        id="category" 
                        name="category" 
                        value={formData.category}
                        onChange={handleChange}
                        required 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    >
                        <option value="">Selecione uma categoria</option>
                        <option value="Cultura">Cultura</option>
                        <option value="Natureza">Natureza</option>
                        <option value="Aventura">Aventura</option>
                        <option value="Praia">Praia</option>
                        <option value="Histórico">Histórico</option>
                        <option value="Religioso">Religioso</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">Preço *</label>
                    <input 
                        type="number" 
                        id="price" 
                        name="price" 
                        value={formData.price}
                        onChange={handleChange}
                        step="0.01"
                        required 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" 
                    />
                </div>
                <div>
                    <label htmlFor="rating" className="block text-sm font-medium text-gray-700">Avaliação *</label>
                    <input 
                        type="number" 
                        id="rating" 
                        name="rating" 
                        value={formData.rating}
                        onChange={handleChange}
                        step="0.1"
                        min="0"
                        max="5"
                        required 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" 
                    />
                </div>
                <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Duração *</label>
                    <input 
                        type="text" 
                        id="duration" 
                        name="duration" 
                        value={formData.duration}
                        onChange={handleChange}
                        required 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" 
                    />
                </div>
                <div>
                    <label htmlFor="visitors" className="block text-sm font-medium text-gray-700">Visitantes/Ano *</label>
                    <input 
                        type="number" 
                        id="visitors" 
                        name="visitors" 
                        value={formData.visitors}
                        onChange={handleChange}
                        required 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" 
                    />
                </div>
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefone</label>
                    <input 
                        type="tel" 
                        id="phone" 
                        name="phone" 
                        value={formData.contact.phone}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            contact: { ...prev.contact, phone: e.target.value }
                        }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" 
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        value={formData.contact.email}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            contact: { ...prev.contact, email: e.target.value }
                        }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" 
                    />
                </div>
                <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700">Website</label>
                    <input 
                        type="url" 
                        id="website" 
                        name="website" 
                        value={formData.website}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" 
                    />
                </div>
                <div>
                    <label htmlFor="openingHours" className="block text-sm font-medium text-gray-700">Horário de Funcionamento</label>
                    <input 
                        type="text" 
                        id="openingHours" 
                        name="openingHours" 
                        value={formData.openingHours}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" 
                    />
                </div>
                <div>
                    <label htmlFor="bestTime" className="block text-sm font-medium text-gray-700">Melhor Horário</label>
                    <input 
                        type="text" 
                        id="bestTime" 
                        name="bestTime" 
                        value={formData.bestTime}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" 
                    />
                </div>
            </div>

            <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição *</label>
                <textarea 
                    id="description" 
                    name="description" 
                    rows={3} 
                    value={formData.description}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <label htmlFor="facilities" className="block text-sm font-medium text-gray-700">Facilidades (separadas por vírgula)</label>
                    <input 
                        type="text" 
                        id="facilities" 
                        name="facilities" 
                        value={formData.facilities}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" 
                    />
                </div>
                <div>
                    <label htmlFor="restrictions" className="block text-sm font-medium text-gray-700">Restrições (separadas por vírgula)</label>
                    <input 
                        type="text" 
                        id="restrictions" 
                        name="restrictions" 
                        value={formData.restrictions}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" 
                    />
                </div>
            </div>

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
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                >
                    <Save className="h-4 w-4 mr-2" />
                    {isEditing ? 'Salvar Alterações' : 'Criar Atração'}
                </button>
            </div>
        </form>
    );
}; 
