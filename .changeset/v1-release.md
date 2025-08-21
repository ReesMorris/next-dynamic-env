---
"next-dynamic-env": major
---

## 🚀 v1.0.0 - Production Ready Release!

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