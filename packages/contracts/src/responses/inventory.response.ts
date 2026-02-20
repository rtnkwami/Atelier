export type Product = {
    id: string;
    name: string;
    description?: string | undefined;
    category: string;
    price: number;
    stock: number;
    images?: string[] | undefined;
    createdAt: string;
    updatedAt: string;
}

export type CreateProductResponse = Promise<Product>;

export type SearchProductResponse = Promise<{
  products: {
    id: string,
    name: string,
    description: string | undefined,
    category: string,
    price: number,
  }[],
  page: number,
  perPage: number,
  totalItems: number,
  totalPages: number,
}>;

type ProductWithoutTimestamps = Omit<Product, 'createdAt' | 'updatedAt'>

export type GetProductResponse = Promise<ProductWithoutTimestamps>;

export type UpdateProductResponse = Promise<ProductWithoutTimestamps>;

export type DeleteProductResponse = Promise<{ deleted: string }>