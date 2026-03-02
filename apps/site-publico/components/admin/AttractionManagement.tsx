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
  Navigation
} from '@/lib/lucide-icons';
import { motion, AnimatePresence } from 'framer-motion';
import MediaUpload from '@/components/admin/MediaUpload';

interface AttractionData {
  id?: number;
  title: string;
  description: string;
  location: string;
  price: number;
  duration: string;
  capacity: number;
  category: string;
  rating: number;
  is_featured: boolean;
  is_active: boolean;
  opening_hours: string;
  contact_info: string;
  images: string[];
  metadata?: {
    location?: string;
    price?: number;
    duration?: string;
    capacity?: number;
    category?: string;
    rating?: number;
  };
}

interface AttractionManagementProps {
  attractions: AttractionData[];
  onCreate: (attraction: Omit<AttractionData, 'id'>) => Promise<void>;
  onUpdate: (id: number, attraction: Partial<AttractionData>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  loading?: boolean;
}

const CATEGORY_OPTIONS = [
  { value: 'nature', label: 'Natureza', icon: '🌿' },
  { value: 'adventure', label: 'Aventura', icon: '🏔️' },
  { value: 'culture', label: 'Cultura', icon: '🏛️' },
  { value: 'entertainment', label: 'Entretenimento', icon: '🎭' },
  { value: 'sports', label: 'Esportes', icon: '⚽' },
  { value: 'gastronomy', label: 'Gastronomia', icon: '🍽️' },
  { value: 'shopping', label: 'Compras', icon: '🛍️' },
  { value: 'wellness', label: 'Bem-estar', icon: '🧘' },
  { value: 'family', label: 'Família', icon: '👨‍👩‍👧‍👦' },
  { value: 'romantic', label: 'Romântico', icon: '💕' }
];

const DURATION_OPTIONS = [
  { value: '30min', label: '30 minutos' },
  { value: '1h', label: '1 hora' },
  { value: '2h', label: '2 horas' },
  { value: '3h', label: '3 horas' },
  { value: '4h', label: '4 horas' },
  { value: '6h', label: '6 horas' },
  { value: '8h', label: '8 horas' },
  { value: 'full-day', label: 'Dia inteiro' },
  { value: 'multi-day', label: 'Múltiplos dias' }
];

export default function AttractionManagement({
  attractions,
  onCreate,
  onUpdate,
  onDelete,
  loading = false
}: AttractionManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAttraction, setEditingAttraction] = useState<AttractionData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deletePendingId, setDeletePendingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<AttractionData>({
    title: '',
    description: '',
    location: '',
    price: 0,
    duration: '2h',
    capacity: 0,
    category: 'nature',
    rating: 0,
    is_featured: false,
    is_active: true,
    opening_hours: '',
    contact_info: '',
    images: []
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Localização é obrigatória';
    }
    if (formData.price < 0) {
      newErrors.price = 'Preço não pode ser negativo';
    }
    if (formData.capacity <= 0) {
      newErrors.capacity = 'Capacidade deve ser maior que zero';
    }
    if (formData.rating < 0 || formData.rating > 5) {
      newErrors.rating = 'Avaliação deve estar entre 0 e 5';
    }
    if (!formData.opening_hours.trim()) {
      newErrors.opening_hours = 'Horário de funcionamento é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitError(null);
      setIsSubmitting(true);
      if (editingAttraction) {
        await onUpdate(editingAttraction.id!, formData);
      } else {
        await onCreate(formData);
      }

      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Erro ao salvar atração:', error);
      setSubmitError('Erro ao salvar atração. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      price: 0,
      duration: '2h',
      capacity: 0,
      category: 'nature',
      rating: 0,
      is_featured: false,
      is_active: true,
      opening_hours: '',
      contact_info: '',
      images: []
    });
    setEditingAttraction(null);
    setErrors({});
  };

