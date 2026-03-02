import React, { useState } from 'react';
import { Layout } from '../components/layout';
import { Card, Button, Badge, Alert } from '../components/ui';
import { AnimatedCard, PageTransition } from '../components/ui';
import { useAnimations } from '../hooks/useAnimations';
import { 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  Star,
  Clock,
  Plane
} from 'lucide-react';

export default function Travel() {
  const { staggerContainer, staggerItem } = useAnimations();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const trips = [
    {
      id: 1,
      destination: 'Caldas Novas - GO',
      date: '2024-01-15',
      participants: 25,
      price: 1200,
      status: 'confirmed',
      rating: 4.8,
      duration: '3 dias'
    },
    {
      id: 2,
      destination: 'Búzios - RJ',
      date: '2024-01-20',
      participants: 18,
      price: 1800,
      status: 'pending',
      rating: 4.6,
      duration: '4 dias'
    },
    {
      id: 3,
      destination: 'Fernando de Noronha - PE',
      date: '2024-01-25',
      participants: 12,
      price: 3500,
      status: 'confirmed',
      rating: 4.9,
      duration: '7 dias'
    },
    {
      id: 4,
      destination: 'Gramado - RS',
      date: '2024-02-01',
      participants: 30,
      price: 1500,
      status: 'draft',
      rating: 4.7,
      duration: '5 dias'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada';
      case 'pending':
        return 'Pendente';
      case 'draft':
        return 'Rascunho';
      default:
        return 'Desconhecido';
    }
  };

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || trip.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <Layout>
      <PageTransition type="fade" className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              ✈️ Viagens
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Gerencie todas as viagens e reservas
            </p>
          </div>
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Nova Viagem</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <motion.div variants={staggerItem}>
            <AnimatedCard animation="fadeInUp" delay={0} hover="lift">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total de Viagens
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {trips.length}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Plane className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </motion.div>

          <motion.div variants={staggerItem}>
            <AnimatedCard animation="fadeInUp" delay={100} hover="lift">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Confirmadas
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {trips.filter(t => t.status === 'confirmed').length}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <Star className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </motion.div>

          <motion.div variants={staggerItem}>
            <AnimatedCard animation="fadeInUp" delay={200} hover="lift">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Participantes
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {trips.reduce((acc, trip) => acc + trip.participants, 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </motion.div>

          <motion.div variants={staggerItem}>
            <AnimatedCard animation="fadeInUp" delay={300} hover="lift">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Receita Total
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      R$ {trips.reduce((acc, trip) => acc + trip.price, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                    <DollarSign className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </motion.div>
        </motion.div>

        {/* Search and Filter */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por destino..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                title="Filtrar por status"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              >
                <option value="all">Todos os Status</option>
                <option value="confirmed">Confirmadas</option>
                <option value="pending">Pendentes</option>
                <option value="draft">Rascunhos</option>
              </select>
              <Button variant="outline" className="flex items-center space-x-2">
                <Filter className="h-4 w-4" />
                <span>Filtros</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* Trips List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip, index) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <AnimatedCard animation="fadeInUp" delay={index * 100} hover="lift">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {trip.destination}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4 mr-1" />
                        {trip.date}
                      </div>
                    </div>
                    <Badge className={getStatusColor(trip.status)}>
                      {getStatusText(trip.status)}
                    </Badge>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Users className="h-4 w-4 mr-2" />
                        Participantes
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {trip.participants}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Clock className="h-4 w-4 mr-2" />
                        Duração
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {trip.duration}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Preço
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        R$ {trip.price.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Star className="h-4 w-4 mr-2" />
                        Avaliação
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {trip.rating}/5
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button size="sm">
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              </AnimatedCard>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTrips.length === 0 && (
          <Card className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Plane className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nenhuma viagem encontrada
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Tente ajustar os filtros ou criar uma nova viagem.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Viagem
            </Button>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🚀 Ações Rápidas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <Plus className="h-6 w-6" />
              <span>Nova Viagem</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <Calendar className="h-6 w-6" />
              <span>Agendar Viagem</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <Users className="h-6 w-6" />
              <span>Gerenciar Grupos</span>
            </Button>
          </div>
        </Card>
      </PageTransition>
    </Layout>
  );
}