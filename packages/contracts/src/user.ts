import { z } from 'zod';

export const CreateUserSchema = z.object({
  sub: z.string().nonempty(),
  email: z.email(),
  avatar: z.url({ protocol: /^http(s)?$/ }).optional()
})
  .strict();
export type CreateUser = z.infer<typeof CreateUserSchema>;