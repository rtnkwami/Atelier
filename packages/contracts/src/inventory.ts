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
export type CreateProduct = z.infer<typeof CreateProductSchema>;

export const UpdateProductSchema = CreateProductSchema.partial();
export type UpdateProduct = z.infer<typeof UpdateProductSchema>;