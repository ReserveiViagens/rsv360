'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Ticket as TicketIcon,
  MapPin,
  Clock,
  Users,
  Star,
  Camera,
  Plus,
  Edit,
  Trash2,
  Save,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  Percent
} from '@/lib/lucide-icons';
import { motion, AnimatePresence } from 'framer-motion';
import MediaUpload from '@/components/admin/MediaUpload';

import { Ticket } from '@/hooks/useWebsiteData';

interface TicketData extends Partial<Ticket> {
  id?: number;
  title: string;
  description: string;
  location: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  duration: string;
  ageGroup: string;
  capacity?: number;
  category: string;
  rating: number;
  is_featured: boolean;
  is_active: boolean;
  features: string[];
  images: string[];
  status?: 'active' | 'inactive';
  metadata?: {
    location?: string;
    price?: number;
    originalPrice?: number;
    discount?: number;
    duration?: string;
    ageGroup?: string;
    category?: string;
    rating?: number;
  };
}

interface TicketManagementProps {
  tickets: TicketData[];
  onCreate: (ticket: Omit<TicketData, 'id'>) => Promise<void>;
  onUpdate: (id: number, ticket: Partial<TicketData>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  loading?: boolean;
}

const CATEGORY_OPTIONS = [
  { value: 'park', label: 'Parque Aquático', icon: '🏊' },
  { value: 'theme-park', label: 'Parque Temático', icon: '🎢' },
  { value: 'adventure', label: 'Aventura', icon: '🏔️' },
  { value: 'nature', label: 'Natureza', icon: '🌿' },
  { value: 'culture', label: 'Cultura', icon: '🏛️' },
  { value: 'entertainment', label: 'Entretenimento', icon: '🎭' },
  { value: 'sports', label: 'Esportes', icon: '⚽' },
  { value: 'wellness', label: 'Bem-estar', icon: '🧘' },
  { value: 'family', label: 'Família', icon: '👨‍👩‍👧‍👦' }
];

const AGE_GROUP_OPTIONS = [
  { value: 'all', label: 'Todas as Idades' },
  { value: 'children', label: 'Crianças (0-12)' },
  { value: 'teen', label: 'Adolescentes (13-17)' },
  { value: 'adult', label: 'Adultos (18+)' },
  { value: 'senior', label: 'Idosos (60+)' }
];

const FEATURE_OPTIONS = [
  'Estacionamento Gratuito',
  'Wi-Fi Gratuito',
  'Área de Alimentação',
  'Loja de Souvenirs',
  'Acessibilidade',
  'Estacionamento Pago',
  'Guia Turístico',
  'Seguro Incluído',
  'Cancelamento Grátis',
  'Voucher Eletrônico'
];

export default function TicketManagement({
  tickets,
  onCreate,
  onUpdate,
  onDelete,
  loading = false
}: TicketManagementProps) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TicketData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deletePendingId, setDeletePendingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<TicketData>({
    title: '',
    description: '',
    location: '',
    price: 0,
    originalPrice: 0,
    discount: 0,
    duration: '',
    ageGroup: 'all',
    capacity: 0,
    category: 'park',
    rating: 0,
    is_featured: false,
    is_active: true,
    features: [],
    images: []
  });
  const [errors, setErrors] = useState<Partial<Record<keyof TicketData, string>>>({});

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      price: 0,
      originalPrice: 0,
      discount: 0,
      duration: '',
      ageGroup: 'all',
      capacity: 0,
      category: 'park',
      rating: 0,
      is_featured: false,
      is_active: true,
      features: [],
      images: []
    });
    setEditingTicket(null);
    setErrors({});
    setSubmitError(null);
  };

  const handleEdit = (ticket: TicketData) => {
    setEditingTicket(ticket);
    setFormData({
      title: ticket.title || '',
      description: ticket.description || '',
      location: ticket.location || '',
      price: ticket.price || 0,
      originalPrice: ticket.originalPrice || 0,
      discount: ticket.discount || 0,
      duration: ticket.duration || '',
      ageGroup: ticket.ageGroup || 'all',
      capacity: ticket.capacity || 0,
      category: ticket.category || 'park',
      rating: ticket.rating || 0,
      is_featured: ticket.is_featured || false,
      is_active: ticket.is_active !== undefined ? ticket.is_active : true,
      features: ticket.features || [],
      images: ticket.images || []
    });
    setIsDialogOpen(true);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TicketData, string>> = {};
    
    if (!formData.title.trim()) newErrors.title = 'Título é obrigatório';
    if (!formData.description.trim()) newErrors.description = 'Descrição é obrigatória';
    if (!formData.location.trim()) newErrors.location = 'Localização é obrigatória';
    if (formData.price <= 0) newErrors.price = 'Preço deve ser maior que zero';
    if (!formData.duration.trim()) newErrors.duration = 'Duração é obrigatória';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const ticketData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        price: formData.price,
        originalPrice: formData.originalPrice,
        discount: formData.discount,
        duration: formData.duration,
        ageGroup: formData.ageGroup,
        capacity: formData.capacity,
        category: formData.category,
        rating: formData.rating,
        is_featured: formData.is_featured,
        is_active: formData.is_active,
        features: formData.features,
        images: formData.images,
        metadata: {
          location: formData.location,
          price: formData.price,
          originalPrice: formData.originalPrice,
          discount: formData.discount,
          duration: formData.duration,
          ageGroup: formData.ageGroup,
          category: formData.category,
          rating: formData.rating
        }
      };

      if (editingTicket && editingTicket.id) {
        await onUpdate(editingTicket.id, ticketData);
      } else {
        await onCreate(ticketData);
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Erro ao salvar ingresso:', error);
      setSubmitError(error.message || 'Erro ao salvar ingresso. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este ingresso?')) {
      return;
    }

    setDeletePendingId(id);
    try {
      await onDelete(id);
    } catch (error) {
      console.error('Erro ao deletar ingresso:', error);
    } finally {
      setDeletePendingId(null);
    }
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const calculateDiscount = () => {
    if (formData.originalPrice && formData.originalPrice > formData.price) {
      const discount = Math.round(((formData.originalPrice - formData.price) / formData.originalPrice) * 100);
      setFormData(prev => ({ ...prev, discount }));
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TicketIcon className="w-6 h-6" />
            Gestão de Ingressos
          </h2>
          <p className="text-muted-foreground">
            Gerencie ingressos, preços e informações detalhadas
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="flex items-center gap-2" disabled={isSubmitting}>
              <Plus className="w-4 h-4" />
              Novo Ingresso
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <TicketIcon className="w-5 h-5" />
                {editingTicket ? 'Editar Ingresso' : 'Novo Ingresso'}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">Informe os dados principais e anexe fotos/vídeos.</p>
            </DialogHeader>

            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-800">{submitError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
                  <TabsTrigger value="pricing">Preços e Descontos</TabsTrigger>
                  <TabsTrigger value="media">Mídia</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Nome do ingresso/parque"
                        className={errors.title ? 'border-red-500' : ''}
                      />
                      {errors.title && (
                        <p className="text-sm text-red-500">{errors.title}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Localização *</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Cidade, Estado"
                        className={errors.location ? 'border-red-500' : ''}
                      />
                      {errors.location && (
                        <p className="text-sm text-red-500">{errors.location}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrição detalhada do ingresso"
                      rows={4}
                      className={errors.description ? 'border-red-500' : ''}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500">{errors.description}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Categoria *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORY_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.icon} {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Duração *</Label>
                      <Input
                        id="duration"
                        value={formData.duration}
                        onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                        placeholder="Ex: 1 dia, 2 horas"
                        className={errors.duration ? 'border-red-500' : ''}
                      />
                      {errors.duration && (
                        <p className="text-sm text-red-500">{errors.duration}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ageGroup">Faixa Etária *</Label>
                      <Select
                        value={formData.ageGroup}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, ageGroup: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {AGE_GROUP_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rating">Avaliação (0-5)</Label>
                      <Input
                        id="rating"
                        type="number"
                        value={formData.rating}
                        onChange={(e) => setFormData(prev => ({ ...prev, rating: Number(e.target.value) }))}
                        placeholder="0"
                        min="0"
                        max="5"
                        step="0.1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="capacity">Capacidade</Label>
                      <Input
                        id="capacity"
                        type="number"
                        value={formData.capacity}
                        onChange={(e) => setFormData(prev => ({ ...prev, capacity: Number(e.target.value) }))}
                        placeholder="0"
                        min="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Status</Label>
                      <div className="flex items-center space-x-4 pt-2">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={formData.is_active}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                          />
                          <Label>Ativo</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={formData.is_featured}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
                          />
                          <Label>Destaque</Label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Características</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {FEATURE_OPTIONS.map(feature => (
                        <motion.div
                          key={feature}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            type="button"
                            variant={formData.features.includes(feature) ? "default" : "outline"}
                            className="w-full justify-start"
                            onClick={() => handleFeatureToggle(feature)}
                          >
                            {formData.features.includes(feature) ? (
                              <CheckCircle className="w-4 h-4 mr-2" />
                            ) : (
                              <XCircle className="w-4 h-4 mr-2" />
                            )}
                            {feature}
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="pricing" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Preço Atual (R$) *</Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => {
                          const price = Number(e.target.value);
                          setFormData(prev => ({ ...prev, price }));
                          if (prev.originalPrice) {
                            calculateDiscount();
                          }
                        }}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className={errors.price ? 'border-red-500' : ''}
                      />
                      {errors.price && (
                        <p className="text-sm text-red-500">{errors.price}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="originalPrice">Preço Original (R$)</Label>
                      <Input
                        id="originalPrice"
                        type="number"
                        value={formData.originalPrice}
                        onChange={(e) => {
                          const originalPrice = Number(e.target.value);
                          setFormData(prev => ({ ...prev, originalPrice }));
                          if (originalPrice > formData.price) {
                            calculateDiscount();
                          }
                        }}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="discount">Desconto (%)</Label>
                      <Input
                        id="discount"
                        type="number"
                        value={formData.discount}
                        onChange={(e) => setFormData(prev => ({ ...prev, discount: Number(e.target.value) }))}
                        placeholder="0"
                        min="0"
                        max="100"
                        readOnly
                        className="bg-gray-50"
                      />
                      {formData.originalPrice && formData.originalPrice > formData.price && (
                        <p className="text-sm text-green-600">
                          Economia: {formatPrice(formData.originalPrice - formData.price)}
                        </p>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="media" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Fotos e Vídeos</Label>
                    <MediaUpload
                      onChange={(urls) => setFormData(prev => ({ ...prev, images: urls }))}
                      disabled={isSubmitting || isUploading}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <Separator />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading || isSubmitting}>
                  <Save className="w-4 h-4 mr-2" />
                  {loading || isSubmitting ? 'Salvando...' : 'Salvar Ingresso'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tickets List */}
      {loading && tickets.length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando ingressos...</p>
        </div>
      ) : tickets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <TicketIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum ingresso encontrado</h3>
            <p className="text-muted-foreground mb-4">Comece criando seu primeiro ingresso</p>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Ingresso
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {tickets.map((ticket) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{ticket.title}</CardTitle>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {ticket.location}
                        </div>
                      </div>
                      {ticket.is_featured && (
                        <Badge className="bg-yellow-500 text-white">⭐ Destaque</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {ticket.images && ticket.images.length > 0 && (
                      <div className="aspect-video relative overflow-hidden rounded-lg bg-gray-100">
                        <img
                          src={ticket.images[0]}
                          alt={ticket.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {ticket.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{ticket.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{ticket.ageGroup}</span>
                      </div>
                      {ticket.rating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span>{ticket.rating}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div>
                        {ticket.originalPrice && ticket.originalPrice > ticket.price ? (
                          <div>
                            <div className="text-sm text-muted-foreground line-through">
                              {formatPrice(ticket.originalPrice)}
                            </div>
                            <div className="text-lg font-bold text-green-600">
                              {formatPrice(ticket.price)}
                            </div>
                            {ticket.discount && (
                              <Badge className="bg-red-500 text-white mt-1">
                                -{ticket.discount}% OFF
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <div className="text-lg font-bold">
                            {formatPrice(ticket.price)}
                          </div>
                        )}
                      </div>
                      <Badge variant={ticket.is_active ? "default" : "secondary"}>
                        {ticket.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEdit(ticket)}
                        disabled={deletePendingId === ticket.id}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => ticket.id && handleDelete(ticket.id)}
                        disabled={deletePendingId === ticket.id || loading}
                      >
                        {deletePendingId === ticket.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

