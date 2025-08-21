import type { StandardSchemaV1 } from '@standard-schema/spec';

/**
 * Applies schema transformations without throwing validation errors.
 *
 * This function is used during build phase where environment variables might not be present,
 * but we still want to apply transformations like default values and type conversions.
 *
 * @param value - The value to transform (may be undefined)
 * @param schema - A standard-schema compatible validator instance
 * @returns The transformed value, or the original value if transformation fails
 */
export const applyTransformWithoutValidation = (
  value: unknown,
  schema: StandardSchemaV1<unknown, unknown>
): unknown => {
  try {
    const result = schema['~standard'].validate(value);

    // Handle async validation (not supported)
    if (result instanceof Promise) {
      return value;
    }

    // Return transformed value if available, even if there are issues
    if ('value' in result) {
      return result.value;
    }

    return value;
  } catch {
    // If transformation fails, return original value
    return value;
  }
};
