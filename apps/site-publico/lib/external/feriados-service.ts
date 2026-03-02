/**
 * ✅ FASE 3.1 - FASE 5.1: Feriados Service
 * 
 * @description Serviço para verificar feriados nacionais brasileiros
 * - Integração com BrasilAPI
 * - Cache de feriados
 * - Suporte a múltiplos anos
 * 
 * @module external
 * @author RSV 360 Team
 * @created 2025-12-13
 */

import { redisCache } from '../redis-cache';

// ================================
// TYPES
// ================================

interface Feriado {
  date: string; // YYYY-MM-DD
  name: string;
  type: 'national' | 'state' | 'municipal';
  state?: string;
  city?: string;
}

// ================================
// CONSTANTS
// ================================

const CACHE_TTL = 86400 * 365; // 1 ano
const CACHE_PREFIX = 'feriados:';
const BRASIL_API_BASE = 'https://brasilapi.com.br/api/feriados/v1';

// ================================
// PUBLIC FUNCTIONS
// ================================

/**
 * Verificar se uma data é feriado
 */
export async function isHoliday(date: Date): Promise<boolean> {
  try {
    const year = date.getFullYear();
    const holidays = await getHolidays(year);
    
    const dateStr = formatDate(date);
    return holidays.some(h => h.date === dateStr);
  } catch (error: any) {
    console.error('Erro ao verificar feriado:', error);
    return false;
  }
}

/**
 * Verificar se há feriado na semana de uma data
 */
export async function isHolidayWeek(date: Date): Promise<boolean> {
  try {
    const year = date.getFullYear();
    const holidays = await getHolidays(year);
    
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay()); // Domingo
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Sábado
    
    return holidays.some(h => {
      const holidayDate = new Date(h.date);
      return holidayDate >= weekStart && holidayDate <= weekEnd;
    });
  } catch (error: any) {
    console.error('Erro ao verificar semana de feriado:', error);
    return false;
  }
}

/**
 * Obter feriados de um ano
 */
export async function getHolidays(year: number): Promise<Feriado[]> {
  try {
    // Verificar cache
    const cacheKey = `${CACHE_PREFIX}${year}`;
    const cached = await redisCache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Buscar da API
    const response = await fetch(`${BRASIL_API_BASE}/${year}`);
    
    if (!response.ok) {
      throw new Error(`BrasilAPI retornou erro: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Mapear para formato interno
    const holidays: Feriado[] = data.map((item: any) => ({
      date: item.date,
      name: item.name,
      type: item.type || 'national',
      state: item.state,
      city: item.city
    }));
    
    // Salvar em cache
    await redisCache.set(cacheKey, JSON.stringify(holidays), CACHE_TTL);
    
    return holidays;
  } catch (error: any) {
    console.error('Erro ao buscar feriados:', error);
    // Retornar feriados fixos como fallback
    return getFixedHolidays(year);
  }
}

/**
 * Obter próximo feriado
 */
export async function getNextHoliday(fromDate: Date = new Date()): Promise<Feriado | null> {
  try {
    const year = fromDate.getFullYear();
    const holidays = await getHolidays(year);
    
    // Buscar também do próximo ano
    const nextYearHolidays = await getHolidays(year + 1);
    const allHolidays = [...holidays, ...nextYearHolidays];
    
    // Filtrar feriados futuros
    const futureHolidays = allHolidays
      .filter(h => new Date(h.date) >= fromDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return futureHolidays.length > 0 ? futureHolidays[0] : null;
  } catch (error: any) {
    console.error('Erro ao buscar próximo feriado:', error);
    return null;
  }
}

// ================================
// HELPER FUNCTIONS
// ================================

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getFixedHolidays(year: number): Feriado[] {
  // Feriados nacionais fixos (não dependem da API)
  return [
    { date: `${year}-01-01`, name: 'Confraternização Universal', type: 'national' },
    { date: `${year}-04-21`, name: 'Tiradentes', type: 'national' },
    { date: `${year}-05-01`, name: 'Dia do Trabalhador', type: 'national' },
    { date: `${year}-09-07`, name: 'Independência do Brasil', type: 'national' },
    { date: `${year}-10-12`, name: 'Nossa Senhora Aparecida', type: 'national' },
    { date: `${year}-11-02`, name: 'Finados', type: 'national' },
    { date: `${year}-11-15`, name: 'Proclamação da República', type: 'national' },
    { date: `${year}-11-20`, name: 'Dia Nacional de Zumbi e da Consciência Negra', type: 'national' },
    { date: `${year}-12-25`, name: 'Natal', type: 'national' },
  ];
}

export default {
  isHoliday,
  isHolidayWeek,
  getHolidays,
  getNextHoliday
};

