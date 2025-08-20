import type { CreateDynamicEnvConfig } from '@/create-dynamic-env';
import type z from 'zod';

/**
 * Type guard to determine if a value is a configuration object with Zod schema validation.
 *
 * This function checks whether the provided value conforms to the structure expected
 * for a `CreateDynamicEnvConfig`, which requires both a `schema` and `runtimeEnv` property.
 * It's used internally by `createDynamicEnv` to determine whether to use the simple
 * environment variables pattern or the advanced Zod validation pattern.
 *
 * @template T - The Zod schema type, must extend `z.ZodObject`
 *
 * @param value - The value to check, typically the first argument to `createDynamicEnv`
 *
 * @returns `true` if the value is an object with both `schema` and `runtimeEnv` properties,
 * indicating it should be processed as a Zod-validated configuration.
 * `false` otherwise, indicating it should be treated as simple environment variables.
 *
 * @remarks
 * - This is a runtime type guard that enables TypeScript's type narrowing
 * - Only checks for the presence of `schema` and `runtimeEnv` keys, not their values
 * - Returns `false` for `null`, `undefined`, primitives, arrays, and other non-objects
 */
export const isConfigWithSchema = <T extends z.ZodObject>(
  value: unknown
): value is CreateDynamicEnvConfig<T> => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'schema' in value &&
    'runtimeEnv' in value
  );
};
