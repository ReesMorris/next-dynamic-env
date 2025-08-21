import { createDynamicEnv } from 'next-dynamic-env';
import { number, string } from 'yup';
import { z } from 'zod';

/**
 * Example showing mixed validators in the same configuration
 * You can use Zod, Yup, or no validation - all in the same config!
 */
export const dynamicEnvMixed = createDynamicEnv({
  client: {
    // Zod for URL validation
    API_URL: [process.env.API_URL, z.string().url()],

    // Yup for number validation
    TIMEOUT: [process.env.TIMEOUT, number().min(1000).max(30000).required()],

    // No validation - raw string
    ENVIRONMENT: process.env.NODE_ENV,

    // Zod with transformation
    ENABLED_FEATURES: [
      process.env.ENABLED_FEATURES,
      z.string().transform(str => new Set(str?.split(',') ?? []))
    ]
  },

  server: {
    // Yup for database URL
    DATABASE_URL: [process.env.DATABASE_URL, string().url().required()],

    // Zod for API key validation
    API_KEY: [process.env.API_KEY, z.string().min(32)],

    // No validation
    LOG_LEVEL: process.env.LOG_LEVEL,

    // Yup with custom validation
    RATE_LIMIT: [
      process.env.RATE_LIMIT,
      number().test(
        'is-valid-rate',
        'Rate must be between 1 and 1000',
        value => value !== undefined && value >= 1 && value <= 1000
      )
    ]
  },

  // Configuration options work the same
  onValidationError: 'warn',
  emptyStringAsUndefined: true
});
