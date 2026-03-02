/**
 * ✅ ITEM 38: API DE CÁLCULO DE PREÇO DINÂMICO
 * POST /api/pricing/dynamic - Calcular preço dinâmico com ML e cache
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculateSmartPrice } from '@/lib/smart-pricing-service';
import { applyPricingRules } from '@/lib/pricing-rules-service';
import { getBasePrice } from '@/lib/pricing-service';

// Cache simples em memória (em produção, usar Redis)
const priceCache = new Map<string, { price: number; expiresAt: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

function getCacheKey(itemId: number, checkIn: string, checkOut: string): string {
  return `price:${itemId}:${checkIn}:${checkOut}`;
}

// POST /api/pricing/dynamic - Calcular preço dinâmico
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      item_id,
      check_in,
      check_out,
      location,
      latitude,
      longitude,
      use_cache = true,
    } = body;

    if (!item_id || !check_in || !check_out) {
      return NextResponse.json(
        {
          success: false,
          error: 'item_id, check_in e check_out são obrigatórios',
        },
        { status: 400 }
      );
    }

    // ✅ ITEM 38: Verificar cache
    const cacheKey = getCacheKey(item_id, check_in, check_out);
    if (use_cache) {
      const cached = priceCache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        return NextResponse.json({
          success: true,
          data: {
            price: cached.price,
            cached: true,
          },
        });
      }
    }

    // Buscar preço base
    const basePrice = await getBasePrice(item_id);

    if (basePrice === 0) {
      return NextResponse.json(
        { success: false, error: 'Preço base não encontrado' },
        { status: 404 }
      );
    }

    // Calcular número de noites
    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);
    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // ✅ ITEM 38: Aplicar regras de precificação
    const rulesResult = await applyPricingRules(
      item_id,
      basePrice,
      check_in,
      check_out,
      nights
    );

    // ✅ ITEM 38: Aplicar Smart Pricing (clima, eventos, competidores)
    const smartPricingResult = await calculateSmartPrice(
      item_id,
      rulesResult.finalPrice,
      checkInDate,
      checkOutDate,
      location,
      latitude ? parseFloat(latitude) : undefined,
      longitude ? parseFloat(longitude) : undefined
    );

    const finalPrice = smartPricingResult.finalPrice * nights;

    // ✅ ITEM 38: Salvar no cache
    if (use_cache) {
      priceCache.set(cacheKey, {
        price: finalPrice,
        expiresAt: Date.now() + CACHE_TTL,
      });
    }

    // Limpar cache expirado periodicamente
    if (priceCache.size > 1000) {
      for (const [key, value] of priceCache.entries()) {
        if (value.expiresAt < Date.now()) {
          priceCache.delete(key);
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        base_price: basePrice,
        price_after_rules: rulesResult.finalPrice,
        final_price: finalPrice,
        nights,
        price_per_night: Math.round((finalPrice / nights) * 100) / 100,
        factors: smartPricingResult,
        applied_rules: rulesResult.appliedRules,
        cached: false,
      },
    });
  } catch (error: any) {
    console.error('Erro ao calcular preço dinâmico:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao calcular preço dinâmico' },
      { status: 500 }
    );
  }
}

