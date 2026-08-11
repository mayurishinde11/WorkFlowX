import { z } from 'zod';

export const recordLocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  taskId: z.string().optional(),
});

export type RecordLocationInput = z.infer<typeof recordLocationSchema>;