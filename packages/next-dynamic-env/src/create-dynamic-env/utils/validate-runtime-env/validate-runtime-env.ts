import { validateWithZod } from '@/validation';
import type { ValidateRuntimeEnvOptions } from './validate-runtime-env.types';

/**
 * Validates runtime environment variables against a Zod schema.
 *
 * This function provides runtime validation for environment variables,
 * ensuring they meet the expected types and constraints defined in the schema.
 * It supports type coercion, transformations, and custom error handling.
 *
 * @param options - Configuration options for validation
 *
 * @returns The validated and transformed environment variables according to the schema
 *
 * @throws When validation fails and `onValidationError` is `'throw'`
 */
export const validateRuntimeEnv = ({
  schema,
  runtimeEnv,
  onValidationError,
  skipValidation = false
}: ValidateRuntimeEnvOptions): Record<string, unknown> => {
  if (skipValidation) {
    return runtimeEnv;
  }

  return validateWithZod(schema, runtimeEnv, onValidationError);
};
