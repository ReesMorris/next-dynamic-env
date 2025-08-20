import type { z } from 'zod';

/**
 * Format Zod errors into a readable message
 * @param error - The Zod error to format
 * @returns A formatted error message
 */
export const formatZodError = (error: z.ZodError): string => {
  if (!error.issues || !Array.isArray(error.issues)) {
    return `❌ Environment validation failed: ${String(error)}`;
  }

  const issues = error.issues.map((issue: z.core.$ZodIssue) => {
    const path = issue.path?.join('.') || 'unknown';
    const message = issue.message || 'validation failed';

    return `  ${path}: ${message}`;
  });

  return `❌ Environment validation failed:\n\n${issues.join('\n')}\n`;
};
