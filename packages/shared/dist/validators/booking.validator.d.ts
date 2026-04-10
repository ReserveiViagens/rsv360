import { z } from 'zod';
export declare const bookingSchema: z.ZodEffects<z.ZodObject<{
    checkIn: z.ZodDate;
    checkOut: z.ZodDate;
    adults: z.ZodNumber;
    children: z.ZodNumber;
    hotelId: z.ZodString;
    roomType: z.ZodOptional<z.ZodString>;
    specialRequests: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    checkIn: Date;
    checkOut: Date;
    adults: number;
    children: number;
    hotelId: string;
    roomType?: string | undefined;
    specialRequests?: string | undefined;
}, {
    checkIn: Date;
    checkOut: Date;
    adults: number;
    children: number;
    hotelId: string;
    roomType?: string | undefined;
    specialRequests?: string | undefined;
}>, {
    checkIn: Date;
    checkOut: Date;
    adults: number;
    children: number;
    hotelId: string;
    roomType?: string | undefined;
    specialRequests?: string | undefined;
}, {
    checkIn: Date;
    checkOut: Date;
    adults: number;
    children: number;
    hotelId: string;
    roomType?: string | undefined;
    specialRequests?: string | undefined;
}>;
export type Booking = z.infer<typeof bookingSchema>;
