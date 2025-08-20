import type { ClientEnv, ProcessedEnv } from '../types';

export interface DynamicEnvScriptProps<T extends ProcessedEnv = ProcessedEnv> {
  /**
   * The ID of the script tag
   * @default 'next-dynamic-env-script'
   */
  id?: string;

  /**
   * The client environment object from createDynamicEnv.
   * This ensures only client-safe variables are exposed to the browser.
   *
   * @example
   * ```tsx
   * const { clientEnv } = createDynamicEnv({ ... });
   * <DynamicEnvScript env={clientEnv} />
   * ```
   */
  clientEnv: ClientEnv<T>;

  /**
   * Optional callback for missing variables (only called in development)
   * @param key - The name of the missing variable
   */
  onMissingVar?: (key: string) => void;
}
