export type Category = 'HOTEL' | 'TICKET' | 'COMBO' | 'FOOD' | 'ADDON' | 'EXCURSION';
export type GroupAfinidade = 'DIROMA' | 'PRIVE' | 'GOLDEN_DOLPHIN' | 'RIO_QUENTE' | 'INDEPENDENTE';
export type PaymentMethod = 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD';
export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'REFUNDED';
export type OrderStatus = 'CREATED' | 'CONFIRMED' | 'PAID' | 'DELIVERED' | 'CANCELLED';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED';
export interface Product {
    id: string;
    name: string;
    description: string;
    category: Category;
    price: number;
    originalPrice?: number;
    group: GroupAfinidade;
    slug: string;
    images: string[];
    available: boolean;
    metadata?: Record<string, any>;
}
export interface CartItem {
    productId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    metadata?: Record<string, any>;
}
export interface OrderCustomer {
    name: string;
    email: string;
    cpf: string;
    whatsapp: string;
    phone?: string;
}
export interface Order {
    id: string;
    customer: OrderCustomer;
    items: CartItem[];
    totalAmount: number;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    orderStatus: OrderStatus;
    createdAt: Date;
    updatedAt: Date;
}
export interface TicketItem {
    ticketId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    validFrom: Date;
    validTo: Date;
}
export interface WizardAnswers {
    destination: string;
    dates: {
        checkIn: Date;
        checkOut: Date;
    };
    adults: number;
    children: number;
    budget: number;
    preferences: string[];
    group: GroupAfinidade;
}
export interface ComboSuggestion {
    id: string;
    name: string;
    description: string;
    items: Product[];
    totalPrice: number;
    discount: number;
    affinityGroup: GroupAfinidade;
}
