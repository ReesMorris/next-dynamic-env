# Next Dynamic Env - Pages Router Example

This example demonstrates how to use `next-dynamic-env` with Next.js Pages Router.

## Features

- Runtime environment variables that work on both server and client
- Type-safe access with TypeScript
- Zod validation for environment variables
- Automatic client-side injection via `DynamicEnvScript`

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

2. **Script Injection** (`_app.tsx`):
   - `DynamicEnvScript` component injects env vars into the window object
   - Makes variables available on the client side

3. **Usage** (`pages/index.tsx`):
   - Same `dynamicEnv` object works on both server and client
   - Server-side: reads from `process.env`
   - Client-side: reads from `window.__NEXT_DYNAMIC_ENV__`

## Key Files

- `dynamic-env.ts` - Environment variable configuration
- `src/pages/_app.tsx` - Adds DynamicEnvScript
- `src/pages/index.tsx` - Example usage
- `.env` - Environment variables (not committed)

## Environment Variables

The example uses these environment variables:

- `APP_NAME` - Application name
- `API_URL` - API endpoint URL
- `PORT` - Port number (transformed to number)
- `DEBUG` - Debug mode (transformed to boolean)
- `FEATURES` - Feature flags (transformed to array)