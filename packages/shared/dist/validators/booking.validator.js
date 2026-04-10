"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingSchema = void 0;
const zod_1 = require("zod");
exports.bookingSchema = zod_1.z.object({
    checkIn: zod_1.z.date({
        errorMap: () => ({ message: 'Data de check-in inválida' })
    }),
    checkOut: zod_1.z.date({
        errorMap: () => ({ message: 'Data de check-out inválida' })
    }),
    adults: zod_1.z.number().int().min(1, 'Deve ter ao menos 1 adulto').max(10, 'Máximo 10 adultos'),
    children: zod_1.z.number().int().min(0, 'Crianças não pode ser negativo').max(10, 'Máximo 10 crianças'),
    hotelId: zod_1.z.string().min(1, 'Hotel ID obrigatório'),
    roomType: zod_1.z.string().optional(),
    specialRequests: zod_1.z.string().optional()
}).refine((data) => data.checkOut > data.checkIn, {
    message: 'Data de check-out deve ser após check-in',
    path: ['checkOut']
});
