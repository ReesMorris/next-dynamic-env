import { createDynamicEnv } from 'next-dynamic-env';
import { z } from 'zod';

/**
 * Example showing various validation approaches:
 * 1. With Zod validation (type-safe)
 * 2. Without validation (raw values)
 * 3. Complex transformations
 */
export const { clientEnv, serverEnv } = createDynamicEnv({
  client: {
    // With Zod validation and transformation
    API_URL: [process.env.API_URL, z.url('API_URL must be a valid URL')],
    PORT: [process.env.PORT, z.coerce.number().int().positive().default(3000)],

    // Boolean coercion
    DEBUG: [process.env.DEBUG, z.coerce.boolean().default(false)],

    // Complex transformation - comma-separated list to array
    FEATURES: [
      process.env.FEATURES,
      z
        .string()
        .optional()
        .transform(val => val?.split(',').filter(Boolean) ?? [])
    ],

    // No validation - just raw string
    APP_NAME: process.env.APP_NAME,

    // Optional with validation
    ANALYTICS_ID: [process.env.ANALYTICS_ID, z.string().optional()]
  },

  server: {
    // Server-only with validation
    DATABASE_URL: [process.env.DATABASE_URL, z.url()],

    // Server-only without validation
    SECRET_KEY: process.env.SECRET_KEY,

    // Number validation
    MAX_CONNECTIONS: [
      process.env.MAX_CONNECTIONS,
      z.coerce.number().default(10)
    ],

    // JSON parsing
    CONFIG: [
      process.env.CONFIG,
      z.string().transform(val => {
        try {
          return JSON.parse(val);
        } catch {
          return {};
        }
      })
    ]
  }
});
