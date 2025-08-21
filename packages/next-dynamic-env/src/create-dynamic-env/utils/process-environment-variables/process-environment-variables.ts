import type { EnvEntry, ProcessedEnv, ValidationError } from '@/types';
import { processEnvEntry } from '../process-env-entry';

/**
 * Processes a set of environment variable entries and collects any validation errors.
 * Returns processed environment variables, raw values, and any validation errors.
 *
 * @param entries - Object containing environment variable entries
 * @param skipValidation - Whether to skip validation
 * @param emptyStringAsUndefined - Whether to treat empty strings as undefined
 * @returns Object containing processedEnv, rawEnv, and errors
 */
export const processEnvironmentVariables = (
  entries: Record<string, EnvEntry>,
  skipValidation: boolean,
  emptyStringAsUndefined: boolean
): {
  processedEnv: ProcessedEnv;
  rawEnv: ProcessedEnv;
  errors: ValidationError[];
} => {
  const processedEnv: ProcessedEnv = {};
  const rawEnv: ProcessedEnv = {};
  const errors: ValidationError[] = [];

  for (const [key, entry] of Object.entries(entries)) {
    try {
      // Store raw value
      rawEnv[key] = Array.isArray(entry) ? entry[0] : entry;

      processedEnv[key] = processEnvEntry(
        key,
        entry,
        emptyStringAsUndefined,
        skipValidation
      );
    } catch (error) {
      errors.push({ key, error });
    }
  }

  return { processedEnv, rawEnv, errors };
};
