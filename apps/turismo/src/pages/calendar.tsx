import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { useRouter } from 'next/router';
import {
  Calendar,
  ArrowLeft,
  Plus,
  Clock,
  MapPin,
  Users,
  DollarSign,
  CheckCircle,
  XCircle,
  Edit,
  Trash,
  X,
  Search
} from 'lucide-react';

interface CalendarEvent {
  id: number;
  title: string;
  destination: string;
  date: string;
  time: string;
  duration: string;
  passengers: number;
  price: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  type: 'meeting' | 'consultation' | 'presentation';
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [showStatsDetails, setShowStatsDetails] = useState(false);
  const [selectedStatsType, setSelectedStatsType] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [statsSearchTerm, setStatsSearchTerm] = useState('');
  const [statsFilter, setStatsFilter] = useState('all');

  // Dados mockados de eventos
  const mockEvents: CalendarEvent[] = [
    {
      id: 1,
      title: 'Consulta de Viagem - Paris',
      destination: 'Paris, França',
      date: '2024-08-15',
      time: '14:00',
      duration: '1 hora',
      passengers: 2,
      price: 4500.00,
      status: 'confirmed',
      type: 'consultation'
    },
    {
      id: 2,
      title: 'Apresentação Pacote Disney',
      destination: 'Orlando, EUA',
      date: '2024-08-20',
      time: '10:00',
      duration: '45 min',
      passengers: 4,
      price: 8500.00,
      status: 'pending',
      type: 'presentation'
    },
    {
      id: 3,
      title: 'Reunião Corporativa',
      destination: 'São Paulo, Brasil',
      date: '2024-08-25',
      time: '16:00',
      duration: '2 horas',
      passengers: 8,
      price: 12000.00,
      status: 'confirmed',
      type: 'meeting'
    }
  ];

