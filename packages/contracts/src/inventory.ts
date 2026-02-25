import { z } from 'zod';

export const CreateProductSchema = z
  .object({
    name: z.string().nonempty(),
    description: z.string(),
    category: z.string().nonempty(),
    price: z.number().positive(),
    stock: z.number().positive(),
    images: z.array(z.url()).optional(),
  })
  .strict();
export type CreateProduct = z.infer<typeof CreateProductSchema>;

export const UpdateProductSchema = CreateProductSchema.partial();
export type UpdateProduct = z.infer<typeof UpdateProductSchema>;

export const SearchProductSchema = z
  .object({
    name: z.string().optional(),
    category: z.string().optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    page: z.coerce.number().min(1).optional().default(1),
    limit: z.coerce.number().min(1).max(100).optional().default(20),
  })
  .strict();
export type SearchProducts = z.infer<typeof SearchProductSchema>;


const ReservationItemSchema = z.object({
  id: z.uuid(),
  quantity: z.number().int().positive(),
});
export const ReserveStockSchema = z.object({
  orderId: z.uuid(),
  items: z.array(ReservationItemSchema).nonempty(),
});
export type ReserveStock = z.infer<typeof ReserveStockSchema>;


export const CommitStockRequestSchema = z.object({
  reservationId: z.uuid(),
});
export type CommitStock = z.infer<typeof CommitStockRequestSchema>;
