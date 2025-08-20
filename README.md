# Next Dynamic Env

[![npm version](https://img.shields.io/npm/v/next-dynamic-env.svg)](https://www.npmjs.com/package/next-dynamic-env)
[![npm downloads](https://img.shields.io/npm/dm/next-dynamic-env.svg)](https://www.npmjs.com/package/next-dynamic-env)
[![license](https://img.shields.io/npm/l/next-dynamic-env.svg)](https://github.com/reesmorris/next-dynamic-env/blob/main/LICENSE)

Runtime environment variables for Next.js applications with safe server/client separation. Change your configuration without rebuilding your app!

**Security by Default**

This library enforces a strict separation between server and client environment variables. Variables marked as `server` will throw an error if accessed on the client in development, and return `undefined` in production. Only variables explicitly marked as `client` are exposed to the browser.

## Features

- 🚀 **Runtime Configuration** - Change environment variables without rebuilding
- 🔐 **Server/Client Separation** - Keep secrets safe with explicit separation
- 🔒 **Type Safety** - Full TypeScript support with autocompletion
- ✅ **Validator Agnostic** - Use Zod, Yup, Valibot, or any [standard-schema](https://github.com/standard-schema/standard-schema) compatible validator
- 🎯 **Universal** - Works with App Router, Pages Router, instrumentation, and middleware
- 🐳 **Docker Ready** - Perfect for containerized deployments
- ⏳ **Async Loading** - Wait for env vars in files that run before the script (e.g., instrumentation files)

## Installation

```bash
npm install next-dynamic-env
# or
yarn add next-dynamic-env
# or
pnpm add next-dynamic-env
# or
bun add next-dynamic-env
```

## Quick Start

### 1. Create your configuration

Call `createDynamicEnv` to define your environment variables. You can use any validator that supports [standard-schema](https://github.com/standard-schema/standard-schema) (Zod, Yup, Valibot, etc.) or no validation at all:

```typescript
// dynamic-env.ts
import { createDynamicEnv } from 'next-dynamic-env';
import { z } from 'zod';  // or import * as yup from 'yup', or any standard-schema validator

export const dynamicEnv = createDynamicEnv({
  client: {
    // With validation (type-safe)
    APP_NAME: [process.env.APP_NAME, z.string().min(1)],
    API_URL: [process.env.API_URL, z.string().url()],
    DEBUG: [process.env.DEBUG, z.coerce.boolean().default(false)],
    
    // Without validation (raw string | undefined)
    ANALYTICS_ID: process.env.ANALYTICS_ID,
  },
  server: {
    // Server variables (never exposed to browser)
    DATABASE_URL: [process.env.DATABASE_URL, z.string().url()],
    API_SECRET: [process.env.API_SECRET, z.string().min(32)],
    
    // Raw value without validation
    LOG_LEVEL: process.env.LOG_LEVEL,
  }
});
```

### 2. Add to your layout

Add the `DynamicEnvScript` to your root component.

#### App Router

```tsx
// app/layout.tsx
import { DynamicEnvScript } from 'next-dynamic-env';
import { dynamicEnv } from '../dynamic-env';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <DynamicEnvScript env={dynamicEnv} />
      </body>
    </html>
  );
}
```

#### Pages Router

```tsx
// pages/_app.tsx
import { DynamicEnvScript } from 'next-dynamic-env';
import { dynamicEnv } from '../dynamic-env';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <DynamicEnvScript env={dynamicEnv} />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
```

### 3. Use anywhere in your app

```tsx
// Any component (Server or Client)
import { dynamicEnv } from '../dynamic-env';

export function MyComponent() {
  return (
    <div>
      <h1>Welcome to {dynamicEnv.APP_NAME}</h1>
      <p>API: {dynamicEnv.API_URL}</p>
      {dynamicEnv.DEBUG && <DebugPanel />}
    </div>
  );
}
```

## Using in Client-Side Initialization

For code that runs only on the server (such as `instrumentation-client.ts`), use `waitForEnv`:

```typescript
// instrumentation-client.ts
import { waitForEnv } from 'next-dynamic-env';
import { dynamicEnv } from '../dynamic-env';

(async () => {
  await waitForEnv();

  // Initialize monitoring, analytics, etc.
  Sentry.init({
    dsn: dynamicEnv.SENTRY_DSN,
    tracesSampleRate: dynamicEnv.TRACES_SAMPLE_RATE,
  });
})();
```

## API Reference

### `createDynamicEnv(config)`

Creates a type-safe environment configuration with server/client separation.

#### Config Options
| Option | Required | Default | Description |
| ------ | -------- | ------- | ----------- |
| `client` | No | `{}` | Client-side environment variables (exposed to browser) |
| `server` | No | `{}` | Server-only environment variables (never exposed to browser) |
| `onValidationError` | No | `'throw'` | Error handling: `'throw'`, `'warn'`, or custom function |
| `skipValidation` | No | `false` | Skip validation (useful for build time) |
| `emptyStringAsUndefined` | No | `true` | Convert empty strings to undefined |

#### Entry Format

Each environment variable can be defined in three ways:

```typescript
const dynamicEnv = createDynamicEnv({
  client: {
    // 1. With validation - [value, schema]
    API_URL: [process.env.API_URL, z.string().url()],
    
    // 2. Without validation - raw value
    APP_NAME: process.env.APP_NAME,
    
    // 3. With transformation
    FEATURES: [
      process.env.FEATURES,
      z.string().transform(val => val.split(','))
    ],
  },
  server: {
    DATABASE_URL: [process.env.DATABASE_URL, z.string().url()],
    SECRET: process.env.SECRET,  // No validation
  },
  onValidationError: 'warn',
});
```

#### Server/Client Access Rules

- **On Server**: Both `server` and `client` variables are accessible
- **On Client**: 
  - `client` variables are accessible
  - `server` variables throw an error in development, return `undefined` in production

### `DynamicEnvScript`

React component that injects environment variables into the client.

#### Props
| Prop | Required | Default | Description |
| ---- | -------- | ------- | ----------- |
| `env` | Yes | - | The dynamic env object from `createDynamicEnv` |
| `onMissingVar` | No | - | Handler for missing required variables (dev only) |
| `id` | No | `next-dynamic-env-script` | Script element ID |

### `waitForEnv(options?)`

Waits for environment variables to be available.

Note this is usually not needed, since the `DynamicEnvScript` has a `beforeInteractive` strategy, but can be useful in scenarios
where you need to use environment variables before the script runs, such as in client instrumentation files.

```typescript
import { waitForEnv } from 'next-dynamic-env';

// Basic usage
await waitForEnv();

// With options
await waitForEnv({
  requiredKeys: ['API_URL', 'APP_NAME'],
  timeout: 5000,
  debug: true,
  onReady: (env) => {
    console.log('Environment loaded:', env);
  }
});
```

#### Options

| Option | Default | Description |
| ------ | ------- | ----------- |
| `timeout` | 5000 | Maximum wait time in ms |
| `interval` | 50 | Polling interval in ms |
| `requiredKeys` | - | Array of required environment variable keys |
| `validate` | - | Custom validation function |
| `retries` | 0 | Number of retry attempts |
| `debug` | - | Enable debug logging |

## Examples

Check out the [examples](./examples) directory:

- [App Router](./examples/with-app-router) - Next.js 15 with App Router
- [Pages Router](./examples/with-pages-router) - Next.js with Pages Router

## Using Different Validators

`next-dynamic-env` works with any validator that supports the [standard-schema](https://github.com/standard-schema/standard-schema) specification, including Zod, Yup, Valibot, and more.

### With Zod

```typescript
import { z } from 'zod';

export const dynamicEnv = createDynamicEnv({
  client: {
    API_URL: [process.env.API_URL, z.string().url()],
    PORT: [process.env.PORT, z.coerce.number().default(3000)],
  }
});
```

### With Yup

```typescript
import * as yup from 'yup';

export const dynamicEnv = createDynamicEnv({
  client: {
    API_URL: [process.env.API_URL, yup.string().url().required()],
    PORT: [process.env.PORT, yup.number().positive().default(3000)],
  }
});
```

### Mixed Validators

You can even mix different validators in the same configuration:

```typescript
import { z } from 'zod';
import * as yup from 'yup';

export const dynamicEnv = createDynamicEnv({
  client: {
    // Zod for URL validation
    API_URL: [process.env.API_URL, z.string().url()],
    
    // Yup for number validation
    TIMEOUT: [process.env.TIMEOUT, yup.number().min(1000).max(30000)],
    
    // No validation
    APP_NAME: process.env.APP_NAME,
  }
});
```

## Empty String Handling

By default, `next-dynamic-env` converts empty strings to `undefined` before validation. This prevents common issues with optional fields:

```typescript
// Environment: SENTRY_URL=""
const dynamicEnv = createDynamicEnv({
  client: {
    // Would fail with empty string without conversion
    SENTRY_URL: [process.env.SENTRY_URL, z.string().url().optional()],
  },
  // emptyStringAsUndefined: true (default)
});

// Result: dynamicEnv.SENTRY_URL === undefined ✅
```

You can disable this behavior if needed:

```typescript
const dynamicEnv = createDynamicEnv({
  client: {
    SENTRY_URL: [process.env.SENTRY_URL, z.string().optional()],
  },
  emptyStringAsUndefined: false, // Keep empty strings as-is
});
```

## Validation

Validation happens at runtime when environment variables are accessed:

```typescript
const dynamicEnv = createDynamicEnv({
  client: {
    // Client variables with validation
    API_URL: [process.env.API_URL, z.string().url('Invalid API URL')],
    TIMEOUT: [process.env.TIMEOUT, z.coerce.number().min(1000).max(30000)],
    FEATURES: [process.env.FEATURES, z.string().transform(val => val.split(','))],
  },
  server: {
    // Server variables with validation
    DATABASE_URL: [process.env.DATABASE_URL, z.string().url()],
    RETRY_COUNT: [process.env.RETRY_COUNT, z.coerce.number().int().positive()],
  },
  onValidationError: (error) => {
    console.error('Configuration error:', error);
    // In production, you might want to send to monitoring
  }
});
```

## Advanced Usage

### Transform Values

```typescript
const dynamicEnv = createDynamicEnv({
  client: {
    // Transform comma-separated string to array
    FEATURES: [process.env.FEATURES, z.string().transform(val => val.split(','))],
    
    // Parse JSON configuration
    CONFIG: [process.env.CONFIG, z.string().transform(val => JSON.parse(val))],
    
    // Convert to boolean
    MAINTENANCE_MODE: [process.env.MAINTENANCE_MODE, z.coerce.boolean()],
    
    // Default values
    TIMEOUT: [process.env.TIMEOUT, z.coerce.number().default(5000)],
  },
  server: {
    // Server-only with transform
    DB_POOL_SIZE: [process.env.DB_POOL_SIZE, z.coerce.number().default(10)],
  }
});
```

## How It Works

1. **Server-side**: Both `server` and `client` variables are accessible from `process.env`
2. **Build time**: No environment values are baked into the client bundle
3. **Runtime**: `DynamicEnvScript` injects only `client` variables into the window
4. **Client-side**: 
   - Client variables are read from the window object when available
   - Server variables throw errors in development, return `undefined` in production
5. **Type safety**: TypeScript provides full autocompletion and type checking

## Best Practices

### Security

- Use the `server` object for sensitive variables (API keys, secrets, database URLs)
- Use the `client` object only for public configuration
- The library enforces this separation - server variables cannot be accessed on the client

```typescript
// ✅ Correct: Secrets are kept in server object
createDynamicEnv({
  schema: z.object({
    API_URL: z.string().url(),
    APP_NAME: z.string(),
    DATABASE_URL: z.string(),
    API_SECRET: z.string(),
  }),
  client: {
    API_URL: process.env.API_URL,
    APP_NAME: process.env.APP_NAME,
  },
  server: {
    DATABASE_URL: process.env.DATABASE_URL,
    API_SECRET: process.env.API_SECRET,
  }
});

// ❌ Wrong: Never put secrets in client object
client: {
  DATABASE_URL: process.env.DATABASE_URL, // This would be exposed!
}
```

### Validation

Always validate configuration in production:

```typescript
const dynamicEnv = createDynamicEnv({
  schema: z.object({
    API_URL: z.string().url(),
    DATABASE_URL: z.string().url(),
  }),
  client: {
    API_URL: process.env.API_URL,
  },
  server: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
  onValidationError: (error) => {
    if (process.env.NODE_ENV === 'production') {
      // Log to monitoring service
      console.error('Invalid configuration:', error);
      // Optionally halt startup
      process.exit(1);
    }
  }
});
```

### Docker

Use `output: 'standalone'` in Next.js for optimized Docker images:

```javascript
// next.config.js
module.exports = {
  output: 'standalone'
};
```

Then run your container with environment variables at runtime:

```bash
docker run -p 3000:3000 --env-file .env.production myapp
```

## Migration from Traditional Env Vars

```typescript
// Before: Using process.env directly
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// After: Using next-dynamic-env
import { dynamicEnv } from './dynamic-env';
const apiUrl = dynamicEnv.API_URL;
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT