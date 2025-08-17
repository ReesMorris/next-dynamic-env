import type { EnvVars } from '../types';

export interface PublicEnvScriptProps<T extends EnvVars = EnvVars> {
  /**
   * The ID of the script tag
   * @default 'next-public-env-script'
   */
  id?: string;

  /**
   * The environment variables object to inject into the client
   */
  env: T;

  /**
   * Optional callback for missing variables (only called in development)
   * @param key - The name of the missing variable
   */
  onMissingVar?: (key: string) => void;

  /**
   * Optional custom variable name for the global object
   * @default '__ENV__'
   */
  varName?: string;
}
