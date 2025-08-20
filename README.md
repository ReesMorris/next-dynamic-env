# Next Dynamic Env

Runtime environment variables for Next.js applications with safe server/client separation. Change your configuration without rebuilding your app!

## Features

- 🚀 **Runtime Configuration** - Change environment variables without rebuilding
- 🔐 **Server/Client Separation** - Keep secrets safe with explicit separation
- 🔒 **Type Safety** - Full TypeScript support with autocompletion
- ✅ **Validation** - Required Zod schema validation for runtime safety
- 🎯 **Universal** - Works with App Router, Pages Router, instrumentation, and middleware
- 🐳 **Docker Ready** - Perfect for containerized deployments
- ⏳ **Async Loading** - Wait for env vars in files that run before the script (e.g., instrumentation files)

> [!WARNING]
> **Security by Default**
> 
> This library enforces a strict separation between server and client environment variables. Variables marked as `server` will throw an error if accessed on the client in development, and return `undefined` in production. Only variables explicitly marked as `client` are exposed to the browser.

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

```typescript
// dynamic-env.ts
import { createDynamicEnv } from 'next-dynamic-env';
import { z } from 'zod';

export const dynamicEnv = createDynamicEnv({
  schema: z.object({
    // Client variables (exposed to browser)
    APP_NAME: z.string().min(1, 'APP_NAME is required'),
    API_URL: z.string().url('API_URL must be a valid URL'),
    DEBUG: z.coerce.boolean().default(false),
    
    // Server variables (never exposed to browser)
    DATABASE_URL: z.string().url(),
    API_SECRET: z.string().min(32),
  }),
  client: {
    APP_NAME: process.env.APP_NAME,
    API_URL: process.env.API_URL,
    DEBUG: process.env.DEBUG,
  },
  server: {
    DATABASE_URL: process.env.DATABASE_URL,
    API_SECRET: process.env.API_SECRET,
  }
});
```

### 2. Add to your layout

#### App Router

```tsx
// app/layout.tsx
import { DynamicEnvScript } from 'next-dynamic-env';
import { dynamicEnv } from '../dynamic-env';

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <DynamicEnvScript env={dynamicEnv} />
      </head>
      <body>{children}</body>
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

For code that runs before React hydration (like instrumentation files), use `waitForEnv`:

```typescript
// instrumentation-client.ts
import { waitForEnv } from 'next-dynamic-env';

export async function register() {
  const env = await waitForEnv();

  // Initialize monitoring, analytics, etc.
  console.log('App initialized with:', env);
}
```

## API Reference

### `createDynamicEnv(config)`

Creates a type-safe environment configuration with server/client separation.

#### Config Options

- `schema` (required) - Zod schema defining all environment variables
- `client` (required) - Object with client-side environment variables
- `server` (required) - Object with server-only environment variables
- `onValidationError` - Error handling: `'throw'` (default), `'warn'`, or custom function
- `skipValidation` - Skip validation (useful for build time)

```typescript
const dynamicEnv = createDynamicEnv({
  schema: z.object({
    // Define all variables in one schema
    API_URL: z.string().url(),
    PORT: z.coerce.number(),
    DATABASE_URL: z.string(),
  }),
  client: {
    // Only these are exposed to browser
    API_URL: process.env.API_URL,
    PORT: process.env.PORT,
  },
  server: {
    // These are never exposed to browser
    DATABASE_URL: process.env.DATABASE_URL,
  },
  onValidationError: 'warn', // or 'throw' or custom function
});
```

#### Server/Client Access Rules

- **On Server**: Both `server` and `client` variables are accessible
- **On Client**: 
  - `client` variables are accessible
  - `server` variables throw an error in development, return `undefined` in production
  - The `__raw` property only includes client variables

### `DynamicEnvScript`

React component that injects environment variables into the client.

#### Props

- `env` - The dynamic env object from `createDynamicEnv`
- `onMissingVar` - Handler for missing required variables (dev only)
- `id` - Script element ID (default: `next-dynamic-env-script`)

### `waitForEnv(options?)`

Waits for environment variables to be available on the client. Useful for code that runs before React hydration.

```typescript
import { waitForEnv } from 'next-dynamic-env';

// Basic usage
await waitForEnv();

// With options
const env = await waitForEnv({
  requiredKeys: ['API_URL', 'APP_NAME'],
  timeout: 5000,
  debug: true,
  onReady: (env) => {
    console.log('Environment loaded:', env);
  }
});
```

#### Options

- `timeout` - Maximum wait time in ms (default: 5000)
- `interval` - Polling interval in ms (default: 50)
- `requiredKeys` - Array of required environment variable keys
- `validate` - Custom validation function
- `retries` - Number of retry attempts (default: 0)
- `debug` - Enable debug logging

## Examples

Check out the [examples](./examples) directory:

- [App Router](./examples/with-app-router) - Next.js 15 with App Router
- [Pages Router](./examples/with-pages-router) - Next.js with Pages Router

## Validation with Zod

The schema validates all environment variables at runtime:

```typescript
const dynamicEnv = createDynamicEnv({
  schema: z.object({
    // Client variables with validation
    API_URL: z.string().url('Invalid API URL'),
    TIMEOUT: z.coerce.number().min(1000).max(30000),
    FEATURES: z.string().transform(val => val.split(',')),
    
    // Server variables with validation
    DATABASE_URL: z.string().url(),
    RETRY_COUNT: z.coerce.number().int().positive()
  }),
  client: {
    API_URL: process.env.API_URL,
    TIMEOUT: process.env.TIMEOUT,
    FEATURES: process.env.FEATURES,
  },
  server: {
    DATABASE_URL: process.env.DATABASE_URL,
    RETRY_COUNT: process.env.RETRY_COUNT,
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
  schema: z.object({
    // Transform comma-separated string to array
    FEATURES: z.string().transform(val => val.split(',')),
    
    // Parse JSON configuration
    CONFIG: z.string().transform(val => JSON.parse(val)),
    
    // Convert to boolean
    MAINTENANCE_MODE: z.coerce.boolean(),
    
    // Default values
    TIMEOUT: z.coerce.number().default(5000),
    
    // Server-only with transform
    DB_POOL_SIZE: z.coerce.number().default(10),
  }),
  client: {
    FEATURES: process.env.FEATURES,
    CONFIG: process.env.CONFIG,
    MAINTENANCE_MODE: process.env.MAINTENANCE_MODE,
    TIMEOUT: process.env.TIMEOUT,
  },
  server: {
    DB_POOL_SIZE: process.env.DB_POOL_SIZE,
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