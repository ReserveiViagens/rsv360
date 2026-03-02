"use client";

import { useState, useEffect } from 'react';

export interface Hotel {
  id: number;
  content_id: string;
  title: string;
  description: string;
  price?: number;
  originalPrice?: number;
  stars?: number;
  rating?: number;
  location?: string;
  status: 'active' | 'inactive' | 'draft';
  images: string[];
  features?: string[];
  maxGuests?: number;
  distanceFromCenter?: number;
  reviewCount?: number;
  metadata?: any;
  seo_data?: any;
  // Coordenadas geográficas
  latitude?: number;
  longitude?: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Promotion {
  id: number;
  content_id: string;
  title: string;
  description: string;
  discount: number;
  validUntil: string;
  status: 'active' | 'inactive';
  metadata?: any;
  seo_data?: any;
}

export interface Attraction {
  id: number;
  content_id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  status: 'active' | 'inactive';
  metadata?: any;
  seo_data?: any;
}

export interface Ticket {
  id: number;
  content_id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  location: string;
  duration: string;
  ageGroup: string;
  capacity?: number;
  category: string;
  rating: number;
  is_featured: boolean;
  is_active: boolean;
  features: string[];
  images: string[];
  status: 'active' | 'inactive';
  metadata?: any;
  seo_data?: any;
}

export interface WebsiteSettings {
  site_info: {
    title: string;
    tagline: string;
  };
  contact_info: {
    phones: string[];
    email: string;
    address?: string;
  };
  social_media: {
    facebook?: string;
    instagram?: string;
    website?: string;
  };
}

export function useWebsiteData() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Usar rota local do Next.js se API_BASE_URL estiver vazio ou não definido
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
  const USE_LOCAL_API = !API_BASE_URL || API_BASE_URL.trim() === '';
  
  // Importar função de autenticação
  const getAdminToken = () => {
    if (typeof window === 'undefined') {
      return process.env.ADMIN_TOKEN || process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'Bearer admin-token-123';
    }
    
    // Buscar do cookie
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('admin_token='));
    if (tokenCookie) {
      const token = tokenCookie.split('=')[1];
      if (token) return `Bearer ${token}`;
    }
    
    // Fallback: localStorage
    const tokenFromStorage = localStorage.getItem('admin_token');
    if (tokenFromStorage) return `Bearer ${tokenFromStorage}`;
    
