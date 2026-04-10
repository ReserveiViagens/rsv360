import { z } from 'zod';

export const checkoutCustomerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve ter 11 dígitos'),
  whatsapp: z.string().regex(/^\d{10,11}$/, 'WhatsApp deve ter 10-11 dígitos'),
  phone: z.string().optional()
});

export const checkoutItemSchema = z.object({
  productId: z.string().min(1, 'Product ID obrigatório'),
  quantity: z.number().int().positive('Quantidade deve ser positiva'),
  unitPrice: z.number().positive('Preço unitário deve ser positivo'),
  totalPrice: z.number().positive('Preço total deve ser positivo')
});

export const checkoutSchema = z.object({
  customer: checkoutCustomerSchema,
  items: z.array(checkoutItemSchema).min(1, 'Deve ter ao menos 1 item'),
  paymentMethod: z.enum(['PIX', 'CREDIT_CARD', 'DEBIT_CARD'], {
    errorMap: () => ({ message: 'Método de pagamento inválido' })
  }),
  totalAmount: z.number().positive('Valor total deve ser positivo')
});

export type CheckoutCustomer = z.infer<typeof checkoutCustomerSchema>;
export type CheckoutItem = z.infer<typeof checkoutItemSchema>;
export type Checkout = z.infer<typeof checkoutSchema>;