import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { useRouter } from 'next/router';
import { 
    MapPin, 
    DollarSign, 
    Calendar, 
    CheckCircle, 
    TrendingUp, 
    Ticket, 
    Star, 
    Clock, 
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
    Play,
    BarChart3
} from 'lucide-react';
import NavigationButtons from '../components/NavigationButtons';

interface TicketData {
    id: number;
    name: string;
    location: string;
    type: 'parque' | 'show' | 'transporte' | 'atração';
    status: 'ativo' | 'esgotado' | 'inativo';
    price: number;
    available: number;
    total: number;
    validUntil: string;
    description: string;
    provider: string;
    contact: string;
    terms: string;
    restrictions: string;
    includedServices: string[];
    notIncludedServices: string[];
    cancellationPolicy: string;
    refundPolicy: string;
    salesHistory: {
        date: string;
        quantity: number;
        revenue: number;
    }[];
    photos: string[];
    videos: string[];
}

interface TicketFormProps {
  onSubmit: (data: Partial<TicketData>) => void;
  onCancel: () => void;
  isEditing: boolean;
  initialData?: TicketData;
}

const TicketForm: React.FC<TicketFormProps> = ({ onSubmit, onCancel, isEditing, initialData }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    location: initialData?.location || '',
    description: initialData?.description || '',
    type: initialData?.type || 'parque' as const,
    status: initialData?.status || 'ativo' as const,
    price: initialData?.price || 0,
    available: initialData?.available || 0,
    total: initialData?.total || 0,
    validUntil: initialData?.validUntil || '',
    provider: initialData?.provider || '',
    contact: initialData?.contact || '',
    terms: initialData?.terms || '',
    restrictions: initialData?.restrictions || '',
    includedServices: initialData?.includedServices?.join(', ') || '',
    notIncludedServices: initialData?.notIncludedServices?.join(', ') || '',
    cancellationPolicy: initialData?.cancellationPolicy || '',
    refundPolicy: initialData?.refundPolicy || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      includedServices: formData.includedServices.split(',').map(s => s.trim()).filter(s => s),
      notIncludedServices: formData.notIncludedServices.split(',').map(s => s.trim()).filter(s => s)
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
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipo *</label>
          <select 
            id="type" 
            name="type" 
            value={formData.type}
            onChange={handleChange}
            required 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          >
            <option value="parque">Parque</option>
            <option value="show">Show</option>
            <option value="transporte">Transporte</option>
            <option value="atração">Atração</option>
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
          <label htmlFor="total" className="block text-sm font-medium text-gray-700">Quantidade Total *</label>
          <input 
            type="number" 
            id="total" 
            name="total" 
            value={formData.total}
            onChange={handleChange}
            required 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" 
          />
        </div>
        <div>
          <label htmlFor="available" className="block text-sm font-medium text-gray-700">Disponíveis *</label>
          <input 
            type="number" 
            id="available" 
            name="available" 
            value={formData.available}
            onChange={handleChange}
            required 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" 
          />
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status *</label>
          <select 
            id="status" 
            name="status" 
            value={formData.status}
            onChange={handleChange}
            required 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          >
            <option value="ativo">Ativo</option>
            <option value="esgotado">Esgotado</option>
            <option value="inativo">Inativo</option>
          </select>
        </div>
        <div>
          <label htmlFor="validUntil" className="block text-sm font-medium text-gray-700">Válido até *</label>
          <input 
            type="date" 
            id="validUntil" 
            name="validUntil" 
            value={formData.validUntil}
            onChange={handleChange}
            required 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" 
          />
        </div>
        <div>
          <label htmlFor="provider" className="block text-sm font-medium text-gray-700">Fornecedor *</label>
          <input 
            type="text" 
            id="provider" 
            name="provider" 
            value={formData.provider}
            onChange={handleChange}
            required 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" 
          />
        </div>
        <div>
          <label htmlFor="contact" className="block text-sm font-medium text-gray-700">Contato *</label>
          <input 
            type="text" 
            id="contact" 
            name="contact" 
            value={formData.contact}
            onChange={handleChange}
            required 
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
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="terms" className="block text-sm font-medium text-gray-700">Termos e Condições</label>
          <textarea 
            id="terms" 
            name="terms" 
            rows={3} 
            value={formData.terms}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label htmlFor="restrictions" className="block text-sm font-medium text-gray-700">Restrições</label>
          <textarea 
            id="restrictions" 
            name="restrictions" 
            rows={3} 
            value={formData.restrictions}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="includedServices" className="block text-sm font-medium text-gray-700">Serviços Incluídos (separados por vírgula)</label>
          <input 
            type="text" 
            id="includedServices" 
            name="includedServices" 
            value={formData.includedServices}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" 
          />
        </div>
        <div>
          <label htmlFor="notIncludedServices" className="block text-sm font-medium text-gray-700">Serviços Não Incluídos (separados por vírgula)</label>
          <input 
            type="text" 
            id="notIncludedServices" 
            name="notIncludedServices" 
            value={formData.notIncludedServices}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="cancellationPolicy" className="block text-sm font-medium text-gray-700">Política de Cancelamento</label>
          <textarea 
            id="cancellationPolicy" 
            name="cancellationPolicy" 
            rows={3} 
            value={formData.cancellationPolicy}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label htmlFor="refundPolicy" className="block text-sm font-medium text-gray-700">Política de Reembolso</label>
          <textarea 
            id="refundPolicy" 
            name="refundPolicy" 
            rows={3} 
            value={formData.refundPolicy}
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
          {isEditing ? 'Salvar Alterações' : 'Criar Ingresso'}
        </button>
      </div>
    </form>
  );
};