    // Fallback final: variável de ambiente ou token padrão (dev)
    return process.env.NEXT_PUBLIC_ADMIN_TOKEN 
      ? `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN}` 
      : 'Bearer admin-token-123';
  };

  const fetchData = async (url: string, options: RequestInit = {}, fallbackUrl?: string) => {
    // Lista de URLs para tentar (externa primeiro, depois local)
    const urls = fallbackUrl 
      ? [url, fallbackUrl]
      : USE_LOCAL_API 
        ? [url]
        : [url, url.replace(API_BASE_URL, '')]; // Fallback para rota local

    for (const attemptUrl of urls) {
      try {
        const adminToken = getAdminToken();
        
        // Timeout de 5 segundos
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(attemptUrl, {
          ...options,
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': adminToken,
            ...options.headers,
          },
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          // Evitar quebrar a UI do CMS quando o endpoint público de settings não existe no servidor admin
          if (response.status === 404 && attemptUrl.includes('/api/website/settings')) {
            return { data: null } as any;
          }
          
          // Se não for a última tentativa, continuar
          if (attemptUrl !== urls[urls.length - 1]) {
            continue;
          }
          
          const errorText = await response.text().catch(() => 'Erro desconhecido');
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
        
        return await response.json();
      } catch (err: any) {
        // Se for timeout ou conexão recusada e não for a última tentativa, continuar
        if ((err.name === 'AbortError' || 
             err.message?.includes('Failed to fetch') || 
             err.message?.includes('ERR_CONNECTION_REFUSED')) &&
            attemptUrl !== urls[urls.length - 1]) {
          console.warn(`⚠️ Erro ao conectar em ${attemptUrl}, tentando fallback...`);
          continue;
        }
        
        // Última tentativa falhou
        if (err.message?.includes('Failed to fetch') || err.message?.includes('ERR_CONNECTION_REFUSED')) {
          const error = new Error(`Não foi possível conectar ao servidor. Usando dados locais.`);
          (error as any).isConnectionError = true;
          throw error;
        }
        
        // Outros erros
        throw err;
      }
    }
    
    // Se chegou aqui, todas as tentativas falharam
    throw new Error('Não foi possível conectar a nenhum servidor');
  };

  const loadHotels = async () => {
    try {
      const externalUrl = USE_LOCAL_API ? '' : `${API_BASE_URL}/api/admin/website/content/hotels`;
      const localUrl = '/api/admin/website/content/hotels';
      const data = await fetchData(externalUrl || localUrl, {}, localUrl);
      setHotels(data.data || []);
      setError(null);
    } catch (err: any) {
      console.warn('⚠️ Erro ao carregar hotéis, usando dados vazios:', err.message);
      if (err.isConnectionError) {
        // Não definir erro global, apenas usar array vazio
        setHotels([]);
      } else {
        setError('Erro ao carregar hotéis. Tente novamente.');
        setHotels([]);
      }
    }
  };

  const loadPromotions = async () => {
    try {
      const externalUrl = USE_LOCAL_API ? '' : `${API_BASE_URL}/api/admin/website/content/promotions`;
      const localUrl = '/api/admin/website/content/promotions';
      const data = await fetchData(externalUrl || localUrl, {}, localUrl);
      setPromotions(data.data || []);
      setError(null);
    } catch (err: any) {
      console.warn('⚠️ Erro ao carregar promoções, usando dados vazios:', err.message);
      setPromotions([]);
    }
  };

  const loadAttractions = async () => {
    try {
      const externalUrl = USE_LOCAL_API ? '' : `${API_BASE_URL}/api/admin/website/content/attractions`;
      const localUrl = '/api/admin/website/content/attractions';
      const data = await fetchData(externalUrl || localUrl, {}, localUrl);
      setAttractions(data.data || []);
      setError(null);
    } catch (err: any) {
      console.warn('⚠️ Erro ao carregar atrações, usando dados vazios:', err.message);
      setAttractions([]);
    }
  };

  const loadTickets = async () => {
    try {
      const externalUrl = USE_LOCAL_API ? '' : `${API_BASE_URL}/api/admin/website/content/tickets`;
      const localUrl = '/api/admin/website/content/tickets';
      const data = await fetchData(externalUrl || localUrl, {}, localUrl);
      setTickets(data.data || []);
      setError(null);
    } catch (err: any) {
      console.warn('⚠️ Erro ao carregar ingressos, usando dados vazios:', err.message);
      setTickets([]);
    }
  };

  const loadSettings = async () => {
    try {
      const externalUrl = USE_LOCAL_API ? '' : `${API_BASE_URL}/api/website/settings`;
      const localUrl = '/api/website/settings';
      const data = await fetchData(externalUrl || localUrl, {}, localUrl);
      setSettings(data.data || null);
      setError(null);
    } catch (err: any) {
      // Ignorar erros para settings, pois é opcional
      console.warn('⚠️ Erro ao carregar settings (opcional):', err.message);
      setSettings(null);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Carregar dados em paralelo, mas não falhar se um falhar
      await Promise.allSettled([
        loadHotels(),
        loadPromotions(),
        loadAttractions(),
        loadTickets(),
        loadSettings()
      ]);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      // Não definir erro global aqui, pois cada função já trata seus próprios erros
    } finally {
      setLoading(false);
    }
  };

  const createHotel = async (hotelData: any) => {
    try {
      const contentId = (hotelData.title || '').toLowerCase().replace(/\s+/g, '');

      const topLevelPrice = hotelData.price ?? hotelData.metadata?.price;
      const topLevelOriginal = hotelData.originalPrice ?? hotelData.metadata?.originalPrice ?? (topLevelPrice ? Math.round(topLevelPrice * 1.25) : undefined);
      const topLevelStars = hotelData.stars ?? hotelData.rating ?? hotelData.metadata?.stars ?? 4;
      const topLevelFeatures = hotelData.features ?? hotelData.amenities ?? hotelData.metadata?.features ?? [];
      const topLevelLocation = hotelData.location ?? hotelData.metadata?.location ?? '';
      const featuresList = Array.isArray(topLevelFeatures)
        ? topLevelFeatures.map(feature => String(feature).trim()).filter(feature => feature.length > 0)
        : [];

      // Normalizar imagens: converter caminhos relativos em URLs completas
      const normalizeImageUrl = (url: string): string => {
        if (!url) return '';
        // Se já é uma URL completa (http:// ou https://), retorna como está
        if (url.startsWith('http://') || url.startsWith('https://')) {
          return url;
        }
        // Se é um caminho relativo, converte para URL completa usando API_BASE_URL
        // Remove barra inicial se existir para evitar duplicação
        const cleanPath = url.startsWith('/') ? url : `/${url}`;
        return `${API_BASE_URL}${cleanPath}`;
      };

      const rawImages: string[] = Array.isArray(hotelData.images) && hotelData.images.length > 0
        ? hotelData.images
        : ['https://via.placeholder.com/800x600'];
      
      const images: string[] = rawImages.map(normalizeImageUrl).filter(url => url.length > 0);

      const metadataCapacityValue = hotelData.metadata?.capacity;
      const parsedCapacity = typeof metadataCapacityValue === 'string'
        ? parseInt(metadataCapacityValue.replace(/\D/g, ''), 10)
        : Number(metadataCapacityValue);
      const maxGuests =
        typeof hotelData.maxGuests === 'number' && hotelData.maxGuests > 0
          ? hotelData.maxGuests
          : Number.isFinite(parsedCapacity) && parsedCapacity > 0
            ? parsedCapacity
            : 4;

      const capacityLabel = `${maxGuests} pessoas`;

      const distanceFromCenter =
        typeof hotelData.distanceFromCenter === 'number'
          ? hotelData.distanceFromCenter
          : Number(hotelData.metadata?.distanceFromCenter) || 0;

      const reviewCount =
        typeof hotelData.reviewCount === 'number'
          ? hotelData.reviewCount
          : Number(hotelData.metadata?.reviewCount) || 0;

      const priceValue = topLevelPrice ?? 0;
      const originalPriceValue = topLevelOriginal ?? 0;
      const discountPercent =
        originalPriceValue > 0 && priceValue > 0
          ? Math.max(0, Math.round(((originalPriceValue - priceValue) / originalPriceValue) * 100))
          : Number(hotelData.metadata?.discount ?? 0);

      const metadata = {
        stars: topLevelStars,
        price: priceValue,
        originalPrice: originalPriceValue,
        features: featuresList,
        location: topLevelLocation,
        capacity: capacityLabel,
        maxGuests,
        distanceFromCenter,
        reviewCount,
        discount: discountPercent
      };

      const seo_data = {
        title: `${hotelData.title} - Caldas Novas`,
        description: String(hotelData.description || '').slice(0, 200) || 'Hospedagem em Caldas Novas',
        keywords: [String(hotelData.title || 'hotel'), 'hotel', 'caldas novas']
      };

      const payload = {
        page_type: 'hotels',
        content_id: contentId || 'hoteldemo',
        title: hotelData.title,
        description: hotelData.description,
        images,
        metadata,
        seo_data,
        status: hotelData.status ?? 'active',
      };

      const newHotel = await fetchData(`${API_BASE_URL}/api/admin/website/content`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setHotels(prev => [...prev, newHotel.data]);
      return newHotel.data;
    } catch (err) {
      console.error('Erro ao criar hotel:', err);
      throw err;
    }
  };

  const updateHotel = async (id: number, hotelData: Partial<Hotel>) => {
    try {
      const hotel = hotels.find(h => h.id === id);
      if (!hotel) throw new Error('Hotel não encontrado');

      // Transformar dados do formulário para o formato esperado pelo backend
      const topLevelPrice = hotelData.price ?? hotelData.metadata?.price ?? hotel.metadata?.price;
      const topLevelOriginal = hotelData.originalPrice ?? hotelData.metadata?.originalPrice ?? hotel.metadata?.originalPrice ?? (topLevelPrice ? Math.round(topLevelPrice * 1.25) : undefined);
      const topLevelStars = hotelData.stars ?? hotelData.rating ?? hotelData.metadata?.stars ?? hotel.metadata?.stars ?? 4;
      const topLevelFeatures = hotelData.features ?? hotelData.amenities ?? hotelData.metadata?.features ?? hotel.metadata?.features ?? [];
      const topLevelLocation = hotelData.location ?? hotelData.metadata?.location ?? hotel.metadata?.location ?? '';
      const featuresList = Array.isArray(topLevelFeatures)
        ? topLevelFeatures.map(feature => String(feature).trim()).filter(feature => feature.length > 0)
        : [];

      // Normalizar imagens: converter caminhos relativos em URLs completas
      const normalizeImageUrl = (url: string): string => {
        if (!url) return '';
        // Se já é uma URL completa (http:// ou https://), retorna como está
        if (url.startsWith('http://') || url.startsWith('https://')) {
          return url;
        }
        // Se é um caminho relativo, converte para URL completa usando API_BASE_URL
        // Remove barra inicial se existir para evitar duplicação
        const cleanPath = url.startsWith('/') ? url : `/${url}`;
        return `${API_BASE_URL}${cleanPath}`;
      };

      const rawImages: string[] = Array.isArray(hotelData.images) && hotelData.images.length > 0
        ? hotelData.images
        : (hotel.images || []);
      
      const images: string[] = rawImages.map(normalizeImageUrl).filter(url => url.length > 0);

      const metadataCapacityValue =
        hotelData.metadata?.capacity ??
        hotel.metadata?.capacity ??
        `${hotel.metadata?.maxGuests ?? hotel.maxGuests ?? 4} pessoas`;

      const parsedCapacity = typeof metadataCapacityValue === 'string'
        ? parseInt(metadataCapacityValue.replace(/\D/g, ''), 10)
        : Number(metadataCapacityValue);

      const maxGuests =
        typeof hotelData.maxGuests === 'number' && hotelData.maxGuests > 0
          ? hotelData.maxGuests
          : Number.isFinite(parsedCapacity) && parsedCapacity > 0
            ? parsedCapacity
            : typeof hotel.metadata?.maxGuests === 'number' && hotel.metadata.maxGuests > 0
              ? hotel.metadata.maxGuests
              : 4;

      const capacityLabel = `${maxGuests} pessoas`;

      const distanceFromCenter =
        typeof hotelData.distanceFromCenter === 'number'
          ? hotelData.distanceFromCenter
          : typeof hotelData.metadata?.distanceFromCenter === 'number'
            ? hotelData.metadata.distanceFromCenter
            : Number(hotel.metadata?.distanceFromCenter) || 0;

      const reviewCount =
        typeof hotelData.reviewCount === 'number'
          ? hotelData.reviewCount
          : typeof hotelData.metadata?.reviewCount === 'number'
            ? hotelData.metadata.reviewCount
            : Number(hotel.metadata?.reviewCount) || 0;

      const priceValue = topLevelPrice ?? 0;
      const originalPriceValue = topLevelOriginal ?? 0;
      const discountPercent =
        originalPriceValue > 0 && priceValue > 0
          ? Math.max(0, Math.round(((originalPriceValue - priceValue) / originalPriceValue) * 100))
          : Number(hotelData.metadata?.discount ?? hotel.metadata?.discount ?? 0);

      const metadata = {
        ...hotel.metadata,
        stars: topLevelStars,
        price: priceValue,
        originalPrice: originalPriceValue,
        features: featuresList,
        location: topLevelLocation,
        capacity: capacityLabel,
        maxGuests,
        distanceFromCenter,
        reviewCount,
        discount: discountPercent,
      };

      const seo_data = {
        ...hotel.seo_data,
        title: hotelData.title ? `${hotelData.title} - Caldas Novas` : hotel.seo_data?.title,
        description: hotelData.description ? String(hotelData.description).slice(0, 200) : hotel.seo_data?.description,
        keywords: hotelData.title ? [String(hotelData.title), 'hotel', 'caldas novas'] : hotel.seo_data?.keywords
      };

      const payload = {
        title: hotelData.title ?? hotel.title,
        description: hotelData.description ?? hotel.description,
        images,
        metadata,
        seo_data,
        status: hotelData.status ?? hotel.status,
      };

      const updatedHotel = await fetchData(`${API_BASE_URL}/api/admin/website/content/hotels/${hotel.content_id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      setHotels(prev => prev.map(h =>
        h.id === id ? updatedHotel.data : h
      ));
      return updatedHotel.data;
    } catch (err) {
      console.error('Erro ao atualizar hotel:', err);
      throw err;
    }
  };

  const deleteHotel = async (id: number) => {
    try {
      const hotel = hotels.find(h => h.id === id);
      if (!hotel) throw new Error('Hotel não encontrado');

      await fetchData(`${API_BASE_URL}/api/admin/website/content/hotels/${hotel.content_id}`, {
        method: 'DELETE',
      });

      setHotels(prev => prev.filter(h => h.id !== id));
      return true;
    } catch (err) {
      console.error('Erro ao deletar hotel:', err);
      throw err;
    }
  };

  const createPromotion = async (promotionData: Omit<Promotion, 'id' | 'content_id'>) => {
    try {
      const contentId = promotionData.title.toLowerCase().replace(/\s+/g, '-');
      const newPromotion = await fetchData(`${API_BASE_URL}/api/admin/website/content`, {
        method: 'POST',
        body: JSON.stringify({
          page_type: 'promotions',
          content_id: contentId,
          ...promotionData
        }),
      });

      setPromotions(prev => [...prev, newPromotion.data]);
      return newPromotion.data;
    } catch (err) {
      console.error('Erro ao criar promoção:', err);
      throw err;
    }
  };

  const updatePromotion = async (id: number, promotionData: Partial<Promotion>) => {
    try {
      const promotion = promotions.find(p => p.id === id);
      if (!promotion) throw new Error('Promoção não encontrada');

      // Preparar payload mantendo dados existentes quando não fornecidos
      const payload = {
        title: promotionData.title ?? promotion.title,
        description: promotionData.description ?? promotion.description,
        discount: promotionData.discount ?? promotion.discount ?? 0,
        validUntil: promotionData.validUntil ?? promotion.validUntil ?? '',
        status: promotionData.status ?? promotion.status,
        images: promotionData.images ?? promotion.images ?? [],
        metadata: {
          ...promotion.metadata,
          ...promotionData.metadata,
        },
        seo_data: {
          ...promotion.seo_data,
          ...promotionData.seo_data,
        },
      };

      const updatedPromotion = await fetchData(`${API_BASE_URL}/api/admin/website/content/promotions/${promotion.content_id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      setPromotions(prev => prev.map(p =>
        p.id === id ? updatedPromotion.data : p
      ));
      return updatedPromotion.data;
    } catch (err) {
      console.error('Erro ao atualizar promoção:', err);
      throw err;
    }
  };

  const deletePromotion = async (id: number) => {
    try {
      const promotion = promotions.find(p => p.id === id);
      if (!promotion) throw new Error('Promoção não encontrada');

      await fetchData(`${API_BASE_URL}/api/admin/website/content/promotions/${promotion.content_id}`, {
        method: 'DELETE',
      });

      setPromotions(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (err) {
      console.error('Erro ao deletar promoção:', err);
      throw err;
    }
  };

  const createAttraction = async (attractionData: Omit<Attraction, 'id' | 'content_id'>) => {
    try {
      const contentId = attractionData.title.toLowerCase().replace(/\s+/g, '-');
      const newAttraction = await fetchData(`${API_BASE_URL}/api/admin/website/content`, {
        method: 'POST',
        body: JSON.stringify({
          page_type: 'attractions',
          content_id: contentId,
          ...attractionData
        }),
      });

      setAttractions(prev => [...prev, newAttraction.data]);
      return newAttraction.data;
    } catch (err) {
      console.error('Erro ao criar atração:', err);
      throw err;
    }
  };

  const updateAttraction = async (id: number, attractionData: Partial<Attraction>) => {
    try {
      const attraction = attractions.find(a => a.id === id);
      if (!attraction) throw new Error('Atração não encontrada');

      // Preparar payload mantendo dados existentes quando não fornecidos
      const payload = {
        title: attractionData.title ?? attraction.title,
        description: attractionData.description ?? attraction.description,
        price: attractionData.price ?? attraction.price ?? 0,
        location: attractionData.location ?? attraction.location ?? '',
        status: attractionData.status ?? attraction.status,
        images: attractionData.images ?? attraction.images ?? [],
        metadata: {
          ...attraction.metadata,
          ...attractionData.metadata,
        },
        seo_data: {
          ...attraction.seo_data,
          ...attractionData.seo_data,
        },
      };

      const updatedAttraction = await fetchData(`${API_BASE_URL}/api/admin/website/content/attractions/${attraction.content_id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      setAttractions(prev => prev.map(a =>
        a.id === id ? updatedAttraction.data : a
      ));
      return updatedAttraction.data;
    } catch (err) {
      console.error('Erro ao atualizar atração:', err);
      throw err;
    }
  };

  const deleteAttraction = async (id: number) => {
    try {
      const attraction = attractions.find(a => a.id === id);
      if (!attraction) throw new Error('Atração não encontrada');

      await fetchData(`${API_BASE_URL}/api/admin/website/content/attractions/${attraction.content_id}`, {
        method: 'DELETE',
      });

      setAttractions(prev => prev.filter(a => a.id !== id));
      return true;
    } catch (err) {
      console.error('Erro ao deletar atração:', err);
      throw err;
    }
  };

  const createTicket = async (ticketData: Omit<Ticket, 'id' | 'content_id'>) => {
    try {
      const contentId = ticketData.title.toLowerCase().replace(/\s+/g, '-');
      const newTicket = await fetchData(`${API_BASE_URL}/api/admin/website/content`, {
        method: 'POST',
        body: JSON.stringify({
          page_type: 'tickets',
          content_id: contentId,
          ...ticketData
        }),
      });

      setTickets(prev => [...prev, newTicket.data]);
      return newTicket.data;
    } catch (err) {
      console.error('Erro ao criar ingresso:', err);
      throw err;
    }
  };

  const updateTicket = async (id: number, ticketData: Partial<Ticket>) => {
    try {
      const ticket = tickets.find(t => t.id === id);
      if (!ticket) throw new Error('Ingresso não encontrado');

      // Preparar payload mantendo dados existentes quando não fornecidos
      const payload = {
        title: ticketData.title ?? ticket.title,
        description: ticketData.description ?? ticket.description,
        price: ticketData.price ?? ticket.price ?? 0,
        originalPrice: ticketData.originalPrice ?? ticket.originalPrice,
        discount: ticketData.discount ?? ticket.discount,
        location: ticketData.location ?? ticket.location ?? '',
        duration: ticketData.duration ?? ticket.duration ?? '',
        ageGroup: ticketData.ageGroup ?? ticket.ageGroup ?? 'all',
        capacity: ticketData.capacity ?? ticket.capacity,
        category: ticketData.category ?? ticket.category ?? 'park',
        rating: ticketData.rating ?? ticket.rating ?? 0,
        is_featured: ticketData.is_featured ?? ticket.is_featured ?? false,
        is_active: ticketData.is_active ?? ticket.is_active ?? true,
        images: ticketData.images ?? ticket.images ?? [],
        metadata: {
          ...ticket.metadata,
          ...ticketData.metadata,
        },
        seo_data: {
          ...ticket.seo_data,
          ...ticketData.seo_data,
        },
      };

      const updatedTicket = await fetchData(`${API_BASE_URL}/api/admin/website/content/tickets/${ticket.content_id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      setTickets(prev => prev.map(t =>
        t.id === id ? updatedTicket.data : t
      ));
      return updatedTicket.data;
    } catch (err) {
      console.error('Erro ao atualizar ingresso:', err);
      throw err;
    }
  };

  const deleteTicket = async (id: number) => {
    try {
      const ticket = tickets.find(t => t.id === id);
      if (!ticket) throw new Error('Ingresso não encontrado');

      await fetchData(`${API_BASE_URL}/api/admin/website/content/tickets/${ticket.content_id}`, {
        method: 'DELETE',
      });

      setTickets(prev => prev.filter(t => t.id !== id));
      return true;
    } catch (err) {
      console.error('Erro ao deletar ingresso:', err);
      throw err;
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  return {
    hotels,
    promotions,
    attractions,
    tickets,
    settings,
    loading,
    error,
    loadAllData,
    loadHotels,
    loadPromotions,
    loadAttractions,
    loadTickets,
    loadSettings,
    createHotel,
    updateHotel,
    deleteHotel,
    createPromotion,
    updatePromotion,
    deletePromotion,
    createAttraction,
    updateAttraction,
    deleteAttraction,
    createTicket,
    updateTicket,
    deleteTicket,
  };
}

// Hook público para páginas do site (sem token admin)
export function useWebsiteContent(type: 'hotel' | 'promotion' | 'attraction' | 'ticket') {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Usar rota local do Next.js se API_BASE_URL estiver vazio ou não definido
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
  const USE_LOCAL_API = !API_BASE_URL || API_BASE_URL.trim() === '';

  const mapTypeToPage = (t: typeof type) => {
    if (t === 'hotel') return 'hotels';
    if (t === 'promotion') return 'promotions';
    if (t === 'attraction') return 'attractions';
    if (t === 'ticket') return 'tickets';
    return t;
  };

  useEffect(() => {
    let cancelled = false;
    let isFetching = false;

    const load = async (options?: { background?: boolean }) => {
      const background = options?.background ?? false;
      if (isFetching) return;
      isFetching = true;

      if (background) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
        setError(null);
      }
      
      const pageType = mapTypeToPage(type);
      let success = false;
      
      // Tentar primeiro a API externa (se configurada), depois fallback para local
      const urls = USE_LOCAL_API 
        ? [`/api/website/content/${pageType}`]
        : [
            `${API_BASE_URL}/api/website/content/${pageType}`,
            `/api/website/content/${pageType}` // Fallback para rota local
          ];

      for (const url of urls) {
        try {
          const controller = new AbortController();
          // Timeout de 5 segundos
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const res = await fetch(url, {
            method: 'GET',
            signal: controller.signal,
            // Sem headers customizados para evitar preflight CORS
          });
          
          clearTimeout(timeoutId);
          
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }
          
          const json = await res.json();
          const resultData = json.data || json.contents || [];
          
          if (Array.isArray(resultData)) {
            if (!cancelled) setData(resultData);
            success = true;
            break; // Sucesso, sair do loop
          } else {
            console.warn('⚠️ Resposta não é um array:', typeof resultData);
            if (!cancelled) setData([]);
            success = true; // Considerar sucesso mesmo com array vazio
            break;
          }
        } catch (err: any) {
          if (err?.name === 'AbortError') {
            console.warn(`⏱️ Timeout ao carregar de ${url}`);
            continue; // Tentar próxima URL
          }
          
          // Se não for a última URL, tentar próxima
          if (url !== urls[urls.length - 1]) {
            console.warn(`⚠️ Erro ao carregar de ${url}, tentando fallback...`, err.message);
            continue;
          }
          
          // Última tentativa falhou
          console.error('❌ Erro ao carregar conteúdo público de todas as fontes:', err);
          if (!cancelled) {
            setError('Nao foi possivel carregar os dados. Tente novamente.');
            setData([]); // Array vazio como fallback
          }
        }
      }
      
      if (!cancelled) {
        if (!success && !background) {
          setError((prev) => prev ?? 'Nao foi possivel carregar os dados. Tente novamente.');
        }
        if (background) {
          setIsRefreshing(false);
        } else {
          setIsLoading(false);
        }
      }

      isFetching = false;
    };
    
    load({ background: false });
    
    // Polling automático a cada 30 segundos para atualização em tempo real
    const interval = setInterval(() => {
      if (!cancelled) {
        load({ background: true });
      }
    }, 30000); // 30 segundos
    
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [type, API_BASE_URL, USE_LOCAL_API, retryCount]);

  const retry = () => setRetryCount((prev) => prev + 1);
  const status: 'loading' | 'success' | 'error' = isLoading ? 'loading' : error ? 'error' : 'success';

  return { data, isLoading, isRefreshing, error, retry, status };
}
