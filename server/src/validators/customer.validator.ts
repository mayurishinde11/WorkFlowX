import { z } from 'zod';

export const createCustomerSchema = z.object({
  name: z.string().min(1, 'Customer name is required'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().min(1, 'Address is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  notes: z.string().optional(),
});

export const updateCustomerSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().min(1).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  notes: z.string().optional(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;