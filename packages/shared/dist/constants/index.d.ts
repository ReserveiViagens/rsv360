import { Category, GroupAfinidade, PaymentMethod, PaymentStatus, OrderStatus } from '../types';
export declare const CATEGORIES: Category[];
export declare const GROUPS: GroupAfinidade[];
export declare const PAYMENT_METHODS: PaymentMethod[];
export declare const PAYMENT_STATUSES: PaymentStatus[];
export declare const ORDER_STATUSES: OrderStatus[];
export declare const AFFINITY_DISCOUNT_MATRIX: {
    readonly combo2: 0.05;
    readonly combo3: 0.1;
    readonly comboPlus: 0.15;
    readonly PIX: 0.05;
};
export declare const AFFINITY_MAP: {
    readonly DIROMA: {
        readonly discountMultiplier: 1;
    };
    readonly PRIVE: {
        readonly discountMultiplier: 1.05;
    };
    readonly GOLDEN_DOLPHIN: {
        readonly discountMultiplier: 1.1;
    };
    readonly RIO_QUENTE: {
        readonly discountMultiplier: 1.15;
    };
    readonly INDEPENDENTE: {
        readonly discountMultiplier: 1;
    };
};
