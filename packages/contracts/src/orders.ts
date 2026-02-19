import { z } from 'zod';

enum OrderStatus {
  PENDING_PAYMENT = 'pending_payment',
  PAID = 'paid',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export const OrdersSearchSchema = z.object({
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  status: z.enum(OrderStatus).optional(),
  page: z.number().positive().default(1),
  limit: z.number().positive().default(20),
});
export type SearchOrders = z.infer<typeof OrdersSearchSchema>;