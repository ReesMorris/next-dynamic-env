import type { z } from 'zod';

export interface CreateDynamicEnvOptions {
  /**
   * Custom variable name for the global object
   * @default '__NEXT_DYNAMIC_ENV__'
   */
  varName?: string;
}

/**
 * Configuration for createDynamicEnv with Zod schema
 */
export interface CreateDynamicEnvConfig<T extends z.ZodObject<z.ZodRawShape>> {
  /**
   * Zod schema for validating environment variables
   */
  schema: T;

  /**
   * Runtime environment variables to validate and use
   */
  runtimeEnv: Record<string, string | undefined>;

  /**
   * How to handle validation errors
   * - 'throw': Throw an error (default in development)
   * - 'warn': Log a warning and continue (default in production)
   * - function: Custom error handler
   */
  onValidationError?: 'throw' | 'warn' | ((errors: z.ZodError) => void);

  /**
   * Custom variable name for the global object
   * @default '__NEXT_DYNAMIC_ENV__'
   */
  varName?: string;

  /**
   * Whether to skip validation (useful for testing)
   * @default false
   */
  skipValidation?: boolean;
}
