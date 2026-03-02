'use client';

import React, { useState, useRef } from 'react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Hotel,
  MapPin,
  Star,
  Wifi,
  Car,
  Utensils,
  Dumbbell,
  Waves,
  Camera,
  Upload,
  X,
  Plus,
  Edit,
  Trash2,
  Eye,
  Save,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Download,
  ImageIcon,
  Video
} from '@/lib/lucide-icons';
import { motion, AnimatePresence } from 'framer-motion';
import MediaUpload from '@/components/admin/MediaUpload';
import { HotelVideoManager } from './HotelVideoManager';
import { HotelReviewsManager } from './HotelReviewsManager';
import { HotelLocationManager } from './HotelLocationManager';
import { HotelSpecificInfoManager } from './HotelSpecificInfoManager';
import { HotelBenefitsManager } from './HotelBenefitsManager';
import { HotelWhyChooseManager } from './HotelWhyChooseManager';

interface HotelData {
  id?: number;
  title: string;
  description: string;
  location: string;
  price: number;
  originalPrice?: number;
  rating: number;
  maxGuests?: number;
  distanceFromCenter?: number;
  reviewCount?: number;
  features?: string[];
  amenities: string[];
  images: string[];
  status: 'active' | 'inactive' | 'draft';
  metadata?: {
    location?: string;
    price?: number;
    originalPrice?: number;
    rating?: number;
    stars?: number;
    amenities?: string[];
    features?: string[];
    capacity?: string;
    maxGuests?: number;
    distanceFromCenter?: number;
    reviewCount?: number;
    discount?: number;
  };
}

interface HotelManagementProps {
  hotels: HotelData[];
  onCreate: (hotel: Omit<HotelData, 'id'>) => Promise<void>;
  onUpdate: (id: number, hotel: Partial<HotelData>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onRefresh?: () => Promise<void>;
  loading?: boolean;
}

const AMENITIES_OPTIONS = [
  { value: 'wifi', label: 'Wi-Fi Gratuito', icon: Wifi },
  { value: 'parking', label: 'Estacionamento', icon: Car },
  { value: 'restaurant', label: 'Restaurante', icon: Utensils },
  { value: 'gym', label: 'Academia', icon: Dumbbell },
  { value: 'pool', label: 'Piscina', icon: Waves },
  { value: 'spa', label: 'Spa', icon: Waves },
  { value: 'bar', label: 'Bar', icon: Utensils },
  { value: 'room-service', label: 'Serviço de Quarto', icon: Utensils },
  { value: 'concierge', label: 'Concierge', icon: Hotel },
  { value: 'business-center', label: 'Centro de Negócios', icon: Hotel }
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Ativo', color: 'bg-green-500' },
  { value: 'inactive', label: 'Inativo', color: 'bg-red-500' },
  { value: 'draft', label: 'Rascunho', color: 'bg-yellow-500' }
];

export default function HotelManagement({
  hotels,
  onCreate,
  onUpdate,
  onDelete,
  onRefresh,
  loading = false
}: HotelManagementProps) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<HotelData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [deletePendingId, setDeletePendingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<HotelData>({
    title: '',
    description: '',
    location: '',
    price: 0,
    originalPrice: 0,
    rating: 0,
    maxGuests: 4,
    distanceFromCenter: 0,
    reviewCount: 0,
    features: [],
    amenities: [],
    images: [],
    status: 'draft'
  });
  const [videoData, setVideoData] = useState<{ videoUrl?: string; youtubeId?: string }>({});
  const [reviews, setReviews] = useState<any[]>([]);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | undefined>();
  const [specificInfo, setSpecificInfo] = useState<{ highlights?: string[]; specialBenefits?: string[] }>({});
  const [benefits, setBenefits] = useState<any[]>([]);
  const [whyChooseReasons, setWhyChooseReasons] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estados para importação de mídias existentes
  const [availableMedia, setAvailableMedia] = useState<Array<{url: string, type: 'image' | 'video', hotelTitle?: string}>>([]);
  const [selectedMedia, setSelectedMedia] = useState<Set<string>>(new Set());
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [showMediaImport, setShowMediaImport] = useState(false);

  // Função para obter token de autenticação
  const getAuthToken = () => {
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('admin_token='));
    if (tokenCookie) {
      const token = tokenCookie.split('=')[1];
      if (token) return `Bearer ${token}`;
    }
    const tokenFromStorage = localStorage.getItem('admin_token');
    return tokenFromStorage ? `Bearer ${tokenFromStorage}` : 'Bearer admin-token-123';
  };

