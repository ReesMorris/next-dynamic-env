import { createDynamicEnv } from 'next-dynamic-env';
import z from 'zod';

export const dynamicEnv = createDynamicEnv({
  schema: z.object({
    // Client variables (public)
    APP_NAME: z.string().min(1, 'APP_NAME is required'),
    API_URL: z.string().url('API_URL must be a valid URL'),
    PORT: z.coerce.number().int().positive().default(3000),
    DEBUG: z.coerce.boolean().default(false),
    FEATURES: z
      .string()
      .optional()
      .transform(val => val?.split(',').filter(Boolean) ?? []),

    // Server variables (private) - example only, not used in this demo
    DATABASE_URL: z.string().optional(),
    SECRET_KEY: z.string().optional()
  }),
  client: {
    APP_NAME: process.env.APP_NAME,
    API_URL: process.env.API_URL,
    PORT: process.env.PORT,
    DEBUG: process.env.DEBUG,
    FEATURES: process.env.FEATURES
  },
  server: {
    // These would only be accessible on the server
    DATABASE_URL: process.env.DATABASE_URL,
    SECRET_KEY: process.env.SECRET_KEY
  }
});
