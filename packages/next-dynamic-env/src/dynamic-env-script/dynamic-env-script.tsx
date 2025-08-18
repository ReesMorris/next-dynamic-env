import Script from 'next/script';
import type { EnvVars } from '../types';
import type { DynamicEnvScriptProps } from './dynamic-env-script.types';

// Internal type for the proxy with __raw property
type WithRaw<T> = T & { __raw: T };

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
 *       <head>
 *         <DynamicEnvScript env={dynamicEnv} />
 *       </head>
 *       <body>{children}</body>
 *     </html>
 *   );
 * }
 * ```
 */
export function DynamicEnvScript<T extends EnvVars = EnvVars>({
  id = 'next-dynamic-env-script',
  env,
  onMissingVar,
  varName = '__NEXT_DYNAMIC_ENV__'
}: DynamicEnvScriptProps<T>) {
  // Extract raw values if env is from createDynamicEnv, otherwise use as-is
  // We use type assertion here since __raw is hidden from the public type
  const rawEnv = '__raw' in env ? (env as WithRaw<T>).__raw : env;

  // Warn in dev if vars are missing
  if (process.env.NODE_ENV === 'development' && onMissingVar) {
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
    <Script
      id={id}
      strategy='beforeInteractive'
      // biome-ignore lint/security/noDangerouslySetInnerHtml: This is safe because we control the content
      dangerouslySetInnerHTML={{
        __html: `window.${varName} = ${JSON.stringify(cleanEnv)};`
      }}
    />
  );
}
