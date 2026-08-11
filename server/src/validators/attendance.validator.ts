import { z } from 'zod';

export const checkInSchema = z.object({
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const checkOutSchema = z.object({
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type CheckInInput = z.infer<typeof checkInSchema>;
export type CheckOutInput = z.infer<typeof checkOutSchema>;