import { z } from "zod";

export const ProductSchema = z.object({
  id: z.uuid(),
  name: z.string().nonempty(),
  description: z.string().optional(),
  category: z.string().nonempty(),
  price: z.number().positive(),
  stock: z.number().positive(),
  images: z.array(z.string()).optional(),
  createdAt: z.string().nonempty(),
  updatedAt: z.string().nonempty(),
});

export const CreateProductResponseSchema = ProductSchema;

export const SearchProductResponseSchema = z.object({
  products: z.array(
    z.object({
      id: z.uuid(),
      name: z.string().nonempty(),
      description: z.string().optional(),
      category: z.string().nonempty(),
      price: z.number().positive(),
    })
  ),
  page: z.number().positive(),
  perPage: z.number().positive(),
  totalItems: z.number().positive(),
  totalPages: z.number().positive(),
})
  .strict();

export const GetProductResponseSchema = ProductSchema.omit({
  createdAt: true,
  updatedAt: true,
});

export const UpdateProductResponseSchema = GetProductResponseSchema;

export const DeleteProductResponseSchema = z.object({
  deleted: z.uuid(),
});

export type Product = z.infer<typeof ProductSchema>;

export type CreateProductResponse = Promise<z.infer<typeof CreateProductResponseSchema>>;

export type SearchProductResponse = Promise<z.infer<typeof SearchProductResponseSchema>>;

type ProductWithoutTimestamps = z.infer<typeof GetProductResponseSchema>;

export type GetProductResponse = Promise<ProductWithoutTimestamps>;

export type UpdateProductResponse = Promise<ProductWithoutTimestamps>;

export type DeleteProductResponse = Promise<z.infer<typeof DeleteProductResponseSchema>>;