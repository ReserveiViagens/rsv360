"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkoutSchema = exports.checkoutItemSchema = exports.checkoutCustomerSchema = void 0;
const zod_1 = require("zod");
exports.checkoutCustomerSchema = zod_1.z.object({
    name: zod_1.z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
    email: zod_1.z.string().email('E-mail inválido'),
    cpf: zod_1.z.string().regex(/^\d{11}$/, 'CPF deve ter 11 dígitos'),
    whatsapp: zod_1.z.string().regex(/^\d{10,11}$/, 'WhatsApp deve ter 10-11 dígitos'),
    phone: zod_1.z.string().optional()
});
exports.checkoutItemSchema = zod_1.z.object({
    productId: zod_1.z.string().min(1, 'Product ID obrigatório'),
    quantity: zod_1.z.number().int().positive('Quantidade deve ser positiva'),
    unitPrice: zod_1.z.number().positive('Preço unitário deve ser positivo'),
    totalPrice: zod_1.z.number().positive('Preço total deve ser positivo')
});
exports.checkoutSchema = zod_1.z.object({
    customer: exports.checkoutCustomerSchema,
    items: zod_1.z.array(exports.checkoutItemSchema).min(1, 'Deve ter ao menos 1 item'),
    paymentMethod: zod_1.z.enum(['PIX', 'CREDIT_CARD', 'DEBIT_CARD'], {
        errorMap: () => ({ message: 'Método de pagamento inválido' })
    }),
    totalAmount: zod_1.z.number().positive('Valor total deve ser positivo')
});
