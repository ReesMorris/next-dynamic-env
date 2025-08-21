# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a monorepo for `next-dynamic-env`, a library that provides runtime environment variables for Next.js applications with safe server/client separation. The project uses pnpm workspaces and Turbo for monorepo management.

## Repository Structure

- `/packages/next-dynamic-env/` - Main library package
- `/examples/with-app-router/` - Example using Next.js App Router
- `/examples/with-pages-router/` - Example using Next.js Pages Router

## Development Commands

```bash
# Install dependencies (using pnpm)
pnpm install

# Development
pnpm dev              # Run all packages in dev mode
pnpm build            # Build all packages
pnpm build:packages   # Build only the library package

# Testing
pnpm test             # Run tests
pnpm test:coverage    # Run tests with coverage
pnpm test:ui          # Open Vitest UI
pnpm test:watch       # Run tests in watch mode

# Code Quality
pnpm lint             # Run Biome linter
pnpm format           # Format code with Biome
pnpm typecheck        # Run TypeScript type checking
pnpm check            # Run both lint and typecheck

# Release Management
pnpm changeset        # Create a changeset
pnpm version          # Version packages
pnpm release          # Build and publish packages
```

## Architecture

### Core Library (`/packages/next-dynamic-env/src/`)

The library provides three main exports:

1. **`createDynamicEnv`** - Factory function that creates type-safe environment configuration with server/client separation
2. **`DynamicEnvScript`** - React component that injects client variables into the browser
3. **`waitForEnv`** - Async function for waiting for environment variables to be available (useful for instrumentation)

Key architectural decisions:
- Server variables are NEVER exposed to the client bundle
- Client variables are injected at runtime via a script tag
- Validation uses standard-schema specification (works with Zod, Yup, Valibot, etc.)
- Empty strings are converted to undefined by default (configurable)

### Build Configuration

- **Bundler**: tsup for library building
- **Test Runner**: Vitest with happy-dom environment
- **Linter/Formatter**: Biome (configuration in `biome.json`)
- **Monorepo**: Turbo (configuration in `turbo.json`)
- **Package Manager**: pnpm v10.15.0

### Testing

Tests are located alongside source files with `.test.ts` or `.test.tsx` extensions. The test setup uses:
- Vitest with happy-dom for DOM testing
- Testing Library for React component testing
- Coverage reports via V8

### Release Process

The project uses Changesets for version management:
1. Create changesets for changes: `pnpm changeset`
2. Version packages: `pnpm version`
3. Publish to npm: `pnpm release`

The `.changeset/config.json` configures automated changelog generation using GitHub releases.

## Key Implementation Details

### Server/Client Separation

The library enforces strict separation:
- Server variables throw errors when accessed on client in development
- Server variables return `undefined` on client in production
- Only client variables are injected into the window object

### Validation

Supports any validator implementing standard-schema:
- Values can be defined as `[value, schema]` for validation
- Raw values without validation are also supported
- Transforms and defaults are supported through the validator

### Type Safety

Full TypeScript support with:
- Inferred types from schemas
- Autocompletion for environment variables
- Type errors for incorrect usage

## CI/CD

GitHub Actions workflows:
- `ci.yml` - Runs tests, linting, and type checking on PRs
- `changesets.yml` - Manages releases and publishes to npm