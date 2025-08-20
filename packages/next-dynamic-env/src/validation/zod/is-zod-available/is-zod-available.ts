/**
 * Check if Zod is available in the current environment
 * @returns `true` if Zod is available, `false` otherwise
 */
export const isZodAvailable = (): boolean => {
  try {
    require.resolve('zod');
    return true;
  } catch {
    return false;
  }
};
