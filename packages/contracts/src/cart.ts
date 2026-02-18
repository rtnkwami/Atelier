import { z } from 'zod';

const CartItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  price: z.number().positive(),
  quantity: z.number().positive(),
  image: z.string().url(),
});

export const CreateCartSchema = z.object({
  items: z.array(CartItemSchema),
});

export type Cart = z.infer<typeof CreateCartSchema>;