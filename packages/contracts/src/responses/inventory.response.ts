import { z } from "zod";

// --- Base Schemas ---

export const ProductSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string().optional(),
  category: z.string(),
  price: z.number(),
  stock: z.number(),
  images: z.array(z.string()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// --- Response Schemas ---

export const CreateProductResponseSchema = ProductSchema;

export const SearchProductResponseSchema = z.object({
  products: z.array(
    z.object({
      id: z.uuid(),
      name: z.string(),
      description: z.string().optional(),
      category: z.string(),
      price: z.number(),
    })
  ),
  page: z.number(),
  perPage: z.number(),
  totalItems: z.number(),
  totalPages: z.number(),
});

export const GetProductResponseSchema = ProductSchema.omit({
  createdAt: true,
  updatedAt: true,
});

export const UpdateProductResponseSchema = GetProductResponseSchema;

export const DeleteProductResponseSchema = z.object({
  deleted: z.string(),
});

// --- Types (Inferred from Schemas) ---

export type Product = z.infer<typeof ProductSchema>;

export type CreateProductResponse = Promise<z.infer<typeof CreateProductResponseSchema>>;

export type SearchProductResponse = Promise<z.infer<typeof SearchProductResponseSchema>>;

type ProductWithoutTimestamps = z.infer<typeof GetProductResponseSchema>;

export type GetProductResponse = Promise<ProductWithoutTimestamps>;

export type UpdateProductResponse = Promise<ProductWithoutTimestamps>;

export type DeleteProductResponse = Promise<z.infer<typeof DeleteProductResponseSchema>>;