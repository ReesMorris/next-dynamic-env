import type { DynamicEnv, EnvVars } from '../types';

export interface DynamicEnvScriptProps<T = EnvVars> {
  /**
   * The ID of the script tag
   * @default 'next-dynamic-env-script'
   */
  id?: string;

  /**
   * The environment variables object to inject into the client.
   * Can be either a plain object or the result of createDynamicEnv()
   */
  env: DynamicEnv<T> | T | EnvVars;

  /**
   * Optional callback for missing variables (only called in development)
   * @param key - The name of the missing variable
   */
  onMissingVar?: (key: string) => void;

  /**
   * Optional custom variable name for the global object
   * @default '__NEXT_DYNAMIC_ENV__'
   */
  varName?: string;
}
