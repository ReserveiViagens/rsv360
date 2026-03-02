/**
 * Componente de Calendário do Grupo Sincronizado
 * Exibe eventos sincronizados entre membros do grupo
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Plus, Edit, Trash2, MapPin, Users, Wifi, WifiOff } from 'lucide-react';
import { groupCalendarService, type CalendarEvent } from '@/lib/group-calendar-service';
import { useToast } from '@/components/providers/toast-wrapper';

interface GroupCalendarProps {
  groupId: string;
  tripId?: number;
  wishlistId?: number;
  userId: number;
  canEdit?: boolean;
}

export function GroupCalendar({
  groupId,
  tripId,
  wishlistId,
  userId,
  canEdit = true,
}: GroupCalendarProps) {
  const { toast } = useToast();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    allDay: false,
    location: '',
    color: '#3b82f6',
    type: 'custom' as CalendarEvent['type'],
  });

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [groupId]);

  const connect = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('Token não encontrado');
        return;
      }

      await groupCalendarService.connect(groupId, token);
      setIsConnected(true);

      // Subscrever a atualizações
      unsubscribeRef.current = groupCalendarService.subscribe(
        groupId,
        (updatedEvents: CalendarEvent[]) => {
          setEvents(updatedEvents);
        }
      );

      // Carregar eventos iniciais
      const initialEvents = await groupCalendarService.getGroupEvents(groupId);
      setEvents(initialEvents);
    } catch (error) {
      console.error('Erro ao conectar:', error);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const disconnect = () => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }
    groupCalendarService.disconnect();
    setIsConnected(false);
  };

  const handleCreateEvent = async () => {
    try {
      const startDate = new Date(`${formData.startDate}T${formData.allDay ? '00:00' : formData.startTime}`);
      const endDate = formData.endDate
        ? new Date(`${formData.endDate}T${formData.allDay ? '23:59' : formData.endTime || formData.startTime}`)
        : undefined;

      const event: CalendarEvent = {
        groupId,
        tripId,
        wishlistId,
        title: formData.title,
        description: formData.description || undefined,
        startDate,
        endDate,
        allDay: formData.allDay,
        location: formData.location || undefined,
        createdBy: userId,
        color: formData.color,
        type: formData.type,
      };

      await groupCalendarService.createEvent(event);

      toast({
        title: 'Evento criado',
        description: 'Evento adicionado ao calendário do grupo',
      });

      resetForm();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar evento',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateEvent = async () => {
    if (!editingEvent || !editingEvent.id) return;

    try {
      const startDate = new Date(`${formData.startDate}T${formData.allDay ? '00:00' : formData.startTime}`);
      const endDate = formData.endDate
        ? new Date(`${formData.endDate}T${formData.allDay ? '23:59' : formData.endTime || formData.startTime}`)
        : undefined;

      await groupCalendarService.updateEvent(editingEvent.id, {
        title: formData.title,
        description: formData.description || undefined,
        startDate,
        endDate,
        allDay: formData.allDay,
        location: formData.location || undefined,
        color: formData.color,
        type: formData.type,
      });

      toast({
        title: 'Evento atualizado',
        description: 'Evento atualizado com sucesso',
      });

      resetForm();
      setIsDialogOpen(false);
      setEditingEvent(null);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar evento',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm('Tem certeza que deseja deletar este evento?')) {
      return;
    }

    try {
      await groupCalendarService.deleteEvent(eventId, groupId);
      toast({
        title: 'Evento deletado',
        description: 'Evento removido do calendário',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao deletar evento',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      allDay: false,
      location: '',
      color: '#3b82f6',
      type: 'custom',
    });
    setEditingEvent(null);
  };

  const openEditDialog = (event: CalendarEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      startDate: event.startDate.toISOString().split('T')[0],
      startTime: event.allDay ? '' : event.startDate.toTimeString().slice(0, 5),
      endDate: event.endDate ? event.endDate.toISOString().split('T')[0] : '',
      endTime: event.endDate && !event.allDay ? event.endDate.toTimeString().slice(0, 5) : '',
      allDay: event.allDay || false,
      location: event.location || '',
      color: event.color || '#3b82f6',
      type: event.type || 'custom',
    });
    setIsDialogOpen(true);
  };

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => {
      const eventStart = event.startDate.toISOString().split('T')[0];
      const eventEnd = event.endDate ? event.endDate.toISOString().split('T')[0] : eventStart;
      return dateStr >= eventStart && dateStr <= eventEnd;
    });
  };

  const typeLabels: Record<CalendarEvent['type'] | string, string> = {
    booking: 'Reserva',
    activity: 'Atividade',
    meeting: 'Reunião',
    reminder: 'Lembrete',
    custom: 'Personalizado',
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Carregando calendário...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Calendário do Grupo
            </CardTitle>
            <CardDescription>
              Eventos sincronizados entre membros
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Wifi className="w-3 h-3 mr-1" />
                Sincronizado
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                <WifiOff className="w-3 h-3 mr-1" />
                Offline
              </Badge>
            )}
            {canEdit && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={() => resetForm()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Evento
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingEvent ? 'Editar Evento' : 'Novo Evento'}
                    </DialogTitle>
                    <DialogDescription>
                      Adicione um evento ao calendário do grupo
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Título *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Nome do evento"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Detalhes do evento"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startDate">Data de Início *</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                      </div>
                      {!formData.allDay && (
                        <div>
                          <Label htmlFor="startTime">Hora de Início</Label>
                          <Input
                            id="startTime"
                            type="time"
                            value={formData.startTime}
                            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                          />
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="endDate">Data de Término</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                      </div>
                      {!formData.allDay && (
                        <div>
                          <Label htmlFor="endTime">Hora de Término</Label>
                          <Input
                            id="endTime"
                            type="time"
                            value={formData.endTime}
                            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="allDay"
                        checked={formData.allDay}
                        onChange={(e) => setFormData({ ...formData, allDay: e.target.checked })}
                        className="rounded"
                      />
                      <Label htmlFor="allDay">Dia inteiro</Label>
                    </div>
                    <div>
                      <Label htmlFor="location">Localização</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Onde será o evento?"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={editingEvent ? handleUpdateEvent : handleCreateEvent}
                        disabled={!formData.title || !formData.startDate}
                      >
                        {editingEvent ? 'Atualizar' : 'Criar'}
                      </Button>
                      <Button variant="outline" onClick={() => {
                        setIsDialogOpen(false);
                        resetForm();
                      }}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Lista de eventos */}
        <div className="space-y-3">
          {events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum evento no calendário</p>
              {canEdit && (
                <p className="text-sm mt-1">
                  Clique em "Novo Evento" para adicionar
                </p>
              )}
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="p-3 rounded-lg border"
                style={{ borderLeftColor: event.color, borderLeftWidth: '4px' }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{event.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {typeLabels[event.type || 'custom']}
                      </Badge>
                    </div>
                    {event.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {event.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        {event.allDay
                          ? event.startDate.toLocaleDateString('pt-BR')
                          : event.startDate.toLocaleString('pt-BR')}
                        {event.endDate && event.endDate.getTime() !== event.startDate.getTime() && (
                          <> - {event.allDay
                            ? event.endDate.toLocaleDateString('pt-BR')
                            : event.endDate.toLocaleString('pt-BR')}</>
                        )}
                      </span>
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {event.location}
                        </span>
                      )}
                      {event.attendees && event.attendees.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {event.attendees.length} participante(s)
                        </span>
                      )}
                    </div>
                  </div>
                  {canEdit && (event.createdBy === userId || canEdit) && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(event)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => event.id && handleDeleteEvent(event.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

