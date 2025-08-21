# Copilot Instructions for next-dynamic-env

This repository contains `next-dynamic-env`, a TypeScript library that provides runtime environment variables for Next.js applications with safe server/client separation.

## Project Overview

**Repository Type**: Monorepo using pnpm workspaces and Turbo  
**Main Language**: TypeScript  
**Target Runtime**: Next.js applications (>=14.0.0), React (>=18.0.0)  
**Package Manager**: pnpm v10.15.0 (exact version required)  
**Build System**: Turbo with tsup for library bundling  
**Test Framework**: Vitest with happy-dom environment  
**Linter/Formatter**: Biome (configured in `biome.json`)

## Repository Structure

```
├── packages/
│   └── next-dynamic-env/          # Main library package (focus here)
│       ├── src/                   # Source code with tests alongside
│       ├── dist/                  # Built output (git-ignored)
│       ├── package.json           # Package configuration  
│       ├── tsup.config.ts         # Build configuration
│       ├── vitest.config.ts       # Test configuration
│       └── vitest.setup.ts        # Test setup
├── examples/
│   ├── with-app-router/           # Next.js App Router example
│   └── with-pages-router/         # Next.js Pages Router example  
├── .changeset/                    # Changeset files for versioning
├── .github/workflows/             # CI/CD workflows
├── turbo.json                     # Monorepo build configuration
├── biome.json                     # Linting/formatting configuration
└── package.json                   # Root workspace configuration
```

## Essential Setup Requirements

**CRITICAL**: Always install the exact pnpm version first:
```bash
npm install -g pnpm@10.15.0
```

**Environment Setup Sequence**:
1. Install pnpm: `npm install -g pnpm@10.15.0`
2. Install dependencies: `pnpm install` (uses frozen lockfile)
3. Verify setup: `pnpm test` (should pass 220+ tests)

## Build and Validation Commands

### Core Commands (Always Work)
```bash
# Setup (run in this order)
pnpm install                    # Install all dependencies

# Building  
pnpm build:packages            # Build main library only (RECOMMENDED)
# AVOID: pnpm build             # Fails on examples without env vars

# Testing
pnpm test                      # Run all tests (220+ tests, ~7s)
pnpm test:coverage             # Run tests with coverage reports
pnpm test:watch                # Run tests in watch mode
pnpm test:ui                   # Open Vitest UI

# Code Quality
pnpm lint                      # Run Biome linter (works across monorepo)
pnpm format                    # Format code with Biome
pnpm typecheck                 # Run TypeScript type checking
```

### Package-Specific Commands (Faster for Main Package)
```bash
cd packages/next-dynamic-env
pnpm test                      # Test just the main package
pnpm lint                      # Lint just the main package  
pnpm typecheck                 # Type check just the main package
pnpm build                     # Build just the main package
```

### Commands That May Fail
```bash
pnpm check                     # FAILS: tries to run 'bun' (not installed)
pnpm build                     # FAILS: examples need env vars to build
```
**Workaround**: Use `pnpm build:packages` instead of `pnpm build`

## Pre-Commit Validation Sequence

Before making code changes, always run:
```bash
pnpm install                   # Ensure dependencies are up to date
pnpm build:packages           # Verify main package builds
pnpm test                     # Verify all tests pass
pnpm lint                     # Verify code style
```

**For faster iteration on main package only**:
```bash
cd packages/next-dynamic-env
pnpm build && pnpm test && pnpm lint && pnpm typecheck
```

## Release and Changeset Management

This project uses Changesets for version management:

```bash
pnpm changeset                 # Create changeset for changes
pnpm version                   # Version packages (maintainer only)  
pnpm release                   # Build and publish (maintainer only)
```

**Important**: Most PRs require a changeset. Run `pnpm changeset` after changes.

## GitHub Actions Workflows

### CI Pipeline (.github/workflows/ci.yml)
- **Triggers**: Push to main, PRs to main
- **Steps**: Install → Lint → Type check → Test (main package only)
- **Node**: 20.x, pnpm 10.15.0  
- **Skips**: Release commits (auto-generated)

### Release Pipeline (.github/workflows/changesets.yml)  
- **Triggers**: Push to main with changesets
- **Actions**: Creates release PRs, publishes to npm
- **Automated**: Handles version bumps and GitHub releases

### Changeset Check (.github/workflows/changeset-check.yml)
- **Triggers**: PRs (except release PRs)
- **Validates**: Presence of changeset files for code changes

## Library Architecture

### Core Exports (packages/next-dynamic-env/src/index.ts)
1. **`createDynamicEnv`** - Factory function for type-safe environment configuration
2. **`DynamicEnvScript`** - React component that injects client variables  
3. **`waitForEnv`** - Async function for environment variable availability

### Key Architectural Decisions  
- Server variables NEVER exposed to client bundle
- Client variables injected at runtime via script tag
- Validation uses standard-schema specification (Zod, Yup, Valibot compatible)
- Empty strings converted to undefined by default (configurable)

### Test Structure
- Tests located alongside source files (`.test.ts`, `.test.tsx`)
- Vitest with happy-dom environment for DOM testing
- Testing Library for React component testing
- 220+ tests with >70% coverage

## Common Issues and Solutions

### Build Failures
- **Issue**: Examples fail to build without environment variables
- **Solution**: Use `pnpm build:packages` instead of `pnpm build`

### pnpm Version Issues
- **Issue**: Commands fail with wrong pnpm version  
- **Solution**: Always install exact version: `npm install -g pnpm@10.15.0`

### Bun Command Errors
- **Issue**: `pnpm check` fails trying to run bun commands
- **Solution**: Run individual commands: `pnpm lint && pnpm typecheck`

### Husky Pre-commit Hooks
- **Issue**: Pre-commit hooks may update lockfile
- **Solution**: Let hooks run, they'll stage updated `pnpm-lock.yaml`

## Configuration Files Reference

- **turbo.json**: Monorepo task configuration, caching rules
- **biome.json**: Comprehensive linting/formatting rules (175+ lines)
- **tsup.config.ts**: Library build configuration (ESM/CJS/types)
- **vitest.config.ts**: Test configuration with coverage setup
- **.changeset/config.json**: Automated changelog and release config

## Fast Development Workflow

1. **Setup**: `npm install -g pnpm@10.15.0 && pnpm install`  
2. **Test Changes**: `cd packages/next-dynamic-env && pnpm test`
3. **Validate**: `pnpm lint && pnpm typecheck`
4. **Build Check**: `pnpm build:packages`
5. **Create Changeset**: `pnpm changeset` (if needed)

## Trust These Instructions

These instructions have been validated by running all commands and testing the complete build pipeline. Only search for additional information if these instructions are incomplete or found to be incorrect.