export default function TicketsPage() {
    const [tickets, setTickets] = useState<TicketData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showTicketDetails, setShowTicketDetails] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);
    const [showStatsDetails, setShowStatsDetails] = useState(false);
    const [selectedStatsType, setSelectedStatsType] = useState<string>('');
    const [statsSearchTerm, setStatsSearchTerm] = useState('');
    const [statsFilter, setStatsFilter] = useState('all');
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
    const [exportGenerating, setExportGenerating] = useState(false);
    const [showMediaModal, setShowMediaModal] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<string>('');
    const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');
    const [uploadingMedia, setUploadingMedia] = useState(false);

  // Dados mockados para ingressos
  const mockTickets: TicketData[] = [
        {
            id: 1,
            name: "Disney World - Magic Kingdom",
            location: "Orlando, EUA",
            type: "parque",
            status: "ativo",
            price: 450.00,
            available: 75,
            total: 100,
            validUntil: "30/12/2024",
            description: "Ingresso para o parque Magic Kingdom da Disney",
            provider: "Disney Parks",
            contact: "0800 123 4567",
            terms: "Válido por 1 dia, não reembolsável",
            restrictions: "Não é permitido entrar com alimentos",
            includedServices: ["Acesso a todas as atrações", "Shows", "Parada"],
            notIncludedServices: ["FastPass", "Alimentação", "Souvenirs"],
            cancellationPolicy: "Não reembolsável",
            refundPolicy: "Não aplicável",
            salesHistory: [
                { date: "2024-01-15", quantity: 25, revenue: 11250 },
                { date: "2024-01-16", quantity: 30, revenue: 13500 },
                { date: "2024-01-17", quantity: 20, revenue: 9000 }
            ],
            photos: [
                "https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Disney+Magic+Kingdom",
                "https://via.placeholder.com/300x200/10B981/FFFFFF?text=Castelo+Cinderela",
                "https://via.placeholder.com/300x200/F59E0B/FFFFFF?text=Parade+Magic"
            ],
            videos: [
                "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4"
            ]
        },
        {
            id: 2,
            name: "Torre Eiffel - Acesso Premium",
            location: "Paris, França",
            type: "atração",
            status: "esgotado",
            price: 89.00,
            available: 0,
            total: 50,
            validUntil: "14/09/2024",
            description: "Acesso prioritário à Torre Eiffel com guia",
            provider: "Paris Tourism",
            contact: "0800 765 4321",
            terms: "Válido por 1 dia, com guia incluído",
            restrictions: "Não é permitido subir com mochilas grandes",
            includedServices: ["Acesso prioritário", "Guia turístico", "Áudio guide"],
            notIncludedServices: ["Transporte", "Alimentação", "Fotos profissionais"],
            cancellationPolicy: "Reembolso até 24h antes",
            refundPolicy: "Reembolso integral",
            salesHistory: [
                { date: "2024-01-15", quantity: 50, revenue: 4450 },
                { date: "2024-01-16", quantity: 50, revenue: 4450 },
                { date: "2024-01-17", quantity: 50, revenue: 4450 }
            ],
            photos: [],
            videos: []
        },
        {
            id: 3,
            name: "Show de Cirque du Soleil",
            location: "Las Vegas, EUA",
            type: "show",
            status: "ativo",
            price: 180.00,
            available: 45,
            total: 200,
            validUntil: "29/11/2024",
            description: "Ingresso para espetáculo do Cirque du Soleil",
            provider: "Cirque du Soleil",
            contact: "0800 987 6543",
            terms: "Válido para data específica, assento reservado",
            restrictions: "Não é permitido gravar ou fotografar",
            includedServices: ["Assento reservado", "Programa do espetáculo"],
            notIncludedServices: ["Transporte", "Alimentação", "Meet & Greet"],
            cancellationPolicy: "Reembolso até 48h antes",
            refundPolicy: "Reembolso com taxa de 10%",
            salesHistory: [
                { date: "2024-01-15", quantity: 30, revenue: 5400 },
                { date: "2024-01-16", quantity: 45, revenue: 8100 },
                { date: "2024-01-17", quantity: 25, revenue: 4500 }
            ],
            photos: [],
            videos: []
        },
        {
            id: 4,
            name: "Metrô de Nova York - 7 Dias",
            location: "Nova York, EUA",
            type: "transporte",
            status: "ativo",
            price: 33.00,
            available: 320,
            total: 500,
            validUntil: "30/12/2024",
            description: "Passe de 7 dias para metrô de Nova York",
            provider: "MTA New York",
            contact: "0800 456 7890",
            terms: "Válido por 7 dias consecutivos",
            restrictions: "Não é transferível",
            includedServices: ["Metrô ilimitado", "Ônibus local"],
            notIncludedServices: ["AirTrain", "Ônibus expresso", "Ferry"],
            cancellationPolicy: "Não reembolsável",
            refundPolicy: "Não aplicável",
            salesHistory: [
                { date: "2024-01-15", quantity: 100, revenue: 3300 },
                { date: "2024-01-16", quantity: 120, revenue: 3960 },
                { date: "2024-01-17", quantity: 80, revenue: 2640 }
            ],
            photos: [],
            videos: []
        },
        {
            id: 5,
            name: "Universal Studios - Express Pass",
            location: "Orlando, EUA",
            type: "parque",
            status: "ativo",
            price: 180.00,
            available: 12,
            total: 80,
            validUntil: "30/12/2024",
            description: "Ingresso com acesso expresso às atrações",
            provider: "Universal Studios",
            contact: "0800 321 6547",
            terms: "Válido por 1 dia, com acesso expresso",
            restrictions: "Não é válido em todas as atrações",
            includedServices: ["Acesso expresso", "Parque temático"],
            notIncludedServices: ["Alimentação", "Souvenirs", "FastPass adicional"],
            cancellationPolicy: "Reembolso até 24h antes",
            refundPolicy: "Reembolso integral",
            salesHistory: [
                { date: "2024-01-15", quantity: 20, revenue: 3600 },
                { date: "2024-01-16", quantity: 25, revenue: 4500 },
                { date: "2024-01-17", quantity: 15, revenue: 2700 }
            ],
            photos: [],
            videos: []
        },
        {
            id: 6,
            name: "Museu do Louvre - Entrada Prioritária",
            location: "Paris, França",
            type: "atração",
            status: "ativo",
            price: 120.00,
            available: 85,
            total: 150,
            validUntil: "15/10/2024",
            description: "Entrada prioritária ao Museu do Louvre",
            provider: "Louvre Museum",
            contact: "0800 147 2583",
            terms: "Válido por 1 dia, entrada prioritária",
            restrictions: "Não é permitido fotografar com flash",
            includedServices: ["Entrada prioritária", "Áudio guide", "Mapa"],
            notIncludedServices: ["Guia turístico", "Alimentação", "Souvenirs"],
            cancellationPolicy: "Reembolso até 48h antes",
            refundPolicy: "Reembolso com taxa de 5%",
            salesHistory: [
                { date: "2024-01-15", quantity: 40, revenue: 4800 },
                { date: "2024-01-16", quantity: 35, revenue: 4200 },
                { date: "2024-01-17", quantity: 45, revenue: 5400 }
            ],
            photos: [],
            videos: []
        }
    ];

    useEffect(() => {
        // Simular carregamento de dados
        const loadTickets = async () => {
            try {
                // Simular delay de carregamento
                await new Promise(resolve => setTimeout(resolve, 1000));
                setTickets(mockTickets);
            } catch (error) {
                console.error('Erro ao carregar ingressos:', error);
            } finally {
                setLoading(false);
            }
        };

        loadTickets();
    }, []);

    // Funções de detalhes e estatísticas
    const handleTicketClick = (ticket: TicketData) => {
        setSelectedTicket(ticket);
        setShowTicketDetails(true);
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
        try {
            // Simular geração de relatório
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const filename = `tickets-report-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
            const content = `Relatório de Ingressos\n\n`;
            
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

    // Funções de gestão de mídia
    const handleViewMedia = (ticket: TicketData, type: 'photo' | 'video') => {
        setSelectedTicket(ticket);
        setMediaType(type);
        setShowMediaModal(true);
    };

    const handleUploadMedia = async (event: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'video') => {
        const file = event.target.files?.[0];
        if (!file || !selectedTicket) return;

        setUploadingMedia(true);
        try {
            // Simular upload
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const newMediaUrl = URL.createObjectURL(file);
            const updatedTicket = {
                ...selectedTicket,
                [type === 'photo' ? 'photos' : 'videos']: [
                    ...(type === 'photo' ? selectedTicket.photos : selectedTicket.videos),
                    newMediaUrl
                ]
            };
            
            setTickets(tickets.map(ticket => 
                ticket.id === selectedTicket.id ? updatedTicket : ticket
            ));
            setSelectedTicket(updatedTicket);
            
            alert(`${type === 'photo' ? 'Foto' : 'Vídeo'} enviado com sucesso!`);
        } catch (error) {
            console.error('Erro ao enviar mídia:', error);
            alert('Erro ao enviar mídia. Tente novamente.');
        } finally {
            setUploadingMedia(false);
        }
    };

    const handleDeleteMedia = (mediaUrl: string, type: 'photo' | 'video') => {
        if (!selectedTicket) return;
        
        if (confirm(`Tem certeza que deseja excluir este ${type === 'photo' ? 'foto' : 'vídeo'}?`)) {
            const updatedTicket = {
                ...selectedTicket,
                [type === 'photo' ? 'photos' : 'videos']: 
                    (type === 'photo' ? selectedTicket.photos : selectedTicket.videos).filter(url => url !== mediaUrl)
            };
            
            setTickets(tickets.map(ticket => 
                ticket.id === selectedTicket.id ? updatedTicket : ticket
            ));
            setSelectedTicket(updatedTicket);
        }
    };

    // Funções auxiliares
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ativo': return 'bg-green-100 text-green-800';
            case 'esgotado': return 'bg-red-100 text-red-800';
            case 'inativo': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'parque': return 'bg-blue-100 text-blue-800';
            case 'show': return 'bg-purple-100 text-purple-800';
            case 'transporte': return 'bg-yellow-100 text-yellow-800';
            case 'atração': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatCurrency = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Remover funções não utilizadas que estão causando erros
  // const handleNewTicket = () => {
  //   setShowNewTicketModal(true);
  // };

  // const handleEditTicket = (ticket: TicketData) => {
  //   setEditingTicket(ticket);
  //   setShowEditTicketModal(true);
  // };

  // const handleDeleteTicket = (ticketId: number) => {
  //   if (confirm('Tem certeza que deseja excluir este ingresso?')) {
  //     setTickets(tickets.filter(ticket => ticket.id !== ticketId));
  //   }
  // };

  // const handleImportTickets = () => {
  //   setShowImportModal(true);
  // };

  // const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0];
  //   if (file) {
  //     setImportFile(file);
  //   }
  // };

  // const handleImportSubmit = async () => {
  //   if (!importFile) return;
    
  //   setImportProcessing(true);
  //   try {
  //     // Simular processamento de importação
  //     await new Promise(resolve => setTimeout(resolve, 2000));
  //     alert('Importação concluída com sucesso!');
  //     setShowImportModal(false);
  //     setImportFile(null);
  //   } catch (error) {
  //     console.error('Erro na importação:', error);
  //     alert('Erro na importação. Tente novamente.');
  //   } finally {
  //     setImportProcessing(false);
  //   }
  // };

  // const handleSaveTicket = (ticketData: Partial<TicketData>) => {
  //   if (editingTicket) {
  //     // Editar ingresso existente
  //     const updatedTicket = { ...editingTicket, ...ticketData };
  //     setTickets(tickets.map(ticket => 
  //       ticket.id === editingTicket.id ? updatedTicket : ticket
  //     ));
  //     setShowEditTicketModal(false);
  //     setEditingTicket(null);
  //   } else {
  //     // Criar novo ingresso
  //     const newTicket: TicketData = {
  //       id: Math.max(...tickets.map(t => t.id)) + 1,
  //       name: ticketData.name || '',
  //       location: ticketData.location || '',
  //       description: ticketData.description || '',
  //       type: ticketData.type || 'parque',
  //       status: ticketData.status || 'ativo',
  //       price: ticketData.price || 0,
  //       available: ticketData.available || 0,
  //       total: ticketData.total || 0,
  //       validUntil: ticketData.validUntil || '',
  //       provider: ticketData.provider || '',
  //       contact: ticketData.contact || '',
  //       terms: ticketData.terms || '',
  //       restrictions: ticketData.restrictions || '',
  //       includedServices: ticketData.includedServices || [],
  //       notIncludedServices: ticketData.notIncludedServices || [],
  //       cancellationPolicy: ticketData.cancellationPolicy || '',
  //       refundPolicy: ticketData.refundPolicy || '',
  //       salesHistory: ticketData.salesHistory || []
  //     };
  //     setTickets([...tickets, newTicket]);
  //     setShowNewTicketModal(false);
  //   }
  // };

  const getStatsTitle = (statsType: string) => {
    switch (statsType) {
      case 'revenue': return 'Receita Total';
      case 'total': return 'Total de Ingressos';
      case 'sold': return 'Vendidos';
      case 'active': return 'Ativos';
      default: return 'Estatísticas';
    }
  };

  const getStatsIcon = (statsType: string) => {
    switch (statsType) {
      case 'revenue': return <DollarSign className="h-6 w-6 text-green-600" />;
      case 'total': return <Ticket className="h-6 w-6 text-blue-600" />;
      case 'sold': return <CheckCircle className="h-6 w-6 text-purple-600" />;
      case 'active': return <Clock className="h-6 w-6 text-orange-600" />;
      default: return <BarChart3 className="h-6 w-6 text-gray-600" />;
    }
  };

  const getFilteredStatsData = () => {
    let filteredTickets = mockTickets;

    if (statsSearchTerm) {
      filteredTickets = filteredTickets.filter(ticket =>
        ticket.name.toLowerCase().includes(statsSearchTerm.toLowerCase()) ||
        ticket.location.toLowerCase().includes(statsSearchTerm.toLowerCase()) ||
        ticket.provider.toLowerCase().includes(statsSearchTerm.toLowerCase())
      );
    }

    if (statsFilter !== 'all') {
      filteredTickets = filteredTickets.filter(ticket => ticket.status === statsFilter);
    }

    return filteredTickets;
  };

  // Filtros - Remover referências a variáveis não definidas
  // const filteredTickets = tickets; // Usar diretamente os tickets carregados

  // Estatísticas
  const totalRevenue = tickets.reduce((sum, ticket) => sum + (ticket.price * (ticket.total - ticket.available)), 0);
  const totalTickets = tickets.reduce((sum, ticket) => sum + ticket.total, 0);
  const soldTickets = tickets.reduce((sum, ticket) => sum + (ticket.total - ticket.available), 0);
  const activeTickets = tickets.filter(ticket => ticket.status === 'ativo').length;

  // Componente TicketDetails
    const TicketDetails = ({ ticket, onClose }: { ticket: TicketData; onClose: () => void }) => {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Detalhes do Ingresso - {ticket.name}</h3>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Informações Básicas</h4>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Nome:</label>
                                    <p className="text-gray-900">{ticket.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Localização:</label>
                                    <p className="text-gray-900">{ticket.location}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Tipo:</label>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(ticket.type)}`}>
                                        {ticket.type}
                                    </span>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Status:</label>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                                        {ticket.status}
                                    </span>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Preço:</label>
                                    <p className="text-gray-900">R$ {ticket.price.toFixed(2)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Disponibilidade:</label>
                                    <p className="text-gray-900">{ticket.available}/{ticket.total}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Válido até:</label>
                                    <p className="text-gray-900">{ticket.validUntil}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Informações do Fornecedor</h4>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Fornecedor:</label>
                                    <p className="text-gray-900">{ticket.provider}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Contato:</label>
                                    <p className="text-gray-900">{ticket.contact}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Termos:</label>
                                    <p className="text-gray-900">{ticket.terms}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Restrições:</label>
                                    <p className="text-gray-900">{ticket.restrictions}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Serviços Incluídos</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h5 className="text-sm font-medium text-green-600 mb-2">✅ Incluídos:</h5>
                                <ul className="space-y-1">
                                    {ticket.includedServices.map((service, index) => (
                                        <li key={index} className="text-sm text-gray-700 flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            {service}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h5 className="text-sm font-medium text-red-600 mb-2">✗ Não Incluídos:</h5>
                                <ul className="space-y-1">
                                    {ticket.notIncludedServices.map((service, index) => (
                                        <li key={index} className="text-sm text-gray-700 flex items-center gap-2">
                                            <X className="w-4 h-4 text-red-500" />
                                            {service}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Políticas</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm font-medium text-gray-600">Política de Cancelamento:</label>
                                <p className="text-gray-900">{ticket.cancellationPolicy}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Política de Reembolso:</label>
                                <p className="text-gray-900">{ticket.refundPolicy}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Histórico de Vendas (Últimos 3 dias)</h4>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantidade</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Receita</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {ticket.salesHistory.map((sale, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 text-sm text-gray-900">{sale.date}</td>
                                            <td className="px-4 py-2 text-sm text-gray-900">{sale.quantity}</td>
                                            <td className="px-4 py-2 text-sm text-gray-900">R$ {sale.revenue.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Mídia</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4" />
                                    Fotos ({ticket.photos.length})
                                </h5>
                                {ticket.photos.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-2">
                                        {ticket.photos.slice(0, 4).map((photo, index) => (
                                            <img
                                                key={index}
                                                src={photo}
                                                alt={`Foto ${index + 1}`}
                                                className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-80"
                                                onClick={() => setSelectedMedia(photo)}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">Nenhuma foto disponível</p>
                                )}
                                <button
                                    onClick={() => handleViewMedia(ticket, 'photo')}
                                    className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm"
                                >
                                    Ver Todas as Fotos
                                </button>
                            </div>
                            <div>
                                <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Play className="w-4 h-4" />
                                    Vídeos ({ticket.videos.length})
                                </h5>
                                {ticket.videos.length > 0 ? (
                                    <div className="space-y-2">
                                        {ticket.videos.slice(0, 2).map((video, index) => (
                                            <video
                                                key={index}
                                                src={video}
                                                className="w-full h-20 object-cover rounded-lg cursor-pointer"
                                                controls
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">Nenhum vídeo disponível</p>
                                )}
                                <button
                                    onClick={() => handleViewMedia(ticket, 'video')}
                                    className="mt-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 text-sm"
                                >
                                    Ver Todos os Vídeos
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Componente StatsDetails
    const StatsDetails = ({ statsType, onClose }: { statsType: string; onClose: () => void }) => {
        const statsData = getFilteredStatsData();

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            {getStatsIcon(statsType)}
                            {getStatsTitle(statsType)}
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
                                placeholder="Buscar por nome, localização ou fornecedor..."
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
                                <option value="parque">Parque</option>
                                <option value="show">Show</option>
                                <option value="transporte">Transporte</option>
                                <option value="atração">Atração</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ingresso
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tipo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Preço
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Disponíveis
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Vendidos
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Receita
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {statsData.map((ticket) => (
                                    <tr key={ticket.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleTicketClick(ticket)}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {ticket.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(ticket.type)}`}>
                                                {ticket.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                                                {ticket.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            R$ {ticket.price.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {ticket.available}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {ticket.total - ticket.available}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            R$ {((ticket.total - ticket.available) * ticket.price).toFixed(2)}
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
                            Exportar Relatório
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
                        <h3 className="text-lg font-semibold">Exportar Relatório</h3>
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

    // Componente MediaModal
    const MediaModal = ({ ticket, type, onClose }: { 
        ticket: TicketData; 
        type: 'photo' | 'video'; 
        onClose: () => void; 
    }) => {
        const mediaList = type === 'photo' ? ticket.photos : ticket.videos;
        const mediaLabel = type === 'photo' ? 'Fotos' : 'Vídeos';

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">{mediaLabel} - {ticket.name}</h3>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Adicionar Nova {type === 'photo' ? 'Foto' : 'Vídeo'}
                        </label>
                        <input
                            type="file"
                            accept={type === 'photo' ? 'image/*' : 'video/*'}
                            onChange={(e) => handleUploadMedia(e, type)}
                            disabled={uploadingMedia}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {uploadingMedia && (
                            <p className="text-sm text-blue-600 mt-1">Enviando {type === 'photo' ? 'foto' : 'vídeo'}...</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {mediaList.map((media, index) => (
                            <div key={index} className="relative group">
                                {type === 'photo' ? (
                                    <img
                                        src={media}
                                        alt={`${ticket.name} - ${mediaLabel} ${index + 1}`}
                                        className="w-full h-32 object-cover rounded-lg cursor-pointer"
                                        onClick={() => setSelectedMedia(media)}
                                    />
                                ) : (
                                    <video
                                        src={media}
                                        className="w-full h-32 object-cover rounded-lg cursor-pointer"
                                        onClick={() => setSelectedMedia(media)}
                                        controls
                                    />
                                )}
                                <button
                                    onClick={() => handleDeleteMedia(media, type)}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {selectedMedia && (
                        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60">
                            <div className="relative max-w-4xl max-h-[90vh]">
                                {type === 'photo' ? (
                                    <img
                                        src={selectedMedia}
                                        alt="Preview"
                                        className="max-w-full max-h-full object-contain"
                                    />
                                ) : (
                                    <video
                                        src={selectedMedia}
                                        controls
                                        className="max-w-full max-h-full"
                                    />
                                )}
                                <button
                                    onClick={() => setSelectedMedia('')}
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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestão de Ingressos</h1>
            <p className="text-gray-600">Gerencie ingressos para parques, shows e atrações</p>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div 
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleStatsClick('total')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Ingressos</p>
                  <p className="text-2xl font-bold text-gray-900">{tickets.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Ticket className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div 
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleStatsClick('revenue')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Receita Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    R$ {tickets.reduce((sum, ticket) => sum + (ticket.price * (ticket.total - ticket.available)), 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div 
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleStatsClick('available')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Disponíveis</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tickets.reduce((sum, ticket) => sum + ticket.available, 0)}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div 
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleStatsClick('sold')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Vendidos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tickets.reduce((sum, ticket) => sum + (ticket.total - ticket.available), 0)}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-4">
              <button
                onClick={handleExportReport}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
            </div>
          </div>

          {/* Grid de Ingressos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map((ticket) => (
              <div 
                key={ticket.id} 
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleTicketClick(ticket)}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{ticket.name}</h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {ticket.location}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(ticket.type)}`}>
                      {ticket.type}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{ticket.description}</p>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-600">R$ {ticket.price.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-600">{ticket.available}/{ticket.total}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{ticket.validUntil}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTicketClick(ticket);
                      }}
                      className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      Ver Detalhes
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewMedia(ticket, 'photo');
                      }}
                      className="px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                      title="Ver Fotos"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewMedia(ticket, 'video');
                      }}
                      className="px-3 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      title="Ver Vídeos"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modais */}
        {showTicketDetails && selectedTicket && (
          <TicketDetails
            ticket={selectedTicket}
            onClose={() => setShowTicketDetails(false)}
          />
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

        {showMediaModal && selectedTicket && (
          <MediaModal
            ticket={selectedTicket}
            type={mediaType}
            onClose={() => {
              setShowMediaModal(false);
              setSelectedTicket(null);
              setSelectedMedia('');
            }}
          />
        )}
      </div>
    </ProtectedRoute>
  );
} 
