import type { StandardSchemaV1 } from '@standard-schema/spec';

/**
 * Formats standard-schema validation issues into a readable error message.
 *
 * This function extracts and formats error messages from standard-schema
 * validation issues. It handles both single and multiple validation failures,
 * creating a concise, readable error message suitable for display.
 *
 * @param issues - Array of validation issues from standard-schema validators
 * @returns A formatted error message string
 *
 * @remarks
 * - Single issues are returned directly without numbering
 * - Multiple issues are numbered starting from 1 and joined with commas
 * - Non-array inputs return a generic "Validation failed" message
 * - Compatible with any standard-schema compliant validator (Zod, Yup, Valibot, etc.)
 *
 * @see {@link https://github.com/standard-schema/standard-schema} for standard-schema specification
 */
export const formatValidationIssues = (
  issues: Readonly<StandardSchemaV1.Issue[]>
): string => {
  // Make sure the issues are an array
  if (!Array.isArray(issues)) {
    return 'Validation failed';
  }

  // Get the messages from the issues
  const messages = issues.map<StandardSchemaV1.Issue['message']>(issue => {
    return issue.message;
  });

  // If there's only one issue, return it directly
  if (messages.length === 1) {
    return messages[0];
  }

  // Otherwise, format the issues with their indices (1-based)
  return messages.map((msg, i) => `${i + 1}. ${msg}`).join(', ');
};
