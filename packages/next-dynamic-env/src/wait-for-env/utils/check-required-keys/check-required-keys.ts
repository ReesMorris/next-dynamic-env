/**
 * Checks if all required keys are present in the environment object
 *
 * @param env - The environment object to check
 * @param requiredKeys - Array of keys that must be present
 * @returns Array of missing keys, empty if all keys are present
 */
export const checkRequiredKeys = (
  env: unknown,
  requiredKeys: string[]
): string[] => {
  // If no required keys specified, nothing is missing
  if (!requiredKeys || requiredKeys.length === 0) {
    return [];
  }

  // If env is not an object or is null/undefined, all keys are missing
  if (!env || typeof env !== 'object') {
    return requiredKeys;
  }

  const envKeys = Object.keys(env);
  return requiredKeys.filter(key => !envKeys.includes(key));
};
