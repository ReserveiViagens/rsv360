/**
 * Serviço de Cálculo de Preços
 * Calcula preços dinâmicos, descontos automáticos e taxas
 */

import { queryDatabase } from './db';
import { calculateSmartPrice } from './smart-pricing-service';
import { applyPricingRules } from './pricing-rules-service';

export interface PricingCalculation {
  basePrice: number;
  nights: number;
  subtotal: number;
  discount: number;
  discountPercentage: number;
  discountReason?: string;
  taxes: number;
  taxesPercentage: number;
  serviceFee: number;
  serviceFeePercentage: number;
  total: number;
  breakdown: {
    basePrice: number;
    nights: number;
    subtotal: number;
    discount: number;
    taxes: number;
    serviceFee: number;
    total: number;
  };
}

export interface PricingRules {
  basePrice: number;
  minStayDays?: number;
  maxStayDays?: number;
  weeklyDiscount?: number;
  monthlyDiscount?: number;
  seasonalMultipliers?: Array<{
    startDate: string;
    endDate: string;
    multiplier: number;
    name: string;
  }>;
  dayOfWeekMultipliers?: {
    [key: number]: number; // 0 = domingo, 6 = sábado
  };
  lastMinuteDiscount?: {
    daysBefore: number;
    discount: number;
  };
  advanceBookingDiscount?: {
    daysBefore: number;
    discount: number;
  };
}

/**
 * Calcula número de noites entre duas datas
 */
export function calculateNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Busca preço base do item (hotel/quarto)
 */
export async function getBasePrice(itemId: number): Promise<number> {
  try {
    const result = await queryDatabase(
      `SELECT 
        price,
        original_price,
        metadata
      FROM website_content
      WHERE id = $1 AND type = 'hotel' AND status = 'active'
      LIMIT 1`,
      [itemId]
    );

    if (result && result.length > 0) {
      // Priorizar price, depois original_price, depois metadata
      const price = result[0].price || result[0].original_price;
      
      if (price) {
        return parseFloat(price.toString());
      }

      // Tentar buscar de metadata
      const metadata = result[0].metadata;
      if (metadata) {
        const meta = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
        if (meta.price) {
          return parseFloat(meta.price.toString());
        }
      }
    }

    return 0;
  } catch (error) {
    console.error('Erro ao buscar preço base:', error);
    return 0;
  }
}

/**
 * Busca regras de precificação do item
 */
