/**
 * Represents the reasons why environment validation might fail.
 */
export type ValidationFailureReason =
  | 'NOT_LOADED'
  | 'MISSING_KEYS'
  | 'CUSTOM_VALIDATION_FAILED';

/**
 * Represents the result of environment validation.
 */
export type EnvironmentValidationResult =
  | {
      /**
       * Indicates whether the environment is valid.
       */
      isValid: true;
    }
  | {
      /**
       * Indicates whether the environment is valid.
       */
      isValid: false;

      /**
       * The reason for the validation failure.
       */
      reason: ValidationFailureReason;

      /**
       * The list of missing environment keys
       */
      missingKeys?: string[];
    };