  const handleEdit = (attraction: AttractionData) => {
    setEditingAttraction(attraction);
    setFormData({
      title: attraction.title,
      description: attraction.description,
      location: attraction.location,
      price: attraction.price,
      duration: attraction.duration,
      capacity: attraction.capacity,
      category: attraction.category,
      rating: attraction.rating,
      is_featured: attraction.is_featured,
      is_active: attraction.is_active,
      opening_hours: attraction.opening_hours,
      contact_info: attraction.contact_info,
      images: attraction.images
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja deletar esta atração?')) {
      try {
        setDeletePendingId(id);
        await onDelete(id);
      } catch (error) {
        console.error('Erro ao deletar atração:', error);
      } finally {
        setDeletePendingId(null);
      }
    }
  };

  const getCategoryInfo = (category: string) => {
    const categoryOption = CATEGORY_OPTIONS.find(c => c.value === category);
    return categoryOption || { value: category, label: category, icon: '📍' };
  };

  const getDurationLabel = (duration: string) => {
    const durationOption = DURATION_OPTIONS.find(d => d.value === duration);
    return durationOption?.label || duration;
  };

  const getStatusBadge = (isActive: boolean, isFeatured: boolean) => {
    if (isFeatured) {
      return <Badge className="bg-purple-500 text-white">⭐ Destaque</Badge>;
    }
    return isActive ? (
      <Badge className="bg-green-500 text-white">Ativa</Badge>
    ) : (
      <Badge className="bg-red-500 text-white">Inativa</Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="w-6 h-6" />
            Gestão de Atrações
          </h2>
          <p className="text-muted-foreground">
            Gerencie atrações turísticas, atividades e pontos de interesse
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="flex items-center gap-2" disabled={isSubmitting}>
              <Plus className="w-4 h-4" />
              Nova Atração
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {editingAttraction ? 'Editar Atração' : 'Nova Atração'}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">Informe os dados principais e anexe fotos/vídeos.</p>
            </DialogHeader>

            {submitError && (
              <div className="p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
                  <TabsTrigger value="details">Detalhes</TabsTrigger>
                  <TabsTrigger value="settings">Configurações</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Nome da atração"
                      className={errors.title ? 'border-red-500' : ''}
                    />
                    {errors.title && (
                      <p className="text-sm text-red-500">{errors.title}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrição detalhada da atração"
                      rows={4}
                      className={errors.description ? 'border-red-500' : ''}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500">{errors.description}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Localização *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Endereço ou localização"
                      className={errors.location ? 'border-red-500' : ''}
                    />
                    {errors.location && (
                      <p className="text-sm text-red-500">{errors.location}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Categoria</Label>
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
                              <span className="flex items-center gap-2">
                                <span>{option.icon}</span>
                                {option.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Duração</Label>
                      <Select
                        value={formData.duration}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DURATION_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Preço (R$) *</Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
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
                      <Label htmlFor="capacity">Capacidade *</Label>
                      <Input
                        id="capacity"
                        type="number"
                        value={formData.capacity}
                        onChange={(e) => setFormData(prev => ({ ...prev, capacity: Number(e.target.value) }))}
                        placeholder="0"
                        min="1"
                        className={errors.capacity ? 'border-red-500' : ''}
                      />
                      {errors.capacity && (
                        <p className="text-sm text-red-500">{errors.capacity}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rating">Avaliação (0-5) *</Label>
                      <Input
                        id="rating"
                        type="number"
                        value={formData.rating}
                        onChange={(e) => setFormData(prev => ({ ...prev, rating: Number(e.target.value) }))}
                        placeholder="0"
                        min="0"
                        max="5"
                        step="0.1"
                        className={errors.rating ? 'border-red-500' : ''}
                      />
                      {errors.rating && (
                        <p className="text-sm text-red-500">{errors.rating}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="opening_hours">Horário de Funcionamento *</Label>
                    <Input
                      id="opening_hours"
                      value={formData.opening_hours}
                      onChange={(e) => setFormData(prev => ({ ...prev, opening_hours: e.target.value }))}
                      placeholder="Ex: Segunda a Sexta: 8h às 18h"
                      className={errors.opening_hours ? 'border-red-500' : ''}
                    />
                    {errors.opening_hours && (
                      <p className="text-sm text-red-500">{errors.opening_hours}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_info">Informações de Contato</Label>
                    <Input
                      id="contact_info"
                      value={formData.contact_info}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact_info: e.target.value }))}
                      placeholder="Telefone, email, site, etc."
                    />
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="is_featured">Atração em Destaque</Label>
                        <p className="text-sm text-muted-foreground">
                          Marque para destacar esta atração na página principal
                        </p>
                      </div>
                      <Switch
                        id="is_featured"
                        checked={formData.is_featured}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="is_active">Ativa</Label>
                        <p className="text-sm text-muted-foreground">
                          Atrações inativas não aparecem no site público
                        </p>
                      </div>
                      <Switch
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <Separator />

              <div className="space-y-2">
                <Label>Fotos e Vídeos</Label>
                <MediaUpload
                  onChange={(urls) => setFormData(prev => ({ ...prev, images: urls }))}
                  disabled={isSubmitting}
                />
              </div>

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
                  {loading || isSubmitting ? 'Salvando...' : 'Salvar Atração'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Attractions List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {attractions.map((attraction) => {
            const categoryInfo = getCategoryInfo(attraction.category);

            return (
              <motion.div
                key={attraction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card className={`h-full ${attraction.is_featured ? 'ring-2 ring-purple-500' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <span>{categoryInfo.icon}</span>
                          {attraction.title}
                        </CardTitle>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Navigation className="w-3 h-3" />
                          {attraction.location}
                        </div>
                      </div>
                      {getStatusBadge(attraction.is_active, attraction.is_featured)}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {attraction.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-green-600" />
                        <span className="font-medium">{`R$ ${(
                          typeof attraction.price === 'number'
                            ? attraction.price
                            : Number(attraction.metadata?.price ?? 0)
                        ).toFixed(2)}`}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-blue-600" />
                        <span>{getDurationLabel(attraction.duration)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-purple-600" />
                        <span>{attraction.capacity} pessoas</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{attraction.rating}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Categoria:</span>
                        <Badge variant="secondary">{categoryInfo.label}</Badge>
                      </div>

                      {attraction.opening_hours && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Horário:</span>
                          <span className="font-medium text-xs">{attraction.opening_hours}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(attraction)}
                        className="flex-1"
                        disabled={isSubmitting || deletePendingId === attraction.id}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(attraction.id!)}
                        className="flex-1"
                        disabled={isSubmitting || deletePendingId === attraction.id}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        {deletePendingId === attraction.id ? 'Deletando...' : 'Deletar'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {attractions.length === 0 && !loading && (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhuma atração encontrada</h3>
          <p className="text-muted-foreground mb-4">
            Comece criando sua primeira atração
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Criar Primeira Atração
          </Button>
        </div>
      )}
    </div>
  );
}
