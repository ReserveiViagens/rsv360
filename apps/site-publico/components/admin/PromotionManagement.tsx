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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Percent,
  Calendar as CalendarIcon,
  Clock,
  Target,
  Users,
  Gift,
  Plus,
  Edit,
  Trash2,
  Save,
  AlertCircle,
  CheckCircle,
  XCircle
} from '@/lib/lucide-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import MediaUpload from '@/components/admin/MediaUpload';
import { Promotion } from '@/hooks/useWebsiteData';

interface PromotionData extends Partial<Promotion> {
  id?: number;
  title: string;
  description: string;
  discount_percentage: number;
  start_date: string;
  end_date: string;
  target_audience: string;
  max_uses?: number;
  current_uses?: number;
  status: 'active' | 'inactive' | 'draft' | 'expired';
  conditions?: string;
  metadata?: {
    discount_percentage?: number;
    start_date?: string;
    end_date?: string;
    target_audience?: string;
    media?: string[]; // Added for media URLs
  };
}

interface PromotionManagementProps {
  promotions: PromotionData[];
  onCreate: (promotion: Omit<PromotionData, 'id'>) => Promise<void>;
  onUpdate: (id: number, promotion: Partial<PromotionData>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  loading?: boolean;
}

const TARGET_AUDIENCE_OPTIONS = [
  { value: 'all', label: 'Todos os Clientes' },
  { value: 'new', label: 'Novos Clientes' },
  { value: 'returning', label: 'Clientes Frequentes' },
  { value: 'vip', label: 'Clientes VIP' },
  { value: 'family', label: 'Famílias' },
  { value: 'couples', label: 'Casal' },
  { value: 'business', label: 'Executivos' }
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Ativa', color: 'bg-green-500', icon: CheckCircle },
  { value: 'inactive', label: 'Inativa', color: 'bg-red-500', icon: XCircle },
  { value: 'draft', label: 'Rascunho', color: 'bg-yellow-500', icon: AlertCircle },
  { value: 'expired', label: 'Expirada', color: 'bg-gray-500', icon: Clock }
];

export default function PromotionManagement({
  promotions,
  onCreate,
  onUpdate,
  onDelete,
  loading = false
}: PromotionManagementProps) {
  const isValidDateStr = (value?: string) => {
    if (!value) return false;
    const d = new Date(value);
    return !isNaN(d.getTime());
  };

  const formatDateSafe = (value?: string, fmt: string = 'dd/MM/yyyy') => {
    if (!isValidDateStr(value)) return '—';
    try {
      return format(new Date(value as string), fmt, { locale: ptBR });
    } catch {
      return '—';
    }
  };
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<PromotionData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deletePendingId, setDeletePendingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<PromotionData>({
    title: '',
    description: '',
    discount_percentage: 0,
    discount: 0,
    start_date: '',
    end_date: '',
    validUntil: '',
    target_audience: 'all',
    max_uses: undefined,
    current_uses: 0,
    status: 'draft',
    conditions: '',
    images: []
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }
    const discount = formData.discount_percentage || formData.discount || 0;
    if (discount <= 0 || discount > 100) {
      newErrors.discount_percentage = 'Desconto deve estar entre 1% e 100%';
    }
    if (!formData.start_date && !formData.validUntil) {
      newErrors.start_date = 'Data de início ou validade é obrigatória';
    }
    if (formData.start_date && formData.end_date && formData.start_date >= formData.end_date) {
      newErrors.end_date = 'Data de fim deve ser posterior à data de início';
    }
    if (formData.max_uses && formData.max_uses <= 0) {
      newErrors.max_uses = 'Limite de usos deve ser maior que zero';
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
      
      // Preparar dados para envio
      const promotionData = {
        title: formData.title,
        description: formData.description,
        discount: formData.discount_percentage || formData.discount || 0,
        validUntil: formData.end_date || formData.validUntil || '',
        status: formData.status || 'active',
        metadata: {
          ...formData.metadata,
          discount_percentage: formData.discount_percentage || formData.discount || 0,
          discount: formData.discount_percentage || formData.discount || 0,
          start_date: formData.start_date,
          end_date: formData.end_date,
          validUntil: formData.end_date || formData.validUntil,
          target_audience: formData.target_audience,
          max_uses: formData.max_uses,
          current_uses: formData.current_uses,
          conditions: formData.conditions,
          images: formData.images || formData.metadata?.images || formData.metadata?.media || []
        }
      };

      if (editingPromotion && editingPromotion.id) {
        await onUpdate(editingPromotion.id, promotionData);
      } else {
        await onCreate(promotionData);
      }

      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Erro ao salvar promoção:', error);
      setSubmitError('Erro ao salvar promoção. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      discount_percentage: 0,
      discount: 0,
      start_date: '',
      end_date: '',
      validUntil: '',
      target_audience: 'all',
      max_uses: undefined,
      current_uses: 0,
      status: 'draft',
      conditions: '',
      images: []
    });
    setEditingPromotion(null);
    setErrors({});
  };

  const handleEdit = (promotion: PromotionData) => {
    setEditingPromotion(promotion);
    setFormData({
      title: promotion.title || '',
      description: promotion.description || '',
      discount_percentage: promotion.discount_percentage || promotion.discount || promotion.metadata?.discount_percentage || promotion.metadata?.discount || 0,
      discount: promotion.discount || promotion.discount_percentage || promotion.metadata?.discount || promotion.metadata?.discount_percentage || 0,
      start_date: promotion.start_date || promotion.metadata?.start_date || '',
      end_date: promotion.end_date || promotion.metadata?.end_date || '',
      validUntil: promotion.validUntil || promotion.end_date || promotion.metadata?.validUntil || promotion.metadata?.end_date || '',
      target_audience: promotion.target_audience || promotion.metadata?.target_audience || 'all',
      max_uses: promotion.max_uses || promotion.metadata?.max_uses,
      current_uses: promotion.current_uses || promotion.metadata?.current_uses || 0,
      status: promotion.status || 'active',
      conditions: promotion.conditions || promotion.metadata?.conditions || '',
      images: promotion.images || promotion.metadata?.images || promotion.metadata?.media || [],
      metadata: promotion.metadata // Preserve existing metadata
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja deletar esta promoção?')) {
      try {
        setDeletePendingId(id);
        await onDelete(id);
      } catch (error) {
        console.error('Erro ao deletar promoção:', error);
      } finally {
        setDeletePendingId(null);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusOption = STATUS_OPTIONS.find(s => s.value === status);
    const IconComponent = statusOption?.icon || AlertCircle;
    return (
      <Badge className={`${statusOption?.color} text-white flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {statusOption?.label}
      </Badge>
    );
  };

  const getTargetAudienceLabel = (audience: string) => {
    const option = TARGET_AUDIENCE_OPTIONS.find(a => a.value === audience);
    return option?.label || audience;
  };

  const isPromotionActive = (promotion: PromotionData) => {
    if (!isValidDateStr(promotion.start_date) || !isValidDateStr(promotion.end_date)) return false;
    const now = new Date();
    const startDate = new Date(promotion.start_date);
    const endDate = new Date(promotion.end_date);
    return now >= startDate && now <= endDate && promotion.status === 'active';
  };

  const getDaysRemaining = (endDate: string) => {
    if (!isValidDateStr(endDate)) return 0;
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Percent className="w-6 h-6" />
            Gestão de Promoções
          </h2>
          <p className="text-muted-foreground">
            Gerencie promoções, descontos e campanhas especiais
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="flex items-center gap-2" disabled={isSubmitting}>
              <Plus className="w-4 h-4" />
              Nova Promoção
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Percent className="w-5 h-5" />
                {editingPromotion ? 'Editar Promoção' : 'Nova Promoção'}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">Defina os detalhes e adicione mídia opcional.</p>
            </DialogHeader>

            {submitError && (
              <div className="p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
                  <TabsTrigger value="schedule">Cronograma e Limites</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título da Promoção *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ex: Black Friday 2025"
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
                      placeholder="Descrição detalhada da promoção"
                      rows={4}
                      className={errors.description ? 'border-red-500' : ''}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500">{errors.description}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="discount_percentage">Desconto (%) *</Label>
                      <Input
                        id="discount_percentage"
                        type="number"
                        value={formData.discount_percentage || formData.discount || 0}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          setFormData(prev => ({ 
                            ...prev, 
                            discount_percentage: value,
                            discount: value
                          }));
                        }}
                        placeholder="0"
                        min="1"
                        max="100"
                        className={errors.discount_percentage ? 'border-red-500' : ''}
                      />
                      {errors.discount_percentage && (
                        <p className="text-sm text-red-500">{errors.discount_percentage}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="target_audience">Público-Alvo</Label>
                      <Select
                        value={formData.target_audience}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, target_audience: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TARGET_AUDIENCE_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="conditions">Condições Especiais</Label>
                    <Textarea
                      id="conditions"
                      value={formData.conditions}
                      onChange={(e) => setFormData(prev => ({ ...prev, conditions: e.target.value }))}
                      placeholder="Condições especiais, restrições, etc."
                      rows={3}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="schedule" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Data de Início *</Label>
                      <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`w-full justify-start text-left font-normal ${errors.start_date ? 'border-red-500' : ''}`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.start_date ? format(new Date(formData.start_date), 'dd/MM/yyyy', { locale: ptBR }) : 'Selecionar data'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.start_date ? new Date(formData.start_date) : undefined}
                            onSelect={(date) => {
                              if (date) {
                                setFormData(prev => ({ ...prev, start_date: date.toISOString().split('T')[0] }));
                                setStartDateOpen(false);
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {errors.start_date && (
                        <p className="text-sm text-red-500">{errors.start_date}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Data de Fim *</Label>
                      <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`w-full justify-start text-left font-normal ${errors.end_date ? 'border-red-500' : ''}`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.end_date ? format(new Date(formData.end_date), 'dd/MM/yyyy', { locale: ptBR }) : 'Selecionar data'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.end_date ? new Date(formData.end_date) : undefined}
                            onSelect={(date) => {
                              if (date) {
                                setFormData(prev => ({ ...prev, end_date: date.toISOString().split('T')[0] }));
                                setEndDateOpen(false);
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {errors.end_date && (
                        <p className="text-sm text-red-500">{errors.end_date}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="max_uses">Limite de Usos (opcional)</Label>
                      <Input
                        id="max_uses"
                        type="number"
                        value={formData.max_uses || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, max_uses: e.target.value ? Number(e.target.value) : undefined }))}
                        placeholder="Ex: 100"
                        min="1"
                        className={errors.max_uses ? 'border-red-500' : ''}
                      />
                      {errors.max_uses && (
                        <p className="text-sm text-red-500">{errors.max_uses}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <Separator />

              {/* Media (Fotos e Vídeos) */}
              <div className="space-y-2">
                <Label>Fotos e Vídeos</Label>
                <MediaUpload
                  onChange={(urls) => setFormData(prev => ({ 
                    ...prev, 
                    images: urls,
                    metadata: { 
                      ...(prev.metadata || {}), 
                      media: urls,
                      images: urls
                    } 
                  }))}
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
                  {loading || isSubmitting ? 'Salvando...' : 'Salvar Promoção'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Promotions List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {promotions.map((promotion) => {
            const isActive = isPromotionActive(promotion);
            const daysRemaining = getDaysRemaining(promotion.end_date);

            return (
              <motion.div
                key={promotion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card className={`h-full ${isActive ? 'ring-2 ring-green-500' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{promotion.title}</CardTitle>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Target className="w-3 h-3" />
                          {getTargetAudienceLabel(promotion.target_audience)}
                        </div>
                      </div>
                      {getStatusBadge(promotion.status)}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {promotion.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Percent className="w-4 h-4 text-green-600" />
                        <span className="text-lg font-bold text-green-600">
                          {(promotion.discount_percentage || promotion.discount || promotion.metadata?.discount_percentage || promotion.metadata?.discount || 0)}% OFF
                        </span>
                      </div>
                      {isActive && (
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {daysRemaining > 0 ? `${daysRemaining} dias` : 'Último dia'}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Período:</span>
                        <span className="font-medium">
                          {formatDateSafe(promotion.start_date, 'dd/MM')} - {formatDateSafe(promotion.end_date, 'dd/MM/yyyy')}
                        </span>
                      </div>

                      {promotion.max_uses && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Usos:</span>
                          <span className="font-medium">
                            {promotion.current_uses || 0} / {promotion.max_uses}
                          </span>
                        </div>
                      )}
                    </div>

                    {promotion.conditions && (
                      <div className="p-2 bg-muted rounded text-xs text-muted-foreground">
                        <strong>Condições:</strong> {promotion.conditions}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(promotion)}
                        className="flex-1"
                        disabled={isSubmitting || deletePendingId === promotion.id}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(promotion.id!)}
                        className="flex-1"
                        disabled={isSubmitting || deletePendingId === promotion.id}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        {deletePendingId === promotion.id ? 'Deletando...' : 'Deletar'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {promotions.length === 0 && !loading && (
        <div className="text-center py-12">
          <Percent className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhuma promoção encontrada</h3>
          <p className="text-muted-foreground mb-4">
            Comece criando sua primeira promoção
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Criar Primeira Promoção
          </Button>
        </div>
      )}
    </div>
  );
}
