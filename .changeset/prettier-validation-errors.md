---
"next-dynamic-env": minor
---

Improved validation error formatting with colors and better readability

- Added ANSI color support for terminal output (respects NO_COLOR/FORCE_COLOR env vars)
- Validation errors now display with emoji indicators and colored formatting
- Simplified error messages by removing verbose JSON arrays and stack traces
- Changed throw mode behavior to console.error + process.exit instead of throwing
- Better separation of concerns with modular formatting utilities
- Improved browser compatibility by detecting environment and adjusting output