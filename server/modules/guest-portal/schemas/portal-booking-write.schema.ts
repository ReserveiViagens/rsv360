import { z } from 'zod';

export const PortalBookingUpdateSchema = z
  .object({
    specialRequests: z.string().max(2000).optional(),
  })
  .strict();

export type PortalBookingUpdate = z.infer<typeof PortalBookingUpdateSchema>;
