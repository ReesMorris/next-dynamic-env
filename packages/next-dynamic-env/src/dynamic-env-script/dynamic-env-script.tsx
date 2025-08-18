import Script from 'next/script';
import type { EnvVars } from '../types';
import type { DynamicEnvScriptProps } from './dynamic-env-script.types';

/**
 * Injects environment variables into the client-side window object
 * Place this in your root layout or _app.tsx
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * import { DynamicEnvScript } from 'next-dynamic-env';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <head>
 *         <DynamicEnvScript env={RUNTIME_ENV} />
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
  // Warn in dev if vars are missing
  if (process.env.NODE_ENV === 'development' && onMissingVar) {
    Object.entries(env).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        onMissingVar(key);
      }
    });
  }

  // Filter out undefined values to reduce payload size and validate content
  const cleanEnv = Object.entries(env).reduce(
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
