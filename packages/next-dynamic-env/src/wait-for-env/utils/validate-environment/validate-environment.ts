import { checkRequiredKeys } from '../check-required-keys';
import type { EnvironmentValidationResult } from './validate-environment.types';

/**
 * Validates an environment object against requirements
 *
 * @param env - The environment object to validate
 * @param requiredKeys - Array of keys that must be present
 * @param customValidate - Optional custom validation function
 * @returns Validation result with details about any failures
 */
export const validateEnvironment = <T = unknown>(
  env: T | undefined,
  requiredKeys: string[] = [],
  customValidate?: (env: T) => boolean
): EnvironmentValidationResult => {
  // Check if environment is loaded
  if (!env) {
    return {
      isValid: false,
      reason: 'NOT_LOADED'
    };
  }

  // Check for required keys
  if (requiredKeys.length > 0) {
    const missingKeys = checkRequiredKeys(env, requiredKeys);
    if (missingKeys.length > 0) {
      return {
        isValid: false,
        reason: 'MISSING_KEYS',
        missingKeys
      };
    }
  }

  // Run custom validation if provided
  if (customValidate) {
    try {
      if (!customValidate(env)) {
        return {
          isValid: false,
          reason: 'CUSTOM_VALIDATION_FAILED'
        };
      }
    } catch {
      // Treat validation errors as failures
      return {
        isValid: false,
        reason: 'CUSTOM_VALIDATION_FAILED'
      };
    }
  }

  // All validations passed
  return {
    isValid: true
  };
};
