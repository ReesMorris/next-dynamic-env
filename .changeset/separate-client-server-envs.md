---
"next-dynamic-env": minor
---

feat: separate client and server environments for enhanced security

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