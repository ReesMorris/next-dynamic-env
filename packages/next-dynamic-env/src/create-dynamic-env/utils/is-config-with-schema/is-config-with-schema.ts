import type { CreateDynamicEnvConfig } from '@/create-dynamic-env';
import type z from 'zod';

/**
 * Type guard to determine if a value is a configuration object with Zod schema validation.
 *
 * This function checks whether the provided value conforms to the structure expected
 * for a `CreateDynamicEnvConfig`, which requires a `schema` property.
 *
 * @template T - The Zod schema type, must extend `z.ZodObject`
 *
 * @param value - The value to check, typically the first argument to `createDynamicEnv`
 *
 * @returns `true` if the value is an object with a `schema` property,
 * indicating it should be processed as a Zod-validated configuration.
 * `false` otherwise.
 *
 * @remarks
 * - This is a runtime type guard that enables TypeScript's type narrowing
 * - Only checks for the presence of `schema` key, not its value
 * - Returns `false` for `null`, `undefined`, primitives, arrays, and other non-objects
 */
export const isConfigWithSchema = <T extends z.ZodObject>(
  value: unknown
): value is CreateDynamicEnvConfig<T> => {
  return typeof value === 'object' && value !== null && 'schema' in value;
};
