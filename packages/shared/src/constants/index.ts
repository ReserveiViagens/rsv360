import { Category, GroupAfinidade, PaymentMethod, PaymentStatus, OrderStatus } from '../types';

export const CATEGORIES: Category[] = ['HOTEL', 'TICKET', 'COMBO', 'FOOD', 'ADDON', 'EXCURSION'];

export const GROUPS: GroupAfinidade[] = ['DIROMA', 'PRIVE', 'GOLDEN_DOLPHIN', 'RIO_QUENTE', 'INDEPENDENTE'];

export const PAYMENT_METHODS: PaymentMethod[] = ['PIX', 'CREDIT_CARD', 'DEBIT_CARD'];

export const PAYMENT_STATUSES: PaymentStatus[] = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'REFUNDED'];

export const ORDER_STATUSES: OrderStatus[] = ['CREATED', 'CONFIRMED', 'PAID', 'DELIVERED', 'CANCELLED'];

export const AFFINITY_DISCOUNT_MATRIX = {
  combo2: 0.05,    // 5% discount for 2 items
  combo3: 0.10,    // 10% discount for 3 items
  comboPlus: 0.15, // 15% discount for 4+ items
  PIX: 0.05        // 5% discount for PIX payment
} as const;

export const AFFINITY_MAP = {
  DIROMA: { discountMultiplier: 1.0 },
  PRIVE: { discountMultiplier: 1.05 },
  GOLDEN_DOLPHIN: { discountMultiplier: 1.10 },
  RIO_QUENTE: { discountMultiplier: 1.15 },
  INDEPENDENTE: { discountMultiplier: 1.0 }
} as const;