import { z } from 'zod';

const environmentVariablesSchema = z.object({
  PORT: z.coerce.number().min(0).max(65535).optional(),
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
  // NATS_ENDPOINT: z.string().nonempty(),
  REDIS_ENDPOINT: z.url({ protocol: /^redis$/ }),
});

export function validate(config: Record<string, unknown>) {
  const validationResult = environmentVariablesSchema.safeParse(config);

  if (validationResult.error) {
    const errors = z.flattenError(validationResult.error);
    throw new Error(JSON.stringify(errors, null, 2));
  }
  return validationResult.data;
}
