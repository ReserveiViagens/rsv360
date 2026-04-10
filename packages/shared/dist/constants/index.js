"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AFFINITY_MAP = exports.AFFINITY_DISCOUNT_MATRIX = exports.ORDER_STATUSES = exports.PAYMENT_STATUSES = exports.PAYMENT_METHODS = exports.GROUPS = exports.CATEGORIES = void 0;
exports.CATEGORIES = ['HOTEL', 'TICKET', 'COMBO', 'FOOD', 'ADDON', 'EXCURSION'];
exports.GROUPS = ['DIROMA', 'PRIVE', 'GOLDEN_DOLPHIN', 'RIO_QUENTE', 'INDEPENDENTE'];
exports.PAYMENT_METHODS = ['PIX', 'CREDIT_CARD', 'DEBIT_CARD'];
exports.PAYMENT_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'REFUNDED'];
exports.ORDER_STATUSES = ['CREATED', 'CONFIRMED', 'PAID', 'DELIVERED', 'CANCELLED'];
exports.AFFINITY_DISCOUNT_MATRIX = {
    combo2: 0.05, // 5% discount for 2 items
    combo3: 0.10, // 10% discount for 3 items
    comboPlus: 0.15, // 15% discount for 4+ items
    PIX: 0.05 // 5% discount for PIX payment
};
exports.AFFINITY_MAP = {
    DIROMA: { discountMultiplier: 1.0 },
    PRIVE: { discountMultiplier: 1.05 },
    GOLDEN_DOLPHIN: { discountMultiplier: 1.10 },
    RIO_QUENTE: { discountMultiplier: 1.15 },
    INDEPENDENTE: { discountMultiplier: 1.0 }
};
