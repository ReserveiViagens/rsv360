import { z } from 'zod';
export declare const checkoutCustomerSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    cpf: z.ZodString;
    whatsapp: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    cpf: string;
    whatsapp: string;
    phone?: string | undefined;
}, {
    name: string;
    email: string;
    cpf: string;
    whatsapp: string;
    phone?: string | undefined;
}>;
export declare const checkoutItemSchema: z.ZodObject<{
    productId: z.ZodString;
    quantity: z.ZodNumber;
    unitPrice: z.ZodNumber;
    totalPrice: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    productId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}, {
    productId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}>;
export declare const checkoutSchema: z.ZodObject<{
    customer: z.ZodObject<{
        name: z.ZodString;
        email: z.ZodString;
        cpf: z.ZodString;
        whatsapp: z.ZodString;
        phone: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        email: string;
        cpf: string;
        whatsapp: string;
        phone?: string | undefined;
    }, {
        name: string;
        email: string;
        cpf: string;
        whatsapp: string;
        phone?: string | undefined;
    }>;
    items: z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        quantity: z.ZodNumber;
        unitPrice: z.ZodNumber;
        totalPrice: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        productId: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
    }, {
        productId: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
    }>, "many">;
    paymentMethod: z.ZodEnum<["PIX", "CREDIT_CARD", "DEBIT_CARD"]>;
    totalAmount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    customer: {
        name: string;
        email: string;
        cpf: string;
        whatsapp: string;
        phone?: string | undefined;
    };
    items: {
        productId: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
    }[];
    paymentMethod: "PIX" | "CREDIT_CARD" | "DEBIT_CARD";
    totalAmount: number;
}, {
    customer: {
        name: string;
        email: string;
        cpf: string;
        whatsapp: string;
        phone?: string | undefined;
    };
    items: {
        productId: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
    }[];
    paymentMethod: "PIX" | "CREDIT_CARD" | "DEBIT_CARD";
    totalAmount: number;
}>;
export type CheckoutCustomer = z.infer<typeof checkoutCustomerSchema>;
export type CheckoutItem = z.infer<typeof checkoutItemSchema>;
export type Checkout = z.infer<typeof checkoutSchema>;
