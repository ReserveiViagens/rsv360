import React, { useState, useEffect } from 'react';
import { 
    MapPin, 
    TreePine, 
    Star, 
    Clock, 
    DollarSign, 
    Users, 
    Mountain, 
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
    Map,
    BarChart3,
    Play
} from 'lucide-react';
import NavigationButtons from '../components/NavigationButtons';
import ProtectedRoute from '../components/ProtectedRoute';

interface Park {
    id: number;
    name: string;
    location: string;
    description: string;
    type: 'nacional' | 'estadual' | 'municipal' | 'privado';
    rating: number;
    price: number;
    duration: string;
    visitors: number;
    area: string;
    category: string;
    contact: string;
    website: string;
    openingHours: string;
    bestTime: string;
    facilities: string[];
    restrictions: string[];
    images: string[];
    videos: string[];
}

export default function ParksPage() {
    const [parks, setParks] = useState<Park[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewParkModal, setShowNewParkModal] = useState(false);
    const [showEditParkModal, setShowEditParkModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [editingPark, setEditingPark] = useState<Park | null>(null);
    const [selectedPark, setSelectedPark] = useState<Park | null>(null);
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

    // Dados mockados para parques
    const mockParks: Park[] = [
        {
            id: 1,
            name: "Parque Nacional da Tijuca",
            location: "Rio de Janeiro, RJ",
            description: "Maior floresta urbana do mundo, abrigando o Cristo Redentor e trilhas espetaculares.",
            type: "nacional",
            rating: 4.8,
            price: 0,
            duration: "4-6 horas",
            visitors: 2000000,
            area: "3.953 kmÂ²",
            category: "Floresta Urbana",
            contact: "0800 123 4567",
            website: "https://www.parquedatijuca.com.br",
            openingHours: "06:00 - 18:00",
            bestTime: "ManhÃ£",
            facilities: ["Trilhas", "Banheiros", "Restaurante", "Estacionamento"],
            restrictions: ["NÃ£o Ã© permitido fumar"],
            images: ["https://via.placeholder.com/150", "https://via.placeholder.com/150"],
            videos: []
        },
        {
            id: 2,
            name: "Parque Nacional do Iguaçu",
            location: "Foz do Iguaçu, PR",
            description: "Patrimônio Natural da Humanidade, abriga as Cataratas do Iguaçu e rica biodiversidade.",
            type: "nacional",
            rating: 4.9,
            price: 95.00,
            duration: "4-5 horas",
            visitors: 1500000,
            area: "1.852 kmÂ²",
            category: "natureza",
            contact: "0800 765 4321",
            website: "https://www.cataratasdoiguacu.com.br",
            openingHours: "08:00 - 17:00",
            bestTime: "Tarde",
            facilities: ["Trilhas", "Passeio de barco", "Restaurante"],
            restrictions: ["NÃ£o aceita pets"],
            images: ["/images/parks/iguacu-1.jpg", "/images/parks/iguacu-2.jpg"],
            videos: ["/videos/parks/iguacu.mp4"]
        },
        {
            id: 3,
            name: "Parque Nacional dos LenÃ§Ã³is Maranhenses",
            location: "Barreirinhas, MA",
            description: "Paisagem Ãºnica com dunas de areia branca e lagoas cristalinas intercaladas.",
            type: "nacional",
            rating: 4.8,
            price: 150.00,
            duration: "1-2 dias",
            visitors: 300000,
            area: "1.550 kmÂ²",
            category: "Dunas",
            contact: "0800 987 6543",
            website: "https://www.lencoismaranhenses.com.br",
            openingHours: "06:00 - 18:00",
            bestTime: "ManhÃ£",
            facilities: ["Passeios", "Banheiros", "Restaurante", "Guia"],
            restrictions: ["NÃ£o Ã© permitido acampar"],
            images: ["https://via.placeholder.com/150", "https://via.placeholder.com/150"],
            videos: []
        },
        {
            id: 4,
            name: "Parque Nacional da Chapada Diamantina",
            location: "LenÃ§Ã³is, BA",
            description: "Serras, cachoeiras, grutas e vales esculpidos em quartzito, ideal para ecoturismo.",
            type: "nacional",
            rating: 4.7,
            price: 80.00,
            duration: "3-5 dias",
            visitors: 250000,
            area: "1.520 kmÂ²",
            category: "Serra",
            contact: "0800 456 7890",
            website: "https://www.chapadadiamantina.com.br",
            openingHours: "07:00 - 17:00",
            bestTime: "Tarde",
            facilities: ["Trilhas", "Banheiros", "Restaurante", "Camping"],
            restrictions: ["NÃ£o Ã© permitido fumar"],
            images: ["https://via.placeholder.com/150", "https://via.placeholder.com/150"],
            videos: []
        },
        {
            id: 5,
            name: "Parque Nacional de Fernando de Noronha",
            location: "Fernando de Noronha, PE",
            description: "ArquipÃ©lago vulcÃ¢nico com praias paradisÃ­acas e vida marinha abundante.",
            type: "nacional",
            rating: 4.9,
            price: 200.00,
            duration: "3-7 dias",
            visitors: 60000,
            area: "26 kmÂ²",
            category: "Ilha",
            contact: "0800 321 6547",
            website: "https://www.fernandodenoronha.com.br",
            openingHours: "06:00 - 18:00",
            bestTime: "ManhÃ£",
            facilities: ["Praias", "Banheiros", "Restaurante", "Mergulho"],
            restrictions: ["NÃ£o Ã© permitido pescar"],
            images: ["https://via.placeholder.com/150", "https://via.placeholder.com/150"],
            videos: []
        },
        {
            id: 6,
            name: "Parque Nacional da Serra dos Ã“rgÃ£os",
            location: "TeresÃ³polis, RJ",
            description: "Montanhas imponentes com trilhas desafiadoras e vistas panorÃ¢micas espetaculares.",
            type: "nacional",
            rating: 4.6,
            price: 45.00,
            duration: "4-8 horas",
            visitors: 180000,
            area: "204 kmÂ²",
            category: "Serra",
            contact: "0800 147 2583",
            website: "https://www.serradosorgaos.com.br",
            openingHours: "08:00 - 17:00",
            bestTime: "ManhÃ£",
            facilities: ["Trilhas", "Banheiros", "Restaurante", "Mirante"],
            restrictions: ["NÃ£o Ã© permitido acampar"],
            images: ["https://via.placeholder.com/150", "https://via.placeholder.com/150"],
            videos: []
        }
    ];

    useEffect(() => {
        // Simular carregamento de dados
        const loadParks = async () => {
            try {
                // Simular delay de carregamento
                await new Promise(resolve => setTimeout(resolve, 1000));
                setParks(mockParks);
            } catch (error) {
                console.error('Erro ao carregar parques:', error);
            } finally {
                setLoading(false);
            }
        };

        loadParks();
    }, []);

    // FunÃ§Ãµes CRUD
    const handleNewPark = () => {
        setShowNewParkModal(true);
    };

    const handleEditPark = (park: Park) => {
        setEditingPark(park);
        setShowEditParkModal(true);
    };

    const handleDeletePark = (parkId: number) => {
        if (confirm('Tem certeza que deseja excluir este parque?')) {
            setParks(parks.filter(park => park.id !== parkId));
        }
    };

    const handleViewImages = (park: Park) => {
        setSelectedPark(park);
        setShowImageModal(true);
    };

    const handleUploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !selectedPark) return;

        setUploadingImage(true);
        try {
            // Simular upload
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const newImageUrl = URL.createObjectURL(file);
            const updatedPark = {
                ...selectedPark,
                images: [...selectedPark.images, newImageUrl]
            };
            
            setParks(parks.map(park => 
                park.id === selectedPark.id ? updatedPark : park
            ));
            setSelectedPark(updatedPark);
            
            alert('Imagem enviada com sucesso!');
        } catch (error) {
            console.error('Erro ao enviar imagem:', error);
            alert('Erro ao enviar imagem. Tente novamente.');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleDeleteImage = (imageUrl: string) => {
        if (!selectedPark) return;
        
        if (confirm('Tem certeza que deseja excluir esta imagem?')) {
            const updatedPark = {
                ...selectedPark,
                images: selectedPark.images.filter(url => url !== imageUrl)
            };
            
            setParks(parks.map(park => 
                park.id === selectedPark.id ? updatedPark : park
            ));
            setSelectedPark(updatedPark);
        }
    };

    // FunÃ§Ãµes para gestÃ£o de vÃ­deos
    const handleViewVideos = (park: Park) => {
        setSelectedPark(park);
        setShowVideoModal(true);
    };

    const handleUploadVideo = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !selectedPark) return;

        setUploadingVideo(true);
        try {
            // Simular upload
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const newVideoUrl = URL.createObjectURL(file);
            const updatedPark = {
                ...selectedPark,
                videos: [...selectedPark.videos, newVideoUrl]
            };
            
            setParks(parks.map(park => 
                park.id === selectedPark.id ? updatedPark : park
            ));
            setSelectedPark(updatedPark);
            
            alert('VÃ­deo enviado com sucesso!');
        } catch (error) {
            console.error('Erro ao enviar vÃ­deo:', error);
            alert('Erro ao enviar vÃ­deo. Tente novamente.');
        } finally {
            setUploadingVideo(false);
        }
    };

    const handleDeleteVideo = (videoUrl: string) => {
        if (!selectedPark) return;
        
        if (confirm('Tem certeza que deseja excluir este vÃ­deo?')) {
            const updatedPark = {
                ...selectedPark,
                videos: selectedPark.videos.filter(url => url !== videoUrl)
            };
            
            setParks(parks.map(park => 
                park.id === selectedPark.id ? updatedPark : park
            ));
            setSelectedPark(updatedPark);
        }
    };

    const handleSavePark = (parkData: Partial<Park>) => {
        if (editingPark) {
            // Editar parque existente
            const updatedPark = { ...editingPark, ...parkData };
            setParks(parks.map(park => 
                park.id === editingPark.id ? updatedPark : park
            ));
            setShowEditParkModal(false);
            setEditingPark(null);
        } else {
            // Criar novo parque
            const newPark: Park = {
                id: Math.max(...parks.map(p => p.id)) + 1,
                name: parkData.name || '',
                location: parkData.location || '',
                description: parkData.description || '',
                type: parkData.type || 'nacional',
                rating: parkData.rating || 0,
                price: parkData.price || 0,
                duration: parkData.duration || '',
                visitors: parkData.visitors || 0,
                area: parkData.area || '',
                category: parkData.category || '',
                contact: parkData.contact || '',
                website: parkData.website || '',
                openingHours: parkData.openingHours || '',
                bestTime: parkData.bestTime || '',
                facilities: parkData.facilities || [],
                restrictions: parkData.restrictions || [],
                images: parkData.images || [],
                videos: parkData.videos || []
            };
            setParks([...parks, newPark]);
            setShowNewParkModal(false);
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
            
            const filename = `parks-report-${statsPeriod}-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
            const content = `RelatÃ³rio de Parques - ${statsPeriod}\n\n`;
            
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

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'nacional': return 'bg-green-100 text-green-800';
            case 'estadual': return 'bg-blue-100 text-blue-800';
            case 'municipal': return 'bg-yellow-100 text-yellow-800';
            case 'privado': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatsTitle = (statsType: string) => {
        switch (statsType) {
            case 'total': return 'Total de Parques';
            case 'visitors': return 'Visitantes/Ano';
            case 'rating': return 'AvaliaÃ§Ã£o MÃ©dia';
            case 'revenue': return 'Receita MÃ©dia';
            default: return 'EstatÃ­sticas';
        }
    };

    const getStatsIcon = (statsType: string) => {
        switch (statsType) {
            case 'total': return <TreePine className="w-6 h-6" />;
            case 'visitors': return <Users className="w-6 h-6" />;
            case 'rating': return <Star className="w-6 h-6" />;
            case 'revenue': return <DollarSign className="w-6 h-6" />;
            default: return <BarChart3 className="w-6 h-6" />;
        }
    };

    const getFilteredStatsData = () => {
        let filteredParks = parks;
        
        if (statsSearchTerm) {
            filteredParks = parks.filter(park => 
                park.name.toLowerCase().includes(statsSearchTerm.toLowerCase()) ||
                park.location.toLowerCase().includes(statsSearchTerm.toLowerCase()) ||
                park.category.toLowerCase().includes(statsSearchTerm.toLowerCase())
            );
        }
        
        if (statsFilter !== 'all') {
            filteredParks = filteredParks.filter(park => park.type === statsFilter);
        }
        
        return filteredParks;
    };

    const getStatsDataByPeriod = () => {
        const filteredParks = getFilteredStatsData();
        
        switch (statsPeriod) {
            case 'daily':
                return filteredParks.map(park => ({
                    name: park.name,
                    visitors: Math.floor(park.visitors / 365),
                    revenue: park.price * Math.floor(park.visitors / 365),
                    rating: park.rating
                }));
            case 'weekly':
                return filteredParks.map(park => ({
                    name: park.name,
                    visitors: Math.floor(park.visitors / 52),
                    revenue: park.price * Math.floor(park.visitors / 52),
                    rating: park.rating
                }));
            case 'monthly':
                return filteredParks.map(park => ({
                    name: park.name,
                    visitors: Math.floor(park.visitors / 12),
                    revenue: park.price * Math.floor(park.visitors / 12),
                    rating: park.rating
                }));
            case 'annual':
                return filteredParks.map(park => ({
                    name: park.name,
                    visitors: park.visitors,
                    revenue: park.price * park.visitors,
                    rating: park.rating
                }));
            default:
                return filteredParks.map(park => ({
                    name: park.name,
                    visitors: park.visitors,
                    revenue: park.price * park.visitors,
                    rating: park.rating
                }));
        }
    };

    // Componente ParkForm
    const ParkForm = ({ park, onSave, onCancel }: { 
        park?: Park | null; 
        onSave: (data: Partial<Park>) => void; 
        onCancel: () => void; 
    }) => {
        const [formData, setFormData] = useState({
            name: park?.name || '',
            location: park?.location || '',
            description: park?.description || '',
            type: park?.type || 'nacional' as const,
            rating: park?.rating || 0,
            price: park?.price || 0,
            duration: park?.duration || '',
            visitors: park?.visitors || 0,
            area: park?.area || '',
            category: park?.category || '',
            contact: park?.contact || '',
            website: park?.website || '',
            openingHours: park?.openingHours || '',
            bestTime: park?.bestTime || '',
            facilities: park?.facilities || [],
            restrictions: park?.restrictions || [],
            images: park?.images || [],
            videos: park?.videos || []
        });

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            onSave(formData);
        };

        return (
            <div className="bg-white rounded-lg p-6 max-w-2xl mx-auto">
                <h3 className="text-lg font-semibold mb-4">
                    {park ? 'Editar Parque' : 'Novo Parque'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nome do Parque
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                LocalizaÃ§Ã£o
                            </label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Categoria
                            </label>
                            <input
                                type="text"
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tipo
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="nacional">Nacional</option>
                                <option value="estadual">Estadual</option>
                                <option value="municipal">Municipal</option>
                                <option value="privado">Privado</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                PreÃ§o (R$)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                DuraÃ§Ã£o
                            </label>
                            <input
                                type="text"
                                value={formData.duration}
                                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Visitantes/Ano
                            </label>
                            <input
                                type="number"
                                value={formData.visitors}
                                onChange={(e) => setFormData({...formData, visitors: parseInt(e.target.value) || 0})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ãrea
                            </label>
                            <input
                                type="text"
                                value={formData.area}
                                onChange={(e) => setFormData({...formData, area: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Contato
                            </label>
                            <input
                                type="text"
                                value={formData.contact}
                                onChange={(e) => setFormData({...formData, contact: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Website
                            </label>
                            <input
                                type="url"
                                value={formData.website}
                                onChange={(e) => setFormData({...formData, website: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                HorÃ¡rio de Funcionamento
                            </label>
                            <input
                                type="text"
                                value={formData.openingHours}
                                onChange={(e) => setFormData({...formData, openingHours: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Melhor HorÃ¡rio
                            </label>
                            <input
                                type="text"
                                value={formData.bestTime}
                                onChange={(e) => setFormData({...formData, bestTime: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            DescriÃ§Ã£o
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {park ? 'Atualizar' : 'Criar'} Parque
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        );
    };

    // Componente ImageModal
    const ImageModal = ({ park, onClose }: { park: Park; onClose: () => void }) => {
        const [selectedImage, setSelectedImage] = useState<string>('');

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Imagens - {park.name}</h3>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Adicionar Nova Imagem
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleUploadImage}
                            disabled={uploadingImage}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {uploadingImage && (
                            <p className="text-sm text-blue-600 mt-1">Enviando imagem...</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {park.images.map((image, index) => (
                            <div key={index} className="relative group">
                                <img
                                    src={image}
                                    alt={`${park.name} - Imagem ${index + 1}`}
                                    className="w-full h-32 object-cover rounded-lg cursor-pointer"
                                    onClick={() => setSelectedImage(image)}
                                />
                                <button
                                    onClick={() => handleDeleteImage(image)}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>

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
            </div>
        );
    };

    // Componente StatsDetails
    const StatsDetails = ({ statsType, onClose }: { statsType: string; onClose: () => void }) => {
        const statsData = getStatsDataByPeriod();

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            {getStatsIcon(statsType)}
                            {getStatsTitle(statsType)} - {statsPeriod}
                        </h3>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="mb-4 flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Buscar
                            </label>
                            <input
                                type="text"
                                value={statsSearchTerm}
                                onChange={(e) => setStatsSearchTerm(e.target.value)}
                                placeholder="Buscar por nome, localizaÃ§Ã£o ou categoria..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Filtro
                            </label>
                            <select
                                value={statsFilter}
                                onChange={(e) => setStatsFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">Todos os Tipos</option>
                                <option value="nacional">Nacional</option>
                                <option value="estadual">Estadual</option>
                                <option value="municipal">Municipal</option>
                                <option value="privado">Privado</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                PerÃ­odo
                            </label>
                            <select
                                value={statsPeriod}
                                onChange={(e) => setStatsPeriod(e.target.value as any)}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="daily">DiÃ¡rio</option>
                                <option value="weekly">Semanal</option>
                                <option value="monthly">Mensal</option>
                                <option value="annual">Anual</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Parque
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Visitantes
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Receita
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        AvaliaÃ§Ã£o
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {statsData.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {item.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.visitors.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            R$ {item.revenue.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.rating.toFixed(1)} â­
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={handleExportReport}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            Exportar RelatÃ³rio
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Componente ExportModal
    const ExportModal = ({ onClose }: { onClose: () => void }) => {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md mx-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Exportar RelatÃ³rio</h3>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
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
                                onClick={onClose}
                                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <TreePine className="h-12 w-12 text-green-600 animate-pulse mx-auto mb-4" />
                        <p className="text-lg font-medium text-gray-900">Carregando parques...</p>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">GestÃ£o de Parques</h1>
                        <p className="text-gray-600">Gerencie parques nacionais, estaduais e municipais</p>
                    </div>

                    {/* EstatÃ­sticas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div 
                            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => handleStatsClick('total')}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total de Parques</p>
                                    <p className="text-2xl font-bold text-gray-900">{parks.length}</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-full">
                                    <TreePine className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div 
                            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => handleStatsClick('visitors')}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Visitantes/Ano</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {(parks.reduce((sum, park) => sum + park.visitors, 0) / 1000000).toFixed(1)}M
                                    </p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-full">
                                    <Users className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div 
                            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => handleStatsClick('rating')}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">AvaliaÃ§Ã£o MÃ©dia</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {(parks.reduce((sum, park) => sum + park.rating, 0) / parks.length).toFixed(1)}
                                    </p>
                                </div>
                                <div className="p-3 bg-yellow-100 rounded-full">
                                    <Star className="w-6 h-6 text-yellow-600" />
                                </div>
                            </div>
                        </div>

                        <div 
                            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => handleStatsClick('revenue')}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Receita MÃ©dia</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        R$ {(parks.reduce((sum, park) => sum + park.price, 0) / parks.length).toFixed(0)}
                                    </p>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-full">
                                    <DollarSign className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AÃ§Ãµes */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex gap-4">
                            <button
                                onClick={handleNewPark}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Novo Parque
                            </button>
                            <button
                                onClick={handleExportReport}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Exportar
                            </button>
                        </div>
                    </div>

                    {/* Grid de Parques */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {parks.map((park) => (
                            <div key={park.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{park.name}</h3>
                                            <p className="text-sm text-gray-600 flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                {park.location}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(park.type)}`}>
                                            {park.type}
                                        </span>
                                    </div>

                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{park.description}</p>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="flex items-center gap-2">
                                            <Star className="w-4 h-4 text-yellow-500" />
                                            <span className="text-sm text-gray-600">{park.rating}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm text-gray-600">{park.duration}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="w-4 h-4 text-green-500" />
                                            <span className="text-sm text-gray-600">
                                                {park.price === 0 ? 'Gratuito' : `R$ ${park.price}`}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-blue-500" />
                                            <span className="text-sm text-gray-600">
                                                {(park.visitors / 1000).toFixed(0)}k
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEditPark(park)}
                                            className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center gap-1"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleViewImages(park)}
                                            className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center gap-1"
                                        >
                                            <ImageIcon className="w-4 h-4" />
                                            Imagens
                                        </button>
                                        <button
                                            onClick={() => handleViewVideos(park)}
                                            className="flex-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center justify-center gap-1"
                                        >
                                            <Play className="w-4 h-4" />
                                            VÃ­deos
                                        </button>
                                        <button
                                            onClick={() => handleDeletePark(park.id)}
                                            className="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                                        >
                                            <Trash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Modais */}
                {showNewParkModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <ParkForm
                            onSave={handleSavePark}
                            onCancel={() => setShowNewParkModal(false)}
                        />
                    </div>
                )}

                {showEditParkModal && editingPark && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <ParkForm
                            park={editingPark}
                            onSave={handleSavePark}
                            onCancel={() => {
                                setShowEditParkModal(false);
                                setEditingPark(null);
                            }}
                        />
                    </div>
                )}

                {showImageModal && selectedPark && (
                    <ImageModal
                        park={selectedPark}
                        onClose={() => {
                            setShowImageModal(false);
                            setSelectedPark(null);
                        }}
                    />
                )}

                {showVideoModal && selectedPark && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg p-6 max-w-2xl mx-auto">
                            <h3 className="text-lg font-semibold mb-4">VÃ­deos - {selectedPark.name}</h3>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Adicionar Novo VÃ­deo
                                </label>
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={handleUploadVideo}
                                    disabled={uploadingVideo}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {uploadingVideo && (
                                    <p className="text-sm text-blue-600 mt-1">Enviando vÃ­deo...</p>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {selectedPark.videos.map((video, index) => (
                                    <div key={index} className="relative group">
                                        <video
                                            src={video}
                                            className="w-full h-32 object-cover rounded-lg cursor-pointer"
                                            onClick={() => setSelectedVideo(video)}
                                        />
                                        <button
                                            onClick={() => handleDeleteVideo(video)}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            {selectedVideo && (
                                <div className="mt-4 flex justify-center">
                                    <video
                                        src={selectedVideo}
                                        controls
                                        className="max-w-full max-h-full object-contain"
                                    />
                                    <button
                                        onClick={() => setSelectedVideo('')}
                                        className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full p-2"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {showStatsDetails && (
                    <StatsDetails
                        statsType={selectedStatsType}
                        onClose={() => setShowStatsDetails(false)}
                    />
                )}

                {showExportModal && (
                    <ExportModal
                        onClose={() => setShowExportModal(false)}
                    />
                )}
            </div>
        </ProtectedRoute>
    );
} 
