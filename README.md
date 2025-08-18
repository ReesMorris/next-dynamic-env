# next-dynamic-env

Runtime environment variables for dockerized Next.js apps

## Notes for Documentation

### TypeScript and Custom Variable Names

If you use a custom variable name (instead of the default `__NEXT_DYNAMIC_ENV__`), you can add global type definitions for direct window access:

```typescript
// In a .d.ts file or your types
declare global {
  interface Window {
    __YOUR_CUSTOM_VAR__?: Record<string, string | undefined>;
  }
}
```

Note: This is only needed if you want TypeScript support for direct `window.__YOUR_CUSTOM_VAR__` access. The `dynamicEnv.VARIABLE_NAME` syntax will always be fully typed regardless.