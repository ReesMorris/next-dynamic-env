import Script from 'next/script';
import { DEFAULT_WINDOW_ENV_VAR_NAME } from '../constants';
import type { DynamicEnv, EnvVars } from '../types';
import type { DynamicEnvScriptProps } from './dynamic-env-script.types';

/**
 * Injects environment variables into the client-side window object
 * Place this in your root layout or _app.tsx
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * import { dynamicEnv } from '@/dynamic-env';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html lang='en'>
 *       <body>
 *         {children}
 *         <DynamicEnvScript env={dynamicEnv} />
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function DynamicEnvScript<T = EnvVars>({
  id = 'next-dynamic-env-script',
  env,
  onMissingVar
}: DynamicEnvScriptProps<T>) {
  // Extract raw values if env is from createDynamicEnv, otherwise use as-is
  const rawEnv = (
    env && typeof env === 'object' && '__raw' in env
      ? (env as DynamicEnv<unknown>).__raw
      : env
  ) as Record<string, unknown>;

  // Warn in dev if vars are missing
  if (process.env.NODE_ENV === 'development' && onMissingVar && rawEnv) {
    Object.entries(rawEnv).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        onMissingVar(key);
      }
    });
  }

  // Filter out undefined values to reduce payload size and validate content
  const cleanEnv = Object.entries(rawEnv).reduce(
    (acc, [key, value]) => {
      if (value !== undefined) {
        // Ensure value is a string and doesn't contain script tags
        const stringValue = String(value);
        if (stringValue.includes('</script>')) {
          console.warn(
            `[next-dynamic-env] Env var "${key}" contains </script> tag and was filtered out`
          );
          return acc;
        }
        acc[key] = stringValue;
      }
      return acc;
    },
    {} as Record<string, string>
  );

  return (
    <Script id={id} strategy='beforeInteractive'>
      {`window.${DEFAULT_WINDOW_ENV_VAR_NAME} = ${JSON.stringify(cleanEnv)};`}
    </Script>
  );
}
