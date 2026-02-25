import { z } from "zod";

export const ProductSchema = z.object({
  id: z.uuid(),
  name: z.string().nonempty(),
  description: z.string().optional(),
  category: z.string().nonempty(),
  price: z.number().positive(),
  stock: z.number().nonnegative(),
  images: z.array(z.string()),
  createdAt: z.string().nonempty(),
  updatedAt: z.string().nonempty(),
});

export const PublicProductSchema = ProductSchema.omit({
  stock: true,
  createdAt: true,
  updatedAt: true,
});

export const SearchProductResponseSchema = z.object({
  products: z.array(PublicProductSchema),
  page: z.number().nonnegative(),
  perPage: z.number().nonnegative(),
  totalItems: z.number().nonnegative(),
  totalPages: z.number().nonnegative(),
})
  .strict();

export const QuickSearchResultSchema = z.object({
  data: z.array(
    z.object({
      id: z.uuid(),
      name: z.string().nonempty()
    })
  )
})
  .strict();
  
export const DeleteProductResponseSchema = z.object({
  deleted: z.uuid(),
});

export const GetCategoriesResponse = z.object({
  categories: z.array(z.string()),
})
  .strict();

export const PrivateProductSchema = ProductSchema;

export type PrivateProduct = z.infer<typeof PrivateProductSchema>;
export type PublicProduct = z.infer<typeof PublicProductSchema>;
export type SearchProductResponse = z.infer<typeof SearchProductResponseSchema>;
export type GetCategories = z.infer<typeof GetCategoriesResponse>;
export type QuickSearchResult = z.infer<typeof QuickSearchResultSchema>;
export type DeleteProductResponse = z.infer<typeof DeleteProductResponseSchema>;