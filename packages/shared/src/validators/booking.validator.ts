import { z } from 'zod';

export const bookingSchema = z.object({
  checkIn: z.date({
    errorMap: () => ({ message: 'Data de check-in inválida' })
  }),
  checkOut: z.date({
    errorMap: () => ({ message: 'Data de check-out inválida' })
  }),
  adults: z.number().int().min(1, 'Deve ter ao menos 1 adulto').max(10, 'Máximo 10 adultos'),
  children: z.number().int().min(0, 'Crianças não pode ser negativo').max(10, 'Máximo 10 crianças'),
  hotelId: z.string().min(1, 'Hotel ID obrigatório'),
  roomType: z.string().optional(),
  specialRequests: z.string().optional()
}).refine((data) => data.checkOut > data.checkIn, {
  message: 'Data de check-out deve ser após check-in',
  path: ['checkOut']
});

export type Booking = z.infer<typeof bookingSchema>;