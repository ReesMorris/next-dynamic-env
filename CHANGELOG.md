# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of next-dynamic-env
- Runtime environment variable support for Next.js applications
- Server/client variable separation for security
- Zod schema validation with TypeScript support
- `createDynamicEnv` function for environment configuration
- `DynamicEnvScript` component for client-side injection
- `waitForEnv` utility for async environment loading
- Comprehensive test suite with 314 tests
- Support for App Router and Pages Router
- Docker-ready configuration
- Full TypeScript support with autocompletion
- XSS protection with script tag filtering
- Retry mechanisms with exponential backoff
- Transform functions for environment values
- Custom validation error handlers

### Security
- Server-only variables throw errors in development when accessed on client
- Server-only variables return `undefined` in production when accessed on client
- Automatic filtering of `</script>` tags in environment values
- `__raw` property only exposes client variables

## [0.1.0] - 2025-01-20

- Initial pre-release version