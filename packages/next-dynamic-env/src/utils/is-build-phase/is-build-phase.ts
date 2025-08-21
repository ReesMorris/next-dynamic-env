/**
 * Checks if the current environment is in the Next.js build phase.
 *
 * During the build phase, environment variables are often not available
 * as Docker images are built once and deployed to multiple environments.
 * This utility helps skip validation during builds while still enforcing
 * it at runtime.
 *
 * @returns `true` if in Next.js production build phase, `false` otherwise
 *
 * @remarks
 * Next.js sets `process.env.NEXT_PHASE` to `'phase-production-build'` during builds.
 * This is crucial for containerized deployments where env vars are injected at runtime.
 */
export const isBuildPhase = (): boolean => {
  return process.env.NEXT_PHASE === 'phase-production-build';
};
