---
"next-dynamic-env": minor
---

Add automatic build phase detection for Docker deployments

- Skip validation during `next build` to support Docker workflows where environment variables are injected at runtime
- Apply schema transformations (defaults, coercion) even when validation is skipped
- Add `isBuildPhase()` utility to detect Next.js build phase
- Examples now use `force-dynamic` to ensure runtime environment variables work correctly

This enables true "build once, deploy anywhere" workflows - build your Docker image without environment variables, then inject them at runtime in each environment.