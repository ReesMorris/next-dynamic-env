import { createDynamicEnv } from 'next-dynamic-env';
import { boolean, number, string } from 'yup';

/**
 * Example using Yup instead of Zod for validation
 * Yup also supports the standard-schema specification
 */
export const dynamicEnvYup = createDynamicEnv({
  client: {
    // With Yup validation
    API_URL: [process.env.API_URL, string().url().required()],

    // Number with Yup
    PORT: [process.env.PORT, number().positive().integer().default(3000)],

    // Boolean with Yup
    DEBUG: [process.env.DEBUG, boolean().default(false)],

    // Array transformation with Yup
    FEATURES: [
      process.env.FEATURES,
      string()
        .transform(val => val?.split(',').filter(Boolean) ?? [])
        .default('')
    ],

    // Mixed validators - you can mix Zod and Yup in the same config!
    // This one uses no validation
    APP_VERSION: process.env.APP_VERSION
  },

  server: {
    // Server-only with Yup validation
    DATABASE_URL: [process.env.DATABASE_URL, string().url().required()],

    // Email validation with Yup
    ADMIN_EMAIL: [process.env.ADMIN_EMAIL, string().email()],

    // Number range with Yup
    POOL_SIZE: [process.env.POOL_SIZE, number().min(1).max(100).default(10)],

    // No validation
    SECRET_TOKEN: process.env.SECRET_TOKEN
  }
});
