import type z from 'zod';

/**
 * Check if an object is a Zod schema
 * @param obj - The object to check
 * @returns `true` if the object is a Zod schema, `false` otherwise
 */
export const isZodSchema = (
  obj: unknown
): obj is z.ZodObject<z.ZodRawShape> => {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    (('_def' in obj &&
      (obj as { _def?: { type?: string } })._def?.type === 'object') ||
      ('def' in obj &&
        (obj as { def?: { type?: string } }).def?.type === 'object'))
  );
};

/**
 * Helper type to check if a type is a Zod schema
 */
export type IsZodSchema<T> = T extends z.ZodObject<z.ZodRawShape>
  ? true
  : false;