  // Inicializar eventos
  React.useEffect(() => {
    setEvents(mockEvents);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-100 text-blue-800';
      case 'consultation': return 'bg-purple-100 text-purple-800';
      case 'presentation': return 'bg-orange-100 text-orange-800';
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

  const handleNewEvent = () => {
    setShowNewEvent(true);
  };

  const handleViewEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const handleStatsClick = (type: string) => {
    setSelectedStatsType(type);
    setShowStatsDetails(true);
    setStatsSearchTerm('');
    setStatsFilter('all');
  };

  const handleDeleteEvent = (eventId: number) => {
    if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
      setEvents(prev => prev.filter(event => event.id !== eventId));
    }
  };

  const NewEventForm = () => {
    const [formData, setFormData] = useState({
      title: '',
      destination: '',
      date: selectedDate,
      time: '',
      duration: '',
      passengers: 1,
      price: 0,
      type: 'consultation' as CalendarEvent['type'],
      description: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      const newEvent: CalendarEvent = {
        id: Date.now(),
        title: formData.title,
        destination: formData.destination,
        date: formData.date,
        time: formData.time,
        duration: formData.duration,
        passengers: formData.passengers,
        price: formData.price,
        status: 'pending',
        type: formData.type
      };

      setEvents(prev => [...prev, newEvent]);
      setShowNewEvent(false);
      
      // Reset form
      setFormData({
        title: '',
        destination: '',
        date: selectedDate,
        time: '',
        duration: '',
        passengers: 1,
        price: 0,
        type: 'consultation',
        description: ''
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título do Agendamento
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Consulta de Viagem - Paris"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Destino
          </label>
          <input
            type="text"
            required
            value={formData.destination}
            onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Paris, França"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Horário
            </label>
            <input
              type="time"
              required
              value={formData.time}
              onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duração
            </label>
            <input
              type="text"
              required
              value={formData.duration}
              onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 1 hora"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Passageiros
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.passengers}
              onChange={(e) => setFormData(prev => ({ ...prev, passengers: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preço (R$)
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              required
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as CalendarEvent['type'] }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="consultation">Consulta</option>
              <option value="meeting">Reunião</option>
              <option value="presentation">Apresentação</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição (Opcional)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Detalhes adicionais sobre o agendamento..."
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => setShowNewEvent(false)}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Criar Agendamento
          </button>
        </div>
      </form>
    );
  };

  const filteredEvents = events.filter(event => event.date === selectedDate);

  const StatsDetails = () => {
    const getFilteredEvents = () => {
      let filtered = events;

      // Filtrar por tipo de estatística
      switch (selectedStatsType) {
        case 'total':
          filtered = events;
          break;
        case 'confirmed':
          filtered = events.filter(e => e.status === 'confirmed');
          break;
        case 'pending':
          filtered = events.filter(e => e.status === 'pending');
          break;
        case 'revenue':
          filtered = events;
          break;
        default:
          filtered = events;
      }

      // Aplicar filtro adicional
      if (statsFilter !== 'all') {
        filtered = filtered.filter(e => e.status === statsFilter);
      }

      // Aplicar busca
      if (statsSearchTerm) {
        filtered = filtered.filter(e => 
          e.title.toLowerCase().includes(statsSearchTerm.toLowerCase()) ||
          e.destination.toLowerCase().includes(statsSearchTerm.toLowerCase())
        );
      }

      return filtered;
    };

    const getStatsTitle = () => {
      switch (selectedStatsType) {
        case 'total': return 'Total de Agendamentos';
        case 'confirmed': return 'Agendamentos Confirmados';
        case 'pending': return 'Agendamentos Pendentes';
        case 'revenue': return 'Valor Total';
        default: return 'Detalhes';
      }
    };

    const getStatsIcon = () => {
      switch (selectedStatsType) {
        case 'total': return <Calendar className="h-6 w-6 text-blue-600" />;
        case 'confirmed': return <CheckCircle className="h-6 w-6 text-green-600" />;
        case 'pending': return <Clock className="h-6 w-6 text-yellow-600" />;
        case 'revenue': return <DollarSign className="h-6 w-6 text-purple-600" />;
        default: return <Calendar className="h-6 w-6 text-gray-600" />;
      }
    };

    const getStatsValue = () => {
      const filtered = getFilteredEvents();
      switch (selectedStatsType) {
        case 'total': return filtered.length;
        case 'confirmed': return filtered.length;
        case 'pending': return filtered.length;
        case 'revenue': return formatPrice(filtered.reduce((sum, e) => sum + e.price, 0));
        default: return filtered.length;
      }
    };

    const filteredEvents = getFilteredEvents();

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="p-3 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            {getStatsIcon()}
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{getStatsTitle()}</h3>
          <p className="text-2xl font-bold text-blue-600">{getStatsValue()}</p>
        </div>

        {/* Busca e Filtros */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar agendamentos..."
                  value={statsSearchTerm}
                  onChange={(e) => setStatsSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <select
                value={statsFilter}
                onChange={(e) => setStatsFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos os Status</option>
                <option value="confirmed">Confirmados</option>
                <option value="pending">Pendentes</option>
                <option value="cancelled">Cancelados</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Eventos */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold">Agendamentos ({filteredEvents.length})</h4>
            <button
              onClick={() => setShowNewEvent(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
            >
              + Novo
            </button>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum agendamento encontrado</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredEvents.map(event => (
                <div 
                  key={event.id} 
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setShowStatsDetails(false);
                    handleViewEvent(event);
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h5 className="font-semibold text-gray-900">{event.title}</h5>
                      <p className="text-sm text-gray-600">{event.destination}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                        {event.status === 'confirmed' ? 'Confirmado' : 
                         event.status === 'pending' ? 'Pendente' : 'Cancelado'}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(event.type)}`}>
                        {event.type === 'consultation' ? 'Consulta' :
                         event.type === 'meeting' ? 'Reunião' : 'Apresentação'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{event.passengers} pessoas</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{formatPrice(event.price)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <button
            onClick={() => setShowStatsDetails(false)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  };

  const EventDetails = () => {
    if (!selectedEvent) return null;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="p-3 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedEvent.title}</h3>
          <p className="text-gray-600">{selectedEvent.destination}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Calendar className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">Data</span>
            </div>
            <p className="text-gray-900">{formatDate(selectedEvent.date)}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Clock className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">Horário</span>
            </div>
            <p className="text-gray-900">{selectedEvent.time} ({selectedEvent.duration})</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <MapPin className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">Destino</span>
            </div>
            <p className="text-gray-900">{selectedEvent.destination}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Users className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">Passageiros</span>
            </div>
            <p className="text-gray-900">{selectedEvent.passengers} pessoas</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <DollarSign className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">Preço</span>
            </div>
            <p className="text-gray-900 font-semibold">{formatPrice(selectedEvent.price)}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Status</span>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedEvent.status)}`}>
              {selectedEvent.status === 'confirmed' ? 'Confirmado' : 
               selectedEvent.status === 'pending' ? 'Pendente' : 'Cancelado'}
            </span>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Tipo de Agendamento</span>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(selectedEvent.type)}`}>
            {selectedEvent.type === 'consultation' ? 'Consulta' :
             selectedEvent.type === 'meeting' ? 'Reunião' : 'Apresentação'}
          </span>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            onClick={() => setShowEventDetails(false)}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Fechar
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Editar Agendamento
          </button>
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">📅 Calendário de Agendamentos</h1>
                <p className="text-gray-600 mt-2">Gerencie seus compromissos e consultas</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/travel')}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar às Viagens
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
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total de Agendamentos</p>
                  <p className="text-2xl font-bold text-gray-900">{events.length}</p>
                </div>
              </div>
            </div>

            <div 
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleStatsClick('confirmed')}
            >
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Confirmados</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {events.filter(e => e.status === 'confirmed').length}
                  </p>
                </div>
              </div>
            </div>

            <div 
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleStatsClick('pending')}
            >
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pendentes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {events.filter(e => e.status === 'pending').length}
                  </p>
                </div>
              </div>
            </div>

            <div 
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleStatsClick('revenue')}
            >
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Valor Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPrice(events.reduce((sum, event) => sum + event.price, 0))}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar and Events */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Selecionar Data</h2>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Próximos Eventos</h3>
                    <div className="space-y-2">
                      {events.slice(0, 3).map(event => (
                        <div 
                          key={event.id} 
                          className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => handleViewEvent(event)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{event.title}</p>
                              <p className="text-xs text-gray-500">{formatDate(event.date)} às {event.time}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                              {event.status === 'confirmed' ? 'Confirmado' : 
                               event.status === 'pending' ? 'Pendente' : 'Cancelado'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Events List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-lg font-semibold">Agendamentos para {formatDate(selectedDate)}</h2>
                      <p className="text-sm text-gray-600">
                        {filteredEvents.length} evento(s) encontrado(s)
                      </p>
                    </div>
                    <button
                      onClick={handleNewEvent}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Agendamento
                    </button>
                  </div>

                  {filteredEvents.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Nenhum agendamento para esta data</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredEvents.map(event => (
                        <div key={event.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <Calendar className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{event.title}</h3>
                                <p className="text-sm text-gray-600">{event.destination}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                                {event.status}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(event.type)}`}>
                                {event.type}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 text-gray-400 mr-2" />
                              <span>{event.time} ({event.duration})</span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                              <span>{event.destination}</span>
                            </div>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 text-gray-400 mr-2" />
                              <span>{event.passengers} pessoas</span>
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                              <span>{formatPrice(event.price)}</span>
                            </div>
                          </div>

                          <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                            <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                              <Edit className="h-4 w-4 inline mr-1" />
                              Editar
                            </button>
                            <button 
                              onClick={() => handleDeleteEvent(event.id)}
                              className="text-red-600 hover:text-red-900 text-sm font-medium"
                            >
                              <Trash className="h-4 w-4 inline mr-1" />
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Novo Agendamento */}
        <Modal
          isOpen={showNewEvent}
          onClose={() => setShowNewEvent(false)}
          title="Novo Agendamento"
        >
          <NewEventForm />
        </Modal>

        {/* Modal Detalhes do Evento */}
        <Modal
          isOpen={showEventDetails}
          onClose={() => setShowEventDetails(false)}
          title="Detalhes do Agendamento"
        >
          <EventDetails />
        </Modal>

        {/* Modal Detalhes das Estatísticas */}
        <Modal
          isOpen={showStatsDetails}
          onClose={() => setShowStatsDetails(false)}
          title="Detalhes das Estatísticas"
        >
          <StatsDetails />
        </Modal>
      </div>
    </ProtectedRoute>
  );
} 