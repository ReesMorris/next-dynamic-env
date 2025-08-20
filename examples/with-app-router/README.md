# Next Dynamic Env - App Router Example

This example demonstrates how to use `next-dynamic-env` with Next.js App Router.

## Features

- Runtime environment variables that work in both Server and Client Components
- Type-safe access with TypeScript
- Zod validation for environment variables
- Automatic client-side injection via `DynamicEnvScript`
- Support for instrumentation files

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Run the development server:
```bash
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000)

## How it works

1. **Environment Configuration** (`dynamic-env.ts`):
   - Defines environment variables with Zod validation
   - Provides type-safe access throughout the app

2. **Script Injection** (`app/layout.tsx`):
   - `DynamicEnvScript` component injects env vars into the window object
   - Makes variables available in Client Components

3. **Usage**:
   - **Server Components** (`app/server.tsx`): Direct access via `dynamicEnv`
   - **Client Components** (`app/client.tsx`): Access after hydration via `dynamicEnv`
   - **Instrumentation** (`instrumentation-client.ts`): Available at app initialization

## Key Files

- `dynamic-env.ts` - Environment variable configuration
- `src/app/layout.tsx` - Root layout with DynamicEnvScript
- `src/app/client.tsx` - Client Component example
- `src/app/server.tsx` - Server Component example
- `instrumentation-client.ts` - Client-side instrumentation example
- `.env` - Environment variables (not committed)

## Environment Variables

The example uses these environment variables:

- `APP_NAME` - Application name
- `API_URL` - API endpoint URL
- `PORT` - Port number (transformed to number)
- `DEBUG` - Debug mode (transformed to boolean)
- `FEATURES` - Feature flags (transformed to array)

## App Router Specific Features

- **Server Components**: Environment variables are available directly without any special handling
- **Client Components**: Use the `"use client"` directive and access variables after hydration
- **Instrumentation**: Access environment variables during app initialization for telemetry or logging setup