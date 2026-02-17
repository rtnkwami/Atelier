import { z } from 'zod';

export const CreateProductSchema = z
  .object({
    name: z.string().min(1),
    description: z.string().optional(),
    category: z.string().min(1),
    price: z.number().positive(),
    stock: z.number().positive(),
    images: z.array(z.url()).optional(),
  })
  .strict();
export type ProductCreate = z.infer<typeof CreateProductSchema>;