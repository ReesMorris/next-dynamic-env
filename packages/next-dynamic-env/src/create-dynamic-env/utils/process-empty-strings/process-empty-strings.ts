/**
 * Processes an object containing environment variables and converts empty strings to undefined.
 * This helps prevent validation errors for optional fields that receive empty strings.
 *
 * @param obj - Object containing environment variable key-value pairs
 *
 * @returns A new object with empty strings replaced by undefined
 */
export const processEmptyStrings = <
  T extends Record<string, string | undefined>
>(
  obj: T
): T => {
  const result = { ...obj };

  for (const key in result) {
    if (result[key] === '') {
      result[key] = undefined as T[typeof key];
    }
  }

  return result;
};
