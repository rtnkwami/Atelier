import { z } from "zod";
import { OrderStatus } from "../orders.js";

export const CreateOrderResponseSchema = z.object({
  id: z.uuid(),
  total: z.number().positive(),
  status: z.enum(OrderStatus),
  createdAt: z.string(),
});

export const SearchOrdersResponseSchema = z.object({
  orders: z.array(
    z.object({
      id: z.uuid(),
      status: z.enum(OrderStatus),
      total: z.number(),
      createdAt: z.string(),
    })
  ),
  page: z.number(),
  perPage: z.number(),
  totalItems: z.number(),
  totalPages: z.number(),
});

export type CreateOrderResponse = z.infer<typeof CreateOrderResponseSchema>;

export type SearchOrdersResponse = Promise<z.infer<typeof SearchOrdersResponseSchema>>;