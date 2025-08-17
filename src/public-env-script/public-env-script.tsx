import Script from 'next/script';
import React from 'react';
import type { EnvVars } from '../types';
import type { PublicEnvScriptProps } from './public-env-script.types';

/**
 * Injects environment variables into the client-side window object
 * Place this in your root layout or _app.tsx
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * import { PublicEnvScript } from 'next-public-env';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <head>
 *         <PublicEnvScript env={PUBLIC_ENV} />
 *       </head>
 *       <body>{children}</body>
 *     </html>
 *   );
 * }
 * ```
 */
export function PublicEnvScript<T extends EnvVars = EnvVars>({
  id = 'next-public-env-script',
  env,
  onMissingVar,
  varName = '__ENV__'
}: PublicEnvScriptProps<T>) {
  // Warn in dev if vars are missing
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development' && onMissingVar) {
      Object.entries(env).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          onMissingVar(key);
        }
      });
    }
  }, [env, onMissingVar]);

  // Filter out undefined values to reduce payload size
  const cleanEnv = Object.entries(env).reduce(
    (acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
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
