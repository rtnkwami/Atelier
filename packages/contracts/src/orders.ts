import { z } from 'zod';

export enum OrderStatus {
  PENDING_PAYMENT = 'pending_payment',
  PAID = 'paid',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export const OrderPaymentUpdateSchema = z.object({
  status: z.enum([OrderStatus.PAID, OrderStatus.PENDING_PAYMENT])
})
  .strict();
export type OrderPaymentStatus = z.infer<typeof OrderPaymentUpdateSchema>;

export const OrdersSearchSchema = z.object({
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  status: z.enum(OrderStatus).optional(),
  page: z.number().positive().default(1),
  limit: z.number().positive().default(20),
})
  .strict();
export type SearchOrders = z.infer<typeof OrdersSearchSchema>;