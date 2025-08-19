/**
 * Safely retrieves an environment variable from the window object
 *
 * @param varName - The name of the global variable to retrieve
 * @returns The environment object if found, undefined otherwise
 */
export const getWindowEnv = <T = unknown>(varName: string): T | undefined => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return undefined;
  }

  // Safely access the window property
  try {
    // biome-ignore lint/suspicious/noExplicitAny: The variable may or may not exist
    return (window as any)[varName] as T | undefined;
  } catch {
    // In case of any access errors, return undefined
    return undefined;
  }
};
