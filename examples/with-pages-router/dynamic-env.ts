import { createDynamicEnv } from 'next-dynamic-env';
import { z } from 'zod';

export const dynamicEnv = createDynamicEnv({
  client: {
    APP_NAME: [process.env.APP_NAME, z.string().min(1, 'APP_NAME is required')],
    API_URL: [
      process.env.API_URL,
      z.string().url('API_URL must be a valid URL')
    ],
    PORT: [process.env.PORT, z.coerce.number().int().positive().default(3000)],
    DEBUG: [process.env.DEBUG, z.coerce.boolean().default(false)],
    FEATURES: [
      process.env.FEATURES,
      z
        .string()
        .optional()
        .transform(val => val?.split(',').filter(Boolean) ?? [])
    ]
  },
  server: {
    // These would only be accessible on the server
    DATABASE_URL: process.env.DATABASE_URL, // No validation
    SECRET_KEY: process.env.SECRET_KEY // No validation
  }
});
