"use client";

import { useState, useEffect } from 'react';

// Tipos para os dados do website
export interface Hotel {
  id: number;
  content_id: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  stars: number;
  location: string;
  status: 'active' | 'inactive';
  images: string[];
  features: string[];
  metadata?: any;
  seo_data?: any;
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

// Hook principal para gerenciar dados do website
export function useWebsiteData() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // URL base das APIs (será configurada via variáveis de ambiente)
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';
  const ADMIN_TOKEN = 'Bearer admin-token-123'; // Token de teste para APIs administrativas

  // Função para fazer requisições com tratamento de erro
  const fetchData = async (url: string, options: RequestInit = {}) => {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': ADMIN_TOKEN,
          ...options.headers,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.error('Erro na requisição:', err);
      throw err;
    }
  };

  // Carregar hotéis
  const loadHotels = async () => {
    try {
      const data = await fetchData(`${API_BASE_URL}/api/admin/website/content/hotels`);
      setHotels(data.data || []);
    } catch (err) {
      console.error('Erro ao carregar hotéis:', err);
      setError('Erro ao carregar hotéis');
    }
  };

  // Carregar promoções
  const loadPromotions = async () => {
    try {
      const data = await fetchData(`${API_BASE_URL}/api/admin/website/content/promotions`);
      setPromotions(data.data || []);
    } catch (err) {
      console.error('Erro ao carregar promoções:', err);
      setError('Erro ao carregar promoções');
    }
  };

  // Carregar atrações
  const loadAttractions = async () => {
    try {
      const data = await fetchData(`${API_BASE_URL}/api/admin/website/content/attractions`);
      setAttractions(data.data || []);
    } catch (err) {
      console.error('Erro ao carregar atrações:', err);
      setError('Erro ao carregar atrações');
    }
  };

  // Carregar configurações
  const loadSettings = async () => {
    try {
      const data = await fetchData(`${API_BASE_URL}/api/website/settings`);
      setSettings(data.data || null);
    } catch (err) {
      console.error('Erro ao carregar configurações:', err);
      setError('Erro ao carregar configurações');
    }
  };

  // Carregar todos os dados
  const loadAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        loadHotels(),
        loadPromotions(),
        loadAttractions(),
        loadSettings()
      ]);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados do sistema');
    } finally {
      setLoading(false);
    }
  };

  // CRUD Operations para Hotéis
  const createHotel = async (hotelData: Omit<Hotel, 'id' | 'content_id'>) => {
    try {
      const contentId = hotelData.title.toLowerCase().replace(/\s+/g, '-');
      const newHotel = await fetchData(`${API_BASE_URL}/api/admin/website/content`, {
        method: 'POST',
        body: JSON.stringify({
          page_type: 'hotels',
          content_id: contentId,
          ...hotelData
        }),
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
      // Encontrar o hotel pelo id para obter o content_id
      const hotel = hotels.find(h => h.id === id);
      if (!hotel) throw new Error('Hotel não encontrado');

      const updatedHotel = await fetchData(`${API_BASE_URL}/api/admin/website/content/hotels/${hotel.content_id}`, {
        method: 'PUT',
        body: JSON.stringify(hotelData),
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
      // Encontrar o hotel pelo id para obter o content_id
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

  // CRUD Operations para Promoções
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
      // Encontrar a promoção pelo id para obter o content_id
      const promotion = promotions.find(p => p.id === id);
      if (!promotion) throw new Error('Promoção não encontrada');

      const updatedPromotion = await fetchData(`${API_BASE_URL}/api/admin/website/content/promotions/${promotion.content_id}`, {
        method: 'PUT',
        body: JSON.stringify(promotionData),
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
      // Encontrar a promoção pelo id para obter o content_id
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

  // CRUD Operations para Atrações
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
      // Encontrar a atração pelo id para obter o content_id
      const attraction = attractions.find(a => a.id === id);
      if (!attraction) throw new Error('Atração não encontrada');

      const updatedAttraction = await fetchData(`${API_BASE_URL}/api/admin/website/content/attractions/${attraction.content_id}`, {
        method: 'PUT',
        body: JSON.stringify(attractionData),
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
      // Encontrar a atração pelo id para obter o content_id
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

  // Carregar dados na inicialização
  useEffect(() => {
    loadAllData();
  }, []);

  return {
    // Estados
    hotels,
    promotions,
    attractions,
    settings,
    loading,
    error,

    // Funções de carregamento
    loadAllData,
    loadHotels,
    loadPromotions,
    loadAttractions,
    loadSettings,

    // CRUD Hotéis
    createHotel,
    updateHotel,
    deleteHotel,

    // CRUD Promoções
    createPromotion,
    updatePromotion,
    deletePromotion,

    // CRUD Atrações
    createAttraction,
    updateAttraction,
    deleteAttraction,
  };
}
