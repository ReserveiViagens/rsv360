'use client';

/**
 * Componente: Histórico do Cliente (CRM)
 * Exibe histórico de reservas e interações em formato de timeline visual
 */

import { useState, useEffect } from 'react';
import { 
  Calendar, Clock, Phone, Mail, MessageSquare, 
  ShoppingBag, FileText, Loader2, Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Booking {
  id: number;
  booking_number: string;
  property_name?: string;
  check_in: string;
  check_out: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface Interaction {
  id: number;
  interaction_type: string;
  channel: string;
  subject?: string;
  description?: string;
  outcome?: string;
  duration_minutes?: number;
  sentiment?: string;
  priority: string;
  interaction_date: string;
  created_at: string;
}

interface CustomerHistoryProps {
  customerId: number;
  className?: string;
}

export function CustomerHistory({ customerId, className }: CustomerHistoryProps) {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'bookings' | 'interactions'>('all');
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'week' | 'month' | 'year'>('all');

  useEffect(() => {
    fetchHistory();
  }, [customerId, filterPeriod]);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      // Buscar interações
      const interactionsResponse = await fetch(
        `/api/crm/customers/${customerId}/interactions`
      );
      
      if (interactionsResponse.ok) {
        const interactionsData = await interactionsResponse.json();
        setInteractions(interactionsData.data || []);
      }

      // Buscar reservas (assumindo que existe uma API de bookings)
      // Por enquanto, vamos usar dados mockados ou deixar vazio
      // TODO: Integrar com API de bookings quando disponível
      setBookings([]);

    } catch (err: any) {
      setError(err.message || 'Erro ao carregar histórico');
    } finally {
      setLoading(false);
    }
  };

  const getInteractionIcon = (type: string, channel: string) => {
    if (channel === 'phone') return <Phone className="h-4 w-4" />;
    if (channel === 'email') return <Mail className="h-4 w-4" />;
    if (channel === 'chat' || channel === 'whatsapp') return <MessageSquare className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const getInteractionColor = (type: string, sentiment?: string) => {
    if (sentiment === 'positive') return 'bg-green-100 text-green-800 border-green-300';
    if (sentiment === 'negative') return 'bg-red-100 text-red-800 border-red-300';
    return 'bg-blue-100 text-blue-800 border-blue-300';
  };

  const getBookingStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Combinar e ordenar eventos
  const timelineEvents = [
    ...bookings.map(booking => ({
      type: 'booking' as const,
      id: booking.id,
      date: booking.created_at,
      data: booking,
    })),
    ...interactions.map(interaction => ({
      type: 'interaction' as const,
      id: interaction.id,
      date: interaction.interaction_date || interaction.created_at,
      data: interaction,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Filtrar eventos
  const filteredEvents = timelineEvents.filter(event => {
    if (filterType === 'bookings' && event.type !== 'booking') return false;
    if (filterType === 'interactions' && event.type !== 'interaction') return false;

    if (filterPeriod !== 'all') {
      const eventDate = new Date(event.date);
      const now = new Date();
      const diffTime = now.getTime() - eventDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (filterPeriod === 'week' && diffDays > 7) return false;
      if (filterPeriod === 'month' && diffDays > 30) return false;
      if (filterPeriod === 'year' && diffDays > 365) return false;
    }

    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Histórico do Cliente</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="bookings">Reservas</SelectItem>
                  <SelectItem value="interactions">Interações</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPeriod} onValueChange={(value: any) => setFilterPeriod(value)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todo período</SelectItem>
                  <SelectItem value="week">Última semana</SelectItem>
                  <SelectItem value="month">Último mês</SelectItem>
                  <SelectItem value="year">Último ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Nenhum evento encontrado no período selecionado
            </div>
          ) : (
            <div className="relative">
              {/* Timeline vertical */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

              <div className="space-y-6">
                {filteredEvents.map((event, index) => (
                  <div key={`${event.type}-${event.id}`} className="relative flex items-start gap-4">
                    {/* Timeline dot */}
                    <div className="relative z-10 flex-shrink-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        event.type === 'booking'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-green-100 text-green-600'
                      }`}>
                        {event.type === 'booking' ? (
                          <ShoppingBag className="h-6 w-6" />
                        ) : (
                          getInteractionIcon(
                            (event.data as Interaction).interaction_type,
                            (event.data as Interaction).channel
                          )
                        )}
                      </div>
                    </div>

                    {/* Event content */}
                    <div className="flex-1 pb-6">
                      <div className="bg-white border rounded-lg p-4 shadow-sm">
                        {event.type === 'booking' ? (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <ShoppingBag className="h-4 w-4 text-gray-500" />
                                <span className="font-semibold">
                                  Reserva #{((event.data as Booking).booking_number || event.id)}
                                </span>
                                <Badge className={getBookingStatusColor((event.data as Booking).status)}>
                                  {(event.data as Booking).status}
                                </Badge>
                              </div>
                              <span className="text-sm text-gray-500">
                                {formatDateTime(event.date)}
                              </span>
                            </div>
                            <div className="space-y-1 text-sm text-gray-600">
                              {(event.data as Booking).property_name && (
                                <div>
                                  <span className="font-medium">Propriedade: </span>
                                  {(event.data as Booking).property_name}
                                </div>
                              )}
                              <div className="flex items-center gap-4">
                                <div>
                                  <Calendar className="h-4 w-4 inline mr-1" />
                                  <span>Check-in: {formatDate((event.data as Booking).check_in)}</span>
                                </div>
                                <div>
                                  <Calendar className="h-4 w-4 inline mr-1" />
                                  <span>Check-out: {formatDate((event.data as Booking).check_out)}</span>
                                </div>
                              </div>
                              <div>
                                <span className="font-medium">Valor: </span>
                                {formatCurrency((event.data as Booking).total_amount)}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {getInteractionIcon(
                                  (event.data as Interaction).interaction_type,
                                  (event.data as Interaction).channel
                                )}
                                <span className="font-semibold capitalize">
                                  {(event.data as Interaction).interaction_type}
                                </span>
                                <Badge className={getInteractionColor(
                                  (event.data as Interaction).interaction_type,
                                  (event.data as Interaction).sentiment
                                )}>
                                  {(event.data as Interaction).channel}
                                </Badge>
                                {(event.data as Interaction).priority && (
                                  <Badge variant="outline">
                                    {(event.data as Interaction).priority}
                                  </Badge>
                                )}
                              </div>
                              <span className="text-sm text-gray-500">
                                {formatDateTime(event.date)}
                              </span>
                            </div>
                            {(event.data as Interaction).subject && (
                              <div className="font-medium mb-1">
                                {(event.data as Interaction).subject}
                              </div>
                            )}
                            {(event.data as Interaction).description && (
                              <div className="text-sm text-gray-600 mb-2">
                                {(event.data as Interaction).description}
                              </div>
                            )}
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              {(event.data as Interaction).duration_minutes && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{(event.data as Interaction).duration_minutes} min</span>
                                </div>
                              )}
                              {(event.data as Interaction).outcome && (
                                <div>
                                  <span className="font-medium">Resultado: </span>
                                  {(event.data as Interaction).outcome}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

