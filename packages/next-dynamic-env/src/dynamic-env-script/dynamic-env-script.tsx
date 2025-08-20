import Script from 'next/script';
import { DEFAULT_WINDOW_ENV_VAR_NAME } from '../constants';
import type { ProcessedEnv } from '../types';
import type { DynamicEnvScriptProps } from './dynamic-env-script.types';

/**
 * Injects client-safe environment variables into the browser's window object.
 * Only accepts client environment variables to prevent server secrets from being exposed.
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * import { clientEnv } from '@/env';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html lang='en'>
 *       <body>
 *         {children}
 *         <DynamicEnvScript env={clientEnv} />
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function DynamicEnvScript<T extends ProcessedEnv = ProcessedEnv>({
  id = 'next-dynamic-env-script',
  env,
  onMissingVar
}: DynamicEnvScriptProps<T>) {
  // Extract values from ClientEnv proxy (excluding special properties)
  const clientEnv: ProcessedEnv = {};
  for (const key of Object.keys(env)) {
    if (key !== '__raw' && key !== '__isClient') {
      clientEnv[key] = env[key as keyof T];
    }
  }

  // Warn in dev if vars are missing
  if (process.env.NODE_ENV === 'development' && onMissingVar && clientEnv) {
    Object.entries(clientEnv).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        onMissingVar(key);
      }
    });
  }

  // Serialize the processed client environment values for injection
  const cleanEnv = Object.entries(clientEnv).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      // For security, check if stringified value contains </script>
      const stringified = JSON.stringify(value);
      if (stringified.includes('</script>')) {
        console.warn(
          `[next-dynamic-env] Env var "${key}" contains </script> tag and was filtered out`
        );
        return acc;
      }
      // Keep the processed value (could be string, number, boolean, array, etc.)
      acc[key] = value;
    }
    return acc;
  }, {} as ProcessedEnv);

  return (
    <Script id={id} strategy='beforeInteractive'>
      {`window.${DEFAULT_WINDOW_ENV_VAR_NAME} = ${JSON.stringify(cleanEnv)};`}
    </Script>
  );
}
