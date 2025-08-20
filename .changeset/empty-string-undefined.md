---
"next-dynamic-env": minor
---

Add `emptyStringAsUndefined` option to automatically convert empty environment variable strings to `undefined`

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