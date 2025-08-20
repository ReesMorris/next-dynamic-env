import type { StandardSchemaV1 } from '@standard-schema/spec';

/**
 * Processed environment variables (after validation/transformation)
 */
export type ProcessedEnv = Record<string, unknown>;

/**
 * Represents a validation error for an environment variable
 */
export type ValidationError = {
  /** The environment variable key that failed validation */
  key: string;
  /** The error that occurred during validation */
  error: unknown;
};

/**
 * Client environment variable object with raw values
 */
export type ClientEnv<T> = Readonly<T> & {
  readonly __raw: ProcessedEnv;
  readonly __isClient: true;
};

/**
 * Server environment variable object with raw values
 */
export type ServerEnv<T> = Readonly<T> & {
  readonly __raw: ProcessedEnv;
  readonly __isServer: true;
};

/**
 * Return type of createDynamicEnv with separate client and server environments
 */
export type DynamicEnvResult<TClient, TServer> = {
  /** Client-only environment variables (safe for browser) */
  readonly clientEnv: ClientEnv<TClient>;
  /** Server-only environment variables (never exposed to browser) */
  readonly serverEnv: ServerEnv<TServer>;
};

/**
 * Defines behavior when validation fails.
 * - 'throw': Throws an error on validation failure
 * - 'warn': Logs a warning on validation failure
 * - Function: Custom handler for validation errors
 */
export type OnValidationError = 'throw' | 'warn' | ((error: unknown) => void);

/**
 * Entry in the environment config - can be:
 * - A raw value (string | undefined)
 * - A tuple of [value, schema] for validation
 * - A tuple of [value] with no validation
 */
export type EnvEntry<T = unknown> =
  | string
  | undefined
  | readonly [string | undefined]
  | readonly [string | undefined, StandardSchemaV1<unknown, T>]
  | readonly [string | undefined, undefined];

/**
 * Infer the type from an environment entry
 */
export type InferEnvEntry<T> = T extends readonly [
  unknown,
  StandardSchemaV1<unknown, infer Output>
]
  ? Output
  : T extends readonly [infer Value, undefined]
    ? Value
    : T extends readonly [infer Value]
      ? Value
      : T extends string | undefined
        ? T
        : unknown;

/**
 * Infer types for an entire environment config
 */
export type InferEnvConfig<T extends Record<string, EnvEntry>> = {
  [K in keyof T]: InferEnvEntry<T[K]>;
};
