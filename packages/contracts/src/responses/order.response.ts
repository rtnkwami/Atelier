import { OrderStatus } from "../orders";

export type CreateOrderResponse = {
  id: string,
  total: number,
  status: OrderStatus,
  createdAt: string,
}

export type SearchOrdersResponse = Promise<{
  orders: {
    id: string;
    status: OrderStatus;
    total: number;
    createdAt: string;
  }[];
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
}>