  // Carregar todas as mídias dos hotéis existentes
  const loadAvailableMedia = async () => {
    try {
      setLoadingMedia(true);
      const response = await fetch(`${API_BASE_URL}/api/admin/website/content/hotels/items`, {
        headers: {
          Authorization: getAuthToken(),
        },
      });
      
      if (!response.ok) {
        throw new Error("Erro ao carregar mídias");
      }
      
      const result = await response.json();
      if (result.success && result.data) {
        const allMedia: Array<{url: string, type: 'image' | 'video', hotelTitle?: string}> = [];
        
        // Função auxiliar para detectar tipo de mídia
        const detectMediaType = (url: string): 'image' | 'video' => {
          if (!url) return 'image';
          
          // Verificar extensão no final da URL (mais confiável)
          const urlWithoutQuery = url.split('?')[0].toLowerCase();
          const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.flv', '.wmv'];
          const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico'];
          
          // Verificar extensão de vídeo
          if (videoExtensions.some(ext => urlWithoutQuery.endsWith(ext))) {
            return 'video';
          }
          
          // Verificar extensão de imagem
          if (imageExtensions.some(ext => urlWithoutQuery.endsWith(ext))) {
            return 'image';
          }
          
          // Verificar plataformas de vídeo
          if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com')) {
            return 'video';
          }
          
          // Verificar extensão geral (menos confiável)
          const match = url.match(/\.([a-z0-9]+)(?:\?|$)/i);
          if (match) {
            const ext = match[1].toLowerCase();
            if (videoExtensions.some(vExt => vExt.includes(ext))) return 'video';
            if (imageExtensions.some(iExt => iExt.includes(ext))) return 'image';
          }
          
          // Padrão: assumir imagem
          return 'image';
        };
        
        result.data.forEach((hotel: any) => {
          // Adicionar imagens
          if (hotel.images && Array.isArray(hotel.images)) {
            hotel.images.forEach((img: string) => {
              if (img && !allMedia.find(m => m.url === img)) {
                allMedia.push({
                  url: img,
                  type: detectMediaType(img),
                  hotelTitle: hotel.title
                });
              }
            });
          }
          
          // Adicionar vídeos
          if (hotel.videos && Array.isArray(hotel.videos)) {
            hotel.videos.forEach((vid: string) => {
              if (vid && !allMedia.find(m => m.url === vid)) {
                allMedia.push({
                  url: vid,
                  type: 'video',
                  hotelTitle: hotel.title
                });
              }
            });
          }
        });
        
        setAvailableMedia(allMedia);
        console.log(`✅ ${allMedia.length} mídias carregadas (${allMedia.filter(m => m.type === 'image').length} imagens, ${allMedia.filter(m => m.type === 'video').length} vídeos)`);
      }
    } catch (err: any) {
      console.error("Erro ao carregar mídias:", err);
      setSubmitError(err.message || "Erro ao carregar mídias disponíveis");
    } finally {
      setLoadingMedia(false);
    }
  };

  // Importar mídias selecionadas
  const handleImportSelectedMedia = () => {
    if (selectedMedia.size === 0) {
      setSubmitError("Selecione pelo menos uma mídia para importar");
      return;
    }
    
    const selectedUrls = Array.from(selectedMedia);
    const newImages = [...formData.images];
    
    selectedUrls.forEach(url => {
      const media = availableMedia.find(m => m.url === url);
      if (media && !newImages.includes(url)) {
        newImages.push(url);
      }
    });
    
    setFormData(prev => ({ ...prev, images: newImages }));
    setImagePreview(newImages);
    setSelectedMedia(new Set());
    setShowMediaImport(false);
    setSubmitSuccess(`${selectedMedia.size} mídia(s) importada(s) com sucesso!`);
    setTimeout(() => setSubmitSuccess(null), 3000);
  };

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
    if (formData.price <= 0) {
      newErrors.price = 'Preço deve ser maior que zero';
    }
    const originalPriceValue = Number(formData.originalPrice ?? 0);
    if (originalPriceValue < 0) {
      newErrors.originalPrice = 'Preço original não pode ser negativo';
    } else if (originalPriceValue > 0 && originalPriceValue < formData.price) {
      newErrors.originalPrice = 'Preço original deve ser maior ou igual ao preço atual';
    }
    if (formData.rating < 0 || formData.rating > 5) {
      newErrors.rating = 'Avaliação deve estar entre 0 e 5';
    }
    if ((formData.maxGuests ?? 0) <= 0) {
      newErrors.maxGuests = 'Capacidade deve ser maior que zero';
    }
    if ((formData.distanceFromCenter ?? 0) < 0) {
      newErrors.distanceFromCenter = 'Distância não pode ser negativa';
    }
    if ((formData.reviewCount ?? 0) < 0) {
      newErrors.reviewCount = 'Total de avaliações não pode ser negativo';
    }
    if (formData.amenities.length === 0 && (!formData.features || formData.features.length === 0)) {
      newErrors.amenities = 'Informe ao menos uma comodidade ou destaque';
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
      setSubmitSuccess(null);
      setIsSubmitting(true);
      
      // Preparar dados completos incluindo novos campos
      const completeFormData = {
        ...formData,
        metadata: {
          ...formData.metadata,
          // Vídeo
          videoUrl: videoData.videoUrl,
          youtubeId: videoData.youtubeId,
          // Avaliações
          reviews: reviews,
          // Coordenadas
          coordinates: coordinates,
          // Informações específicas
          highlights: specificInfo.highlights,
          specialBenefits: specificInfo.specialBenefits,
          // Benefícios inclusos
          benefits: benefits,
          // Por que escolher
          whyChooseReasons: whyChooseReasons,
          // Dados existentes
          location: formData.location,
          price: formData.price,
          originalPrice: formData.originalPrice,
          stars: formData.rating,
          rating: formData.rating,
          features: formData.features,
          amenities: formData.amenities,
          maxGuests: formData.maxGuests,
          distanceFromCenter: formData.distanceFromCenter,
          reviewCount: reviews.length || formData.reviewCount,
        }
      };
      
      if (editingHotel) {
        await onUpdate(editingHotel.id!, completeFormData);
        setSubmitSuccess('✅ Alterações salvas com sucesso!');
        
        // Recarregar dados para garantir que a lista seja atualizada
        if (onRefresh) {
          await onRefresh();
        }
      } else {
        await onCreate(completeFormData);
        setSubmitSuccess('✅ Hotel criado com sucesso!');
        
        // Recarregar dados para garantir que a lista seja atualizada
        if (onRefresh) {
          await onRefresh();
        }
      }

      // Aguardar 1.5 segundos para mostrar mensagem de sucesso antes de fechar
      setTimeout(() => {
        resetForm();
        setIsDialogOpen(false);
        setSubmitSuccess(null);
      }, 1500);
    } catch (error) {
      console.error('Erro ao salvar hotel:', error);
      setSubmitError('Erro ao salvar hotel. Tente novamente.');
      setSubmitSuccess(null);
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
      originalPrice: 0,
      rating: 0,
      maxGuests: 4,
      distanceFromCenter: 0,
      reviewCount: 0,
      features: [],
      amenities: [],
      images: [],
      status: 'draft'
    });
    setEditingHotel(null);
    setErrors({});
    setImagePreview([]);
    setVideoData({});
    setReviews([]);
    setCoordinates(undefined);
    setSpecificInfo({});
    setBenefits([]);
    setWhyChooseReasons([]);
  };

  const handleEdit = (hotel: HotelData) => {
    setEditingHotel(hotel);

    const hotelAny = hotel as any;

    const price = hotel.price ?? hotelAny.metadata?.price ?? 0;
    const originalPrice =
      hotel.originalPrice ??
      hotelAny.metadata?.originalPrice ??
      hotelAny.metadata?.price ??
      price;
    const rating =
      hotel.rating ??
      hotelAny.metadata?.stars ??
      hotelAny.metadata?.rating ??
      0;
    const location =
      hotel.location ??
      hotelAny.metadata?.location ??
      '';
    const metadataFeatures: string[] = Array.isArray(hotelAny.metadata?.features)
      ? hotelAny.metadata.features
          .filter((feature: unknown): feature is string => typeof feature === 'string')
          .map((feature: string) => feature.trim())
          .filter(feature => feature.length > 0)
      : Array.isArray(hotelAny.features)
        ? hotelAny.features
            .filter((feature: unknown): feature is string => typeof feature === 'string')
            .map((feature: string) => feature.trim())
            .filter(feature => feature.length > 0)
        : [];

    const amenities =
      Array.isArray(hotel.amenities) && hotel.amenities.length > 0
        ? hotel.amenities
        : metadataFeatures
            .map((feature: string) => {
              const match = AMENITIES_OPTIONS.find(
                option =>
                  option.value === feature ||
                  option.label.toLowerCase() === feature?.toLowerCase()
              );
              return match?.value;
            })
            .filter(Boolean) as string[];

    const distanceFromCenter =
      typeof hotelAny.metadata?.distanceFromCenter === 'number'
        ? hotelAny.metadata.distanceFromCenter
        : Number(hotelAny.distanceFromCenter) || 0;

    const reviewCount =
      typeof hotelAny.metadata?.reviewCount === 'number'
        ? hotelAny.metadata.reviewCount
        : Number(hotelAny.reviewCount) || 0;

    const parsedMaxGuests =
      typeof hotelAny.metadata?.maxGuests === 'number'
        ? hotelAny.metadata.maxGuests
        : typeof hotelAny.maxGuests === 'number'
          ? hotelAny.maxGuests
          : parseInt(
              String(hotelAny.metadata?.capacity ?? '').replace(/\D/g, ''),
              10
            );

    const maxGuests =
      Number.isFinite(parsedMaxGuests) && parsedMaxGuests > 0
        ? parsedMaxGuests
        : 4;

    setFormData({
      title: hotel.title || '',
      description: hotel.description || '',
      location,
      price,
      originalPrice: Number(originalPrice) || 0,
      rating,
      maxGuests,
      distanceFromCenter: Number(distanceFromCenter) || 0,
      reviewCount: Number(reviewCount) || 0,
      features: metadataFeatures,
      amenities,
      images: hotel.images || [],
      status: hotel.status || 'draft',
    });
    setImagePreview(hotel.images || []);
    
    // Carregar novos dados do metadata
    const metadata = hotelAny.metadata || {};
    setVideoData({
      videoUrl: metadata.videoUrl,
      youtubeId: metadata.youtubeId
    });
    setReviews(Array.isArray(metadata.reviews) ? metadata.reviews : []);
    setCoordinates(metadata.coordinates || undefined);
    setSpecificInfo({
      highlights: Array.isArray(metadata.highlights) ? metadata.highlights : [],
      specialBenefits: Array.isArray(metadata.specialBenefits) ? metadata.specialBenefits : []
    });
    setBenefits(Array.isArray(metadata.benefits) ? metadata.benefits : []);
    setWhyChooseReasons(Array.isArray(metadata.whyChooseReasons) ? metadata.whyChooseReasons : []);
    
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja deletar este hotel?')) {
      try {
        setDeletePendingId(id);
        await onDelete(id);
      } catch (error) {
        console.error('Erro ao deletar hotel:', error);
      } finally {
        setDeletePendingId(null);
      }
    }
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const getHighlightLabels = (hotel: HotelData): string[] => {
    const hotelAny = hotel as any;
    const metadataFeatures: unknown = hotelAny.metadata?.features;

    if (Array.isArray(metadataFeatures) && metadataFeatures.length > 0) {
      return metadataFeatures
        .filter((feature: unknown): feature is string => typeof feature === 'string' && feature.trim().length > 0)
        .map(feature => feature.trim());
    }

    return (hotel.amenities ?? [])
      .map((amenity) => {
        const option = AMENITIES_OPTIONS.find(opt => opt.value === amenity);
        return option?.label;
      })
      .filter((label): label is string => Boolean(label));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const formDataUpload = new FormData();
    files.forEach((file) => formDataUpload.append('images', file));

    try {
      setIsUploading(true);
      const res = await fetch(`${API_BASE_URL}/api/upload/images`, {
        method: 'POST',
        headers: {
          Authorization: getAuthToken(),
        },
        body: formDataUpload,
      });
      if (!res.ok) throw new Error(`Upload falhou (${res.status})`);
      const json = await res.json();
      const urls: string[] = (json.images || []).map((img: any) => `${API_BASE_URL}${img.url}`);
      const thumbs: string[] = (json.images || []).map((img: any) => `${API_BASE_URL}${img.thumbnailUrl}`);

      setImagePreview((prev) => [...prev, ...thumbs]);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...urls],
      }));
    } catch (err) {
      console.error('Erro no upload:', err);
      setSubmitError('Falha no upload de imagem. Verifique o arquivo e tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImagePreview(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const getStatusBadge = (status: string) => {
    const statusOption = STATUS_OPTIONS.find(s => s.value === status);
    return (
      <Badge className={`${statusOption?.color} text-white`}>
        {statusOption?.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Hotel className="w-6 h-6" />
            Gestão de Hotéis
          </h2>
          <p className="text-muted-foreground">
            Gerencie hotéis, comodidades e informações detalhadas
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="flex items-center gap-2" disabled={isSubmitting}>
              <Plus className="w-4 h-4" />
              Novo Hotel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Hotel className="w-5 h-5" />
                {editingHotel ? 'Editar Hotel' : 'Novo Hotel'}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">Preencha os dados do hotel e adicione fotos/vídeos.</p>
            </DialogHeader>

            {submitError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            {submitSuccess && (
              <Alert className="bg-green-50 border-green-200 text-green-800">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="font-medium">{submitSuccess}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-9">
                  <TabsTrigger value="basic">Básicas</TabsTrigger>
                  <TabsTrigger value="amenities">Comodidades</TabsTrigger>
                  <TabsTrigger value="images">Imagens</TabsTrigger>
                  <TabsTrigger value="video">Vídeo</TabsTrigger>
                  <TabsTrigger value="reviews">Avaliações</TabsTrigger>
                  <TabsTrigger value="location">Localização</TabsTrigger>
                  <TabsTrigger value="benefits">Benefícios</TabsTrigger>
                  <TabsTrigger value="why-choose">Por que Escolher</TabsTrigger>
                  <TabsTrigger value="specific">Específicos</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título *</Label>
                      <Input
                        id="title"
                        value={formData.title || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Nome do hotel"
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
                        value={formData.location || ''}
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
                      value={formData.description || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrição detalhada do hotel"
                      rows={4}
                      className={errors.description ? 'border-red-500' : ''}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500">{errors.description}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Preço atual (R$) *</Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price ?? 0}
                        onChange={(e) =>
                          setFormData(prev => ({
                            ...prev,
                            price: Number(e.target.value) || 0,
                          }))
                        }
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
                      <Label htmlFor="originalPrice">Preço original (R$)</Label>
                      <Input
                        id="originalPrice"
                        type="number"
                        value={formData.originalPrice ?? 0}
                        onChange={(e) =>
                          setFormData(prev => ({
                            ...prev,
                            originalPrice: Number(e.target.value) || 0,
                          }))
                        }
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className={errors.originalPrice ? 'border-red-500' : ''}
                      />
                      {errors.originalPrice && (
                        <p className="text-sm text-red-500">{errors.originalPrice}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rating">Avaliação (0-5) *</Label>
                      <Input
                        id="rating"
                        type="number"
                        value={formData.rating ?? 0}
                        onChange={(e) =>
                          setFormData(prev => ({
                            ...prev,
                            rating: Number(e.target.value) || 0,
                          }))
                        }
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

                    <div className="space-y-2">
                      <Label htmlFor="maxGuests">Capacidade (pessoas)</Label>
                      <Input
                        id="maxGuests"
                        type="number"
                        value={formData.maxGuests ?? 4}
                        onChange={(e) =>
                          setFormData(prev => ({
                            ...prev,
                            maxGuests: Number(e.target.value) || 0,
                          }))
                        }
                        placeholder="4"
                        min="1"
                        step="1"
                        className={errors.maxGuests ? 'border-red-500' : ''}
                      />
                      {errors.maxGuests && (
                        <p className="text-sm text-red-500">{errors.maxGuests}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="distanceFromCenter">Distância do centro (km)</Label>
                      <Input
                        id="distanceFromCenter"
                        type="number"
                        value={formData.distanceFromCenter ?? 0}
                        onChange={(e) =>
                          setFormData(prev => ({
                            ...prev,
                            distanceFromCenter: Number(e.target.value) || 0,
                          }))
                        }
                        placeholder="2.5"
                        min="0"
                        step="0.1"
                        className={errors.distanceFromCenter ? 'border-red-500' : ''}
                      />
                      {errors.distanceFromCenter && (
                        <p className="text-sm text-red-500">{errors.distanceFromCenter}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reviewCount">Total de avaliações</Label>
                      <Input
                        id="reviewCount"
                        type="number"
                        value={formData.reviewCount ?? 0}
                        onChange={(e) =>
                          setFormData(prev => ({
                            ...prev,
                            reviewCount: Number(e.target.value) || 0,
                          }))
                        }
                        placeholder="100"
                        min="0"
                        step="1"
                        className={errors.reviewCount ? 'border-red-500' : ''}
                      />
                      {errors.reviewCount && (
                        <p className="text-sm text-red-500">{errors.reviewCount}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) =>
                          setFormData(prev => ({
                            ...prev,
                            status: value as any,
                          }))
                        }
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

                <TabsContent value="amenities" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Comodidades *</Label>
                    {errors.amenities && (
                      <p className="text-sm text-red-500">{errors.amenities}</p>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {AMENITIES_OPTIONS.map(amenity => (
                        <motion.div
                          key={amenity.value}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            type="button"
                            variant={(formData.amenities ?? []).includes(amenity.value) ? "default" : "outline"}
                            className="w-full justify-start gap-2 h-auto p-3"
                            onClick={() => handleAmenityToggle(amenity.value)}
                          >
                            <amenity.icon className="w-4 h-4" />
                            {amenity.label}
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Destaques exibidos no card</Label>
                    <Textarea
                      value={(formData.features ?? []).join('\n')}
                      onChange={(e) =>
                        setFormData(prev => ({
                          ...prev,
                          features: e.target.value
                            .split('\n')
                            .map(item => item.trim())
                            .filter(Boolean),
                        }))
                      }
                      placeholder={'Arquitetura Italiana\nSpa Premium\nPiscinas Exclusivas'}
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      Escreva um destaque por linha. Eles aparecem como etiquetas no site público.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="images" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Fotos e Vídeos</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowMediaImport(!showMediaImport);
                          if (!showMediaImport && availableMedia.length === 0) {
                            loadAvailableMedia();
                          }
                        }}
                        disabled={loadingMedia}
                        className="flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        {showMediaImport ? "Ocultar" : "Importar"} Galerias Existentes
                      </Button>
                    </div>
                    
                    {/* Seção de Importação de Mídias Existentes */}
                    {showMediaImport && (
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm flex items-center gap-2">
                            <RefreshCw className="w-4 h-4" />
                            Galerias e Mídias Existentes no Site
                          </h4>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (selectedMedia.size === availableMedia.length) {
                                  setSelectedMedia(new Set());
                                } else {
                                  setSelectedMedia(new Set(availableMedia.map(m => m.url)));
                                }
                              }}
                            >
                              {selectedMedia.size === availableMedia.length ? "Desmarcar Todas" : "Selecionar Todas"}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={loadAvailableMedia}
                              disabled={loadingMedia}
                            >
                              <RefreshCw className={`w-4 h-4 ${loadingMedia ? 'animate-spin' : ''}`} />
                            </Button>
                          </div>
                        </div>
                        
                        {loadingMedia ? (
                          <p className="text-sm text-gray-600">Carregando mídias disponíveis...</p>
                        ) : availableMedia.length === 0 ? (
                          <p className="text-sm text-gray-600">Nenhuma mídia encontrada nos hotéis cadastrados.</p>
                        ) : (
                          <>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto p-2">
                              {availableMedia.map((media, index) => (
                                <div
                                  key={`${media.url}-${index}`}
                                  className={`relative group border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                                    selectedMedia.has(media.url)
                                      ? 'border-blue-500 ring-2 ring-blue-300'
                                      : 'border-gray-200 hover:border-blue-300'
                                  }`}
                                  onClick={() => {
                                    const newSelected = new Set(selectedMedia);
                                    if (newSelected.has(media.url)) {
                                      newSelected.delete(media.url);
                                    } else {
                                      newSelected.add(media.url);
                                    }
                                    setSelectedMedia(newSelected);
                                  }}
                                >
                                  {media.type === 'image' ? (
                                    <img
                                      src={media.url}
                                      alt={media.hotelTitle || 'Imagem'}
                                      className="w-full h-24 object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150'%3E%3Crect fill='%23ddd' width='200' height='150'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='12' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3EImagem não encontrada%3C/text%3E%3C/svg%3E";
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-24 bg-gray-900 flex items-center justify-center">
                                      <Video className="w-8 h-8 text-white" />
                                    </div>
                                  )}
                                  
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                                    {selectedMedia.has(media.url) && (
                                      <div className="bg-blue-500 text-white rounded-full p-1">
                                        <CheckCircle className="w-5 h-5" />
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-1 truncate">
                                    {media.hotelTitle || (media.type === 'image' ? 'Imagem' : 'Vídeo')}
                                  </div>
                                  
                                  <div className="absolute top-1 right-1">
                                    {media.type === 'image' ? (
                                      <Badge variant="secondary" className="text-xs">
                                        <ImageIcon className="w-3 h-3 mr-1" />
                                        Foto
                                      </Badge>
                                    ) : (
                                      <Badge variant="secondary" className="text-xs">
                                        <Video className="w-3 h-3 mr-1" />
                                        Vídeo
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            <div className="flex items-center justify-between pt-2 border-t border-blue-300">
                              <p className="text-xs text-gray-600">
                                {selectedMedia.size > 0 ? (
                                  <span className="font-semibold text-blue-600">
                                    {selectedMedia.size} mídia(s) selecionada(s)
                                  </span>
                                ) : (
                                  <span>Selecione as mídias que deseja importar</span>
                                )}
                              </p>
                              <Button
                                type="button"
                                onClick={handleImportSelectedMedia}
                                disabled={selectedMedia.size === 0}
                                className="flex items-center gap-2"
                              >
                                <Download className="w-4 h-4" />
                                Importar Selecionadas ({selectedMedia.size})
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                    
                    {/* Upload de Novas Mídias */}
                    <div className="space-y-2">
                      <Label>Adicionar Novas Fotos e Vídeos</Label>
                      <MediaUpload
                        onChange={(urls) => {
                          const newImages = [...formData.images, ...urls].filter((v, i, a) => a.indexOf(v) === i);
                          setFormData(prev => ({ ...prev, images: newImages }));
                          setImagePreview(newImages);
                        }}
                        disabled={isSubmitting || isUploading}
                      />
                    </div>
                    
                    {/* Preview das Imagens Adicionadas */}
                    {formData.images && formData.images.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-semibold">
                            Galeria do Hotel ({formData.images.length} {formData.images.length === 1 ? 'mídia' : 'mídias'})
                          </Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm(`Tem certeza que deseja remover todas as ${formData.images.length} mídias?`)) {
                                setFormData(prev => ({ ...prev, images: [] }));
                                setImagePreview([]);
                              }
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Limpar Todas
                          </Button>
                        </div>
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                          {formData.images.map((imageUrl, index) => {
                            const isVideo = /\.(mp4|webm|ogg|mov|avi)$/i.test(imageUrl) || 
                                           imageUrl.includes('youtube.com') || 
                                           imageUrl.includes('youtu.be') || 
                                           imageUrl.includes('vimeo.com');
                            
                            return (
                              <div key={index} className="relative group">
                                {isVideo ? (
                                  <div className="relative w-full h-32 bg-gray-900 rounded-lg flex items-center justify-center border-2 border-gray-200 hover:border-blue-400 transition-colors">
                                    <Video className="w-8 h-8 text-white" />
                                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                                      {imageUrl.length > 30 ? `${imageUrl.substring(0, 30)}...` : imageUrl}
                                    </div>
                                  </div>
                                ) : (
                                  <img
                                    src={imageUrl}
                                    alt={`Imagem ${index + 1}`}
                                    className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-colors"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150'%3E%3Crect fill='%23ddd' width='200' height='150'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='12' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3EImagem não encontrada%3C/text%3E%3C/svg%3E";
                                    }}
                                  />
                                )}
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg flex items-center justify-center">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newImages = formData.images.filter((_, i) => i !== index);
                                      setFormData(prev => ({ ...prev, images: newImages }));
                                      setImagePreview(newImages);
                                    }}
                                    className="bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                    title="Remover mídia"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity truncate">
                                  {imageUrl.length > 30 ? `${imageUrl.substring(0, 30)}...` : imageUrl}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Tab: Vídeo */}
                <TabsContent value="video" className="space-y-4">
                  <HotelVideoManager
                    videoUrl={videoData.videoUrl}
                    youtubeId={videoData.youtubeId}
                    onChange={setVideoData}
                  />
                </TabsContent>

                {/* Tab: Avaliações */}
                <TabsContent value="reviews" className="space-y-4">
                  <HotelReviewsManager
                    reviews={reviews}
                    onChange={setReviews}
                  />
                </TabsContent>

                {/* Tab: Localização */}
                <TabsContent value="location" className="space-y-4">
                  <HotelLocationManager
                    location={formData.location}
                    coordinates={coordinates}
                    distanceFromCenter={formData.distanceFromCenter}
                    onChange={(data) => {
                      setFormData(prev => ({
                        ...prev,
                        location: data.location,
                        distanceFromCenter: data.distanceFromCenter
                      }))
                      setCoordinates(data.coordinates)
                    }}
                  />
                </TabsContent>

                {/* Tab: Benefícios Inclusos */}
                <TabsContent value="benefits" className="space-y-4">
                  <HotelBenefitsManager
                    benefits={benefits}
                    onChange={setBenefits}
                  />
                </TabsContent>

                {/* Tab: Por que Escolher */}
                <TabsContent value="why-choose" className="space-y-4">
                  <HotelWhyChooseManager
                    reasons={whyChooseReasons}
                    onChange={setWhyChooseReasons}
                  />
                </TabsContent>

                {/* Tab: Informações Específicas */}
                <TabsContent value="specific" className="space-y-4">
                  <HotelSpecificInfoManager
                    highlights={specificInfo.highlights}
                    specialBenefits={specificInfo.specialBenefits}
                    onChange={setSpecificInfo}
                  />
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
                  {loading || isSubmitting ? 'Salvando...' : 'Salvar Hotel'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Hotels List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {hotels.map((hotel) => {
            const highlightLabels = getHighlightLabels(hotel);
            return (
              <motion.div
                key={hotel.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{hotel.title}</CardTitle>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {hotel.location}
                      </div>
                    </div>
                    {getStatusBadge(hotel.status)}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {hotel.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">
                        {hotel.rating ?? hotel.metadata?.stars ?? hotel.metadata?.rating ?? 0}
                      </span>
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      {`R$ ${(
                        typeof hotel.price === 'number' && hotel.price > 0
                          ? hotel.price
                          : Number(hotel.metadata?.price ?? 0)
                      ).toFixed(2)}`}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Destaques:</p>
                    <div className="flex flex-wrap gap-1">
                      {highlightLabels.slice(0, 3).map(feature => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {highlightLabels.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{highlightLabels.length - 3} mais
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(hotel)}
                      className="flex-1"
                      disabled={isSubmitting || deletePendingId === hotel.id}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(hotel.id!)}
                      className="flex-1"
                      disabled={isSubmitting || deletePendingId === hotel.id}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      {deletePendingId === hotel.id ? 'Deletando...' : 'Deletar'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {hotels.length === 0 && !loading && (
        <div className="text-center py-12">
          <Hotel className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum hotel encontrado</h3>
          <p className="text-muted-foreground mb-4">
            Comece criando seu primeiro hotel
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Criar Primeiro Hotel
          </Button>
        </div>
      )}
    </div>
  );
}
