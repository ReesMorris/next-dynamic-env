# Next Dynamic Env

[![npm version](https://img.shields.io/npm/v/next-dynamic-env.svg)](https://www.npmjs.com/package/next-dynamic-env)
[![npm downloads](https://img.shields.io/npm/dm/next-dynamic-env.svg)](https://www.npmjs.com/package/next-dynamic-env)
[![license](https://img.shields.io/npm/l/next-dynamic-env.svg)](https://github.com/reesmorris/next-dynamic-env/blob/main/LICENSE)

Type-safe runtime environment variables for Next.js – no more rebuilding for config changes!

## Why?

Traditional Next.js apps bake environment variables into the build. This means you need to rebuild your entire application just to change an API URL or feature flag. With `next-dynamic-env`, your containerized Next.js apps can read environment variables at runtime, just like traditional server applications.

**Perfect for:**
- 🐳 Docker deployments where the same image runs in multiple environments
- ☸️ Kubernetes configurations with ConfigMaps
- 🚀 CI/CD pipelines that promote the same build through stages
- 🔧 Feature flags and config that change without code changes

**Key benefit:** Build your Docker image once without environment variables, then inject them at runtime in each environment!

## Features

- **Runtime Configuration** - Change environment variables without rebuilding
- **Type Safety** - Full TypeScript support with autocompletion
- **Security First** - Server secrets never reach the browser
- **Any Validator** - Works with Zod, Yup, Valibot, or any [standard-schema](https://github.com/standard-schema/standard-schema) validator
- **Universal** - Works everywhere: App Router, Pages Router, middleware, and instrumentation

## Installation

```bash
npm install next-dynamic-env
```

```bash
yarn add next-dynamic-env
```

```bash
pnpm add next-dynamic-env
```

```bash
bun add next-dynamic-env
```

## Quick Start

### 1. Define your environment variables

```typescript
// env.ts
import { createDynamicEnv } from 'next-dynamic-env';
import { z } from 'zod';
import * as yup from 'yup';

export const { clientEnv, serverEnv } = createDynamicEnv({
  client: {
    // Validate with Zod ..
    API_URL: [process.env.API_URL, z.string().url()],

    // .. or with Yup ..
    PORT: [process.env.PORT, yup.number().positive().default(3000)],

    // .. or with any `standard-schema` library ...
    // https://github.com/standard-schema/standard-schema

    // .. or just provide a raw value (no validation)
    PUBLIC_KEY: process.env.PUBLIC_KEY,
  },
  server: {
    // Never exposed to browser
    DATABASE_URL: [process.env.DATABASE_URL, z.string().url()],
    SECRET_KEY: [process.env.SECRET_KEY, z.string().min(32)],
  }
});
```

### 2. Add the script to your app

```tsx
// app/layout.tsx (App Router)
// pages/_app.tsx (Pages Router)
import { DynamicEnvScript } from 'next-dynamic-env';
import { clientEnv } from './env';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <DynamicEnvScript clientEnv={clientEnv} />
      </body>
    </html>
  );
}
```

### 3. Use anywhere

```tsx
import { clientEnv, serverEnv } from './env';

// Server components can access both
export default async function Page() {
  const data = await getSomeData(
    clientEnv.API_URL,
    serverEnv.DATABASE_URL
  );

  return <ClientComponent />;
}

// Client components only access clientEnv
function ClientComponent() {
  return <div>API: {clientEnv.API_URL}</div>;
}
```

## Validation

Use any validator that supports [standard-schema](https://github.com/standard-schema/standard-schema):

```typescript
// With Zod
const { clientEnv } = createDynamicEnv({
  client: {
    PORT: [process.env.PORT, z.coerce.number().default(3000)],
    FEATURES: [process.env.FEATURES, z.string().transform(s => s.split(','))],
  }
});

// With Yup
import { number } from 'yup';

const { clientEnv } = createDynamicEnv({
  client: {
    PORT: [process.env.PORT, number().positive().default(3000)],
  }
});

// Mix validators or use none
const { clientEnv } = createDynamicEnv({
  client: {
    VALIDATED: [process.env.VALIDATED, z.string()],
    RAW_VALUE: process.env.RAW_VALUE, // No validation
  }
});
```

## Advanced Features

### `waitForEnv` (Client-side initialization)

For code that runs before the script tag executes (like `instrumentation-client.ts`):

```typescript
import { waitForEnv } from 'next-dynamic-env';

await waitForEnv();
// Now environment variables are available
```

### Empty String Handling

Empty strings are converted to `undefined` by default (configurable):

```typescript
// Environment: OPTIONAL_URL=""
createDynamicEnv({
  client: {
    OPTIONAL_URL: [process.env.OPTIONAL_URL, z.string().url().optional()],
  },
  // emptyStringAsUndefined: true (default)
});
// Result: clientEnv.OPTIONAL_URL === undefined ✅
```

### Error Handling

```typescript
createDynamicEnv({
  // ...your config
  onValidationError: 'throw', // Default: throws on invalid env vars
  // or 'warn' to console.warn
  // or custom function: (error) => { /* handle */ }
});
```

## Docker & Kubernetes

Perfect for containerized deployments where environment changes between stages:

```dockerfile
# Same image, different environments
docker run -e API_URL=https://staging.api myapp:latest
docker run -e API_URL=https://prod.api myapp:latest
```

### Build Phase Behavior

During `next build`, validation is automatically skipped to support Docker workflows where environment variables are injected at runtime rather than build time. This means:

- ✅ Your Docker image builds successfully without environment variables
- ✅ Validation still runs at runtime when the container starts
- ✅ Schema transformations (defaults, type coercion) are still applied during build

This enables true "build once, deploy anywhere" workflows:

```dockerfile
# Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci
# No ENV vars needed during build!
RUN npm run build

# Runtime - inject environment variables
CMD ["npm", "start"]
```

```bash
# Deploy the same image to different environments
docker run -e DATABASE_URL=$STAGING_DB myapp:latest  # Staging
docker run -e DATABASE_URL=$PROD_DB myapp:latest     # Production
```

## Examples

- [App Router Example](./examples/with-app-router)
- [Pages Router Example](./examples/with-pages-router)

## API Reference

### `createDynamicEnv(config)`

Creates your environment configuration.

- **`client`**: Variables exposed to the browser
- **`server`**: Server-only variables (never sent to browser)
- **`onValidationError`**: `'throw'` | `'warn'` | `(error) => void`
- **`emptyStringAsUndefined`**: Convert `""` to `undefined` (default: `true`)
- **`skipValidation`**: Skip validation (default: `false`, automatically `true` during build)

### `DynamicEnvScript`

React component that injects client variables.

- **`clientEnv`**: Your client environment object (required)

### `waitForEnv(options?)`

Waits for environment variables to be available.

- **`timeout`**: Max wait time in ms (default: 5000)
- **`requiredKeys`**: Keys that must be present

## Security

Server variables are **never** exposed to the browser:
- In development: Accessing server vars on client throws an error
- In production: Server vars return `undefined` on client

## Contributing

Contributions are welcome! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## Acknowledgments

This library was inspired by [t3-env](https://github.com/t3-oss/t3-env), which pioneered the concept of type-safe environment variables with server/client separation in Next.js applications. I've built upon their excellent foundation to add runtime configuration capabilities for containerized deployments.

## License

MIT