export async function getPricingRules(itemId: number): Promise<PricingRules | null> {
  try {
    const result = await queryDatabase(
      `SELECT 
        price,
        metadata
      FROM website_content
      WHERE id = $1 AND type = 'hotel'
      LIMIT 1`,
      [itemId]
    );

    if (result && result.length > 0) {
      const metadata = result[0].metadata;
      if (metadata) {
        const meta = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
        
        return {
          basePrice: parseFloat(result[0].price || meta.price || 0),
          minStayDays: meta.minStayDays,
          maxStayDays: meta.maxStayDays,
          weeklyDiscount: meta.weeklyDiscount || 0,
          monthlyDiscount: meta.monthlyDiscount || 0,
          seasonalMultipliers: meta.seasonalMultipliers || [],
          dayOfWeekMultipliers: meta.dayOfWeekMultipliers || {},
          lastMinuteDiscount: meta.lastMinuteDiscount,
          advanceBookingDiscount: meta.advanceBookingDiscount,
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Erro ao buscar regras de precificação:', error);
    return null;
  }
}

/**
 * Aplica multiplicadores sazonais
 */
function applySeasonalMultipliers(
  basePrice: number,
  checkIn: string,
  seasonalMultipliers?: Array<{ startDate: string; endDate: string; multiplier: number; name: string }>
): { price: number; multiplier: number; reason?: string } {
  if (!seasonalMultipliers || seasonalMultipliers.length === 0) {
    return { price: basePrice, multiplier: 1 };
  }

  const checkInDate = new Date(checkIn);
  
  for (const season of seasonalMultipliers) {
    const start = new Date(season.startDate);
    const end = new Date(season.endDate);
    
    if (checkInDate >= start && checkInDate <= end) {
      return {
        price: basePrice * season.multiplier,
        multiplier: season.multiplier,
        reason: `Alta temporada: ${season.name}`,
      };
    }
  }

  return { price: basePrice, multiplier: 1 };
}

/**
 * Aplica multiplicadores por dia da semana
 */
function applyDayOfWeekMultipliers(
  basePrice: number,
  checkIn: string,
  checkOut: string,
  dayOfWeekMultipliers?: { [key: number]: number }
): { price: number; multiplier: number } {
  if (!dayOfWeekMultipliers || Object.keys(dayOfWeekMultipliers).length === 0) {
    return { price: basePrice, multiplier: 1 };
  }

  const start = new Date(checkIn);
  const end = new Date(checkOut);
  let totalPrice = 0;
  let totalDays = 0;

  const currentDate = new Date(start);
  while (currentDate < end) {
    const dayOfWeek = currentDate.getDay();
    const multiplier = dayOfWeekMultipliers[dayOfWeek] || 1;
    totalPrice += basePrice * multiplier;
    totalDays++;
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const avgMultiplier = totalDays > 0 ? totalPrice / (basePrice * totalDays) : 1;

  return {
    price: totalPrice / totalDays || basePrice,
    multiplier: avgMultiplier,
  };
}

/**
 * Calcula desconto por número de noites
 */
function calculateStayDiscount(
  nights: number,
  weeklyDiscount?: number,
  monthlyDiscount?: number
): { discount: number; percentage: number; reason?: string } {
  if (nights >= 30 && monthlyDiscount) {
    return {
      discount: monthlyDiscount,
      percentage: monthlyDiscount,
      reason: `Desconto mensal (${monthlyDiscount}%)`,
    };
  }

  if (nights >= 7 && weeklyDiscount) {
    return {
      discount: weeklyDiscount,
      percentage: weeklyDiscount,
      reason: `Desconto semanal (${weeklyDiscount}%)`,
    };
  }

  return { discount: 0, percentage: 0 };
}

/**
 * Calcula desconto por tempo de antecedência
 */
function calculateAdvanceBookingDiscount(
  checkIn: string,
  advanceBookingDiscount?: { daysBefore: number; discount: number }
): { discount: number; percentage: number; reason?: string } {
  if (!advanceBookingDiscount) {
    return { discount: 0, percentage: 0 };
  }

  const checkInDate = new Date(checkIn);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const daysUntilCheckIn = Math.ceil((checkInDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilCheckIn >= advanceBookingDiscount.daysBefore) {
    return {
      discount: advanceBookingDiscount.discount,
      percentage: advanceBookingDiscount.discount,
      reason: `Reserva antecipada (${advanceBookingDiscount.daysBefore}+ dias)`,
    };
  }

  return { discount: 0, percentage: 0 };
}

/**
 * Calcula desconto last minute
 */
function calculateLastMinuteDiscount(
  checkIn: string,
  lastMinuteDiscount?: { daysBefore: number; discount: number }
): { discount: number; percentage: number; reason?: string } {
  if (!lastMinuteDiscount) {
    return { discount: 0, percentage: 0 };
  }

  const checkInDate = new Date(checkIn);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const daysUntilCheckIn = Math.ceil((checkInDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilCheckIn <= lastMinuteDiscount.daysBefore) {
    return {
      discount: lastMinuteDiscount.discount,
      percentage: lastMinuteDiscount.discount,
      reason: `Desconto last minute (${daysUntilCheckIn} dias)`,
    };
  }

  return { discount: 0, percentage: 0 };
}

/**
 * Calcula preço completo de uma reserva
 * @param itemId - ID do item (hotel/quarto)
 * @param checkIn - Data de check-in (YYYY-MM-DD)
 * @param checkOut - Data de check-out (YYYY-MM-DD)
 * @param paymentMethod - Método de pagamento (pix, card, boleto)
 * @param customDiscount - Desconto customizado (opcional)
 * @returns Cálculo completo de preços
 */
export async function calculatePricing(
  itemId: number,
  checkIn: string,
  checkOut: string,
  paymentMethod?: string,
  customDiscount?: number
): Promise<PricingCalculation> {
  try {
    // Calcular número de noites
    const nights = calculateNights(checkIn, checkOut);

    // Buscar preço base
    let basePrice = await getBasePrice(itemId);
    
    if (basePrice === 0) {
      throw new Error('Preço base não encontrado para o item');
    }

    // Buscar regras de precificação
    const rules = await getPricingRules(itemId);

    // Aplicar multiplicadores sazonais
    const seasonal = applySeasonalMultipliers(
      basePrice,
      checkIn,
      rules?.seasonalMultipliers
    );
    basePrice = seasonal.price;

    // Aplicar multiplicadores por dia da semana
    const dayOfWeek = applyDayOfWeekMultipliers(
      basePrice,
      checkIn,
      checkOut,
      rules?.dayOfWeekMultipliers
    );
    basePrice = dayOfWeek.price;

    // ✅ ITEM 37: Aplicar regras de precificação
    const rulesResult = await applyPricingRules(itemId, basePrice, checkIn, checkOut, nights);
    basePrice = rulesResult.finalPrice;

    // Calcular subtotal (preço base * noites)
    let subtotal = basePrice * nights;

    // Aplicar descontos
    let totalDiscountPercentage = 0;
    const discountReasons: string[] = [];

    // Desconto por estadia (semanal/mensal)
    const stayDiscount = calculateStayDiscount(
      nights,
      rules?.weeklyDiscount,
      rules?.monthlyDiscount
    );
    if (stayDiscount.discount > 0) {
      totalDiscountPercentage += stayDiscount.discount;
      discountReasons.push(stayDiscount.reason || '');
    }

    // Desconto por reserva antecipada
    const advanceDiscount = calculateAdvanceBookingDiscount(
      checkIn,
      rules?.advanceBookingDiscount
    );
    if (advanceDiscount.discount > 0) {
      totalDiscountPercentage += advanceDiscount.discount;
      discountReasons.push(advanceDiscount.reason || '');
    }

    // Desconto last minute
    const lastMinuteDiscount = calculateLastMinuteDiscount(
      checkIn,
      rules?.lastMinuteDiscount
    );
    if (lastMinuteDiscount.discount > 0) {
      totalDiscountPercentage += lastMinuteDiscount.discount;
      discountReasons.push(lastMinuteDiscount.reason || '');
    }

    // Desconto por método de pagamento (PIX = 5%)
    if (paymentMethod === 'pix') {
      totalDiscountPercentage += 5;
      discountReasons.push('Desconto PIX (5%)');
    }

    // Desconto customizado (se fornecido)
    if (customDiscount && customDiscount > 0) {
      totalDiscountPercentage += customDiscount;
      discountReasons.push(`Desconto adicional (${customDiscount}%)`);
    }

    // Limitar desconto máximo a 50%
    totalDiscountPercentage = Math.min(totalDiscountPercentage, 50);

    // Calcular valor do desconto
    const discount = subtotal * (totalDiscountPercentage / 100);
    const subtotalAfterDiscount = subtotal - discount;

    // Calcular taxas (10% taxa de serviço padrão)
    const serviceFeePercentage = 10;
    const serviceFee = subtotalAfterDiscount * (serviceFeePercentage / 100);

    // Calcular impostos (0% por padrão, pode ser configurado)
    const taxesPercentage = 0;
    const taxes = subtotalAfterDiscount * (taxesPercentage / 100);

    // Calcular total final
    const total = subtotalAfterDiscount + serviceFee + taxes;

    return {
      basePrice,
      nights,
      subtotal,
      discount,
      discountPercentage: totalDiscountPercentage,
      discountReason: discountReasons.join(', ') || undefined,
      taxes,
      taxesPercentage,
      serviceFee,
      serviceFeePercentage,
      total,
      breakdown: {
        basePrice,
        nights,
        subtotal,
        discount,
        taxes,
        serviceFee,
        total,
      },
    };
  } catch (error: any) {
    console.error('Erro ao calcular preços:', error);
    throw new Error(`Erro ao calcular preços: ${error.message}`);
  }
}

/**
 * Valida regras de estadia mínima/máxima
 */
export async function validateStayRules(
  itemId: number,
  checkIn: string,
  checkOut: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    const nights = calculateNights(checkIn, checkOut);
    const rules = await getPricingRules(itemId);

    if (rules?.minStayDays && nights < rules.minStayDays) {
      return {
        valid: false,
        error: `Estadia mínima de ${rules.minStayDays} noite(s)`,
      };
    }

    if (rules?.maxStayDays && nights > rules.maxStayDays) {
      return {
        valid: false,
        error: `Estadia máxima de ${rules.maxStayDays} noite(s)`,
      };
    }

    return { valid: true };
  } catch (error: any) {
    return {
      valid: false,
      error: `Erro ao validar regras: ${error.message}`,
    };
  }
}

