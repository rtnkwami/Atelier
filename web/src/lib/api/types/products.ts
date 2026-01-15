export type Product = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  stock: number;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type ProductResponse = {
  products: Product[];
  page: number;
  perPage: number;
  count: number;
  total: number;
  totalPages: number;
};