# next-dynamic-env

## 1.0.1

### Patch Changes

- [`8a346b2`](https://github.com/ReesMorris/next-dynamic-env/commit/8a346b2aa757abcd35fa4fae3761912f1b897f75) Thanks [@ReesMorris](https://github.com/ReesMorris)! - Move @standard-schema/spec to devDependencies since it's only used for TypeScript types

- [`c9a7671`](https://github.com/ReesMorris/next-dynamic-env/commit/c9a76711d988c2ca75e49f361ac6face4963dcef) Thanks [@ReesMorris](https://github.com/ReesMorris)! - Update GitHub Actions workflow to enable npm provenance

## 1.0.0

### Major Changes

- [`94fea55`](https://github.com/ReesMorris/next-dynamic-env/commit/94fea550a284a9acca4f7ab8192dbb7586adffec) Thanks [@ReesMorris](https://github.com/ReesMorris)! - ## 🚀 v1.0.0 - Production Ready Release!

  This marks the first stable release of next-dynamic-env, bringing type-safe runtime environment variables to Next.js applications.

  ### Major Features

  - **Runtime Configuration**: Change environment variables without rebuilding your Next.js app
  - **Type Safety**: Full TypeScript support with autocompletion and type inference
  - **Security First**: Strict server/client separation - server secrets never reach the browser
  - **Universal Validator Support**: Works with Zod, Yup, Valibot, or any standard-schema validator
  - **Framework Agnostic**: Supports App Router, Pages Router, middleware, and instrumentation
  - **Docker & Kubernetes Ready**: Perfect for containerized deployments

  ### Key Capabilities

  - `createDynamicEnv` for defining type-safe environment configurations
  - `DynamicEnvScript` component for client-side injection
  - `waitForEnv` utility for async environment loading
  - Empty string to undefined conversion for better validation
  - Custom error handlers and validation strategies
  - XSS protection with automatic script tag filtering

  ### Documentation

  - Comprehensive README with clear examples
  - Full API reference
  - Example projects for App Router and Pages Router
  - Contributing guidelines

  This release has been thoroughly tested with 187 tests and is ready for production use.

  Special thanks to [t3-env](https://github.com/t3-oss/t3-env) for the inspiration!

## 0.4.0

### Minor Changes

- [#11](https://github.com/ReesMorris/next-dynamic-env/pull/11) [`6a22f62`](https://github.com/ReesMorris/next-dynamic-env/commit/6a22f62de541237b3e1cad22ebea9e3b6f10c5c3) Thanks [@ReesMorris](https://github.com/ReesMorris)! - feat: separate client and server environments for enhanced security

  **Breaking Changes:**

  - `createDynamicEnv` now returns `{ clientEnv, serverEnv }` instead of a single `env` object
  - `DynamicEnvScript` now only accepts `ClientEnv` type
  - Removed backward compatibility with combined environment object

  **Security Fix:**

  - Server-only environment variables can no longer be accidentally exposed to the browser through React Server Components

  **Migration:**

  ```typescript
  // Before
  const env = createDynamicEnv({ client: {...}, server: {...} });
  <DynamicEnvScript env={env} />

  // After
  const { clientEnv, serverEnv } = createDynamicEnv({ client: {...}, server: {...} });
  <DynamicEnvScript clientEnv={clientEnv} />
  ```

  **Additional Improvements:**

  - Added TypeScript discriminators (`__isClient` and `__isServer`) for compile-time type safety
  - Made `processEnvironmentVariables` a pure function
  - Removed duplicate key checking as environments are now separate

## 0.3.0

### Minor Changes

- [`5aed912`](https://github.com/ReesMorris/next-dynamic-env/commit/5aed9124fa443ea8b210a3485b278dd0f00d922b) Thanks [@ReesMorris](https://github.com/ReesMorris)! - Add `emptyStringAsUndefined` option to automatically convert empty environment variable strings to `undefined`

  This new option (enabled by default) prevents validation errors when optional fields receive empty strings from environment variables. This is particularly useful for optional URLs, numbers, and other validated fields.

  ```typescript
  // Environment: SENTRY_URL=""
  const dynamicEnv = createDynamicEnv({
    schema: z.object({
      SENTRY_URL: z.string().url().optional(), // Would fail without this feature
    }),
    client: {
      SENTRY_URL: process.env.SENTRY_URL, // "" becomes undefined
    },
    server: {},
    // emptyStringAsUndefined: true (default)
  });

  // Result: dynamicEnv.SENTRY_URL === undefined ✅
  ```

  This matches the behavior of popular libraries like T3 Env and provides better developer experience. The option can be disabled by setting `emptyStringAsUndefined: false`.

## 0.2.4

### Patch Changes

- [`6228e74`](https://github.com/ReesMorris/next-dynamic-env/commit/6228e74e1bce0319f1fd24b0cbd393dc55906e13) Thanks [@ReesMorris](https://github.com/ReesMorris)! - Fix README not appearing on npm by replacing symlink with actual file

## 0.2.3

### Patch Changes

- [`bb02db7`](https://github.com/ReesMorris/next-dynamic-env/commit/bb02db7880cdda198df3a110d8b44268083d3909) Thanks [@ReesMorris](https://github.com/ReesMorris)! - Include README.md in npm package for better documentation visibility on npmjs.com

## 0.2.2

### Patch Changes

- [`e8e9798`](https://github.com/ReesMorris/next-dynamic-env/commit/e8e9798ddfab70869f962b3cd7cee2f0248c9779) Thanks [@ReesMorris](https://github.com/ReesMorris)! - Test changeset to verify automated release workflow - improved CI/CD pipeline configuration

## 0.2.1

### Patch Changes

- [#4](https://github.com/ReesMorris/next-dynamic-env/pull/4) [`2f3f46f`](https://github.com/ReesMorris/next-dynamic-env/commit/2f3f46ff59d989c42e7a67ecb7cb0ef311133877) Thanks [@dependabot](https://github.com/apps/dependabot)! - Updated Next.js devDependency from 15.4.7 to 15.5.0 for testing compatibility. All tests pass with the new version.

## 0.2.0

### Minor Changes

- [`d5b3106`](https://github.com/ReesMorris/next-dynamic-env/commit/d5b3106978192c2e4a213def0504febc7c18011d) Thanks [@ReesMorris](https://github.com/ReesMorris)! - Initial release of next-dynamic-env 🚀

  Features:

  - Runtime environment variables for Next.js applications
  - Server/client variable separation for security
  - Zod schema validation with TypeScript support
  - Support for App Router and Pages Router
  - Docker-ready configuration
  - XSS protection with script tag filtering
  - Async environment loading with `waitForEnv`
  - Transform functions for environment values
