# Contributing to next-dynamic-env

Thank you for your interest in contributing! This guide will help you get started.

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/reesmorris/next-dynamic-env.git
cd next-dynamic-env

# Install dependencies (requires pnpm)
pnpm install

# Run tests to ensure everything works
pnpm test
```

## 📦 Project Structure

```
next-dynamic-env/
├── packages/
│   └── next-dynamic-env/      # Main library package
│       ├── src/               # Source code
│       ├── dist/              # Built output (git-ignored)
│       └── package.json       # Package configuration
├── examples/
│   ├── with-app-router/       # Next.js App Router example
│   └── with-pages-router/     # Next.js Pages Router example
└── .changeset/                # Changeset files for versioning
```

## 🛠️ Development Workflow

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test:watch

# Run tests with UI
pnpm test:ui
```

### Building

```bash
# Build the library
pnpm build:packages

# Build everything (library + examples)
pnpm build
```

### Linting & Formatting

```bash
# Run linting, formatting, and type checking
pnpm check

# Run linting
pnpm lint

# Format code
pnpm format

# Type checking
pnpm typecheck
```

### Working with Examples

```bash
# Start development server for examples
pnpm dev

# Test your changes with the examples
cd examples/with-app-router
pnpm dev
```

## 🔄 Making Changes

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

- Write your code
- Add/update tests as needed
- Update documentation if necessary
- Test with the examples if relevant

### 3. Create a Changeset

After making your changes, create a changeset to describe what changed:

```bash
pnpm changeset
```

This will prompt you to:
- Select the package (`next-dynamic-env`)
- Choose the version bump type:
  - **patch**: Bug fixes, documentation, internal changes (0.1.0 → 0.1.1)
  - **minor**: New features, non-breaking changes (0.1.0 → 0.2.0)
  - **major**: Breaking changes (0.1.0 → 1.0.0)
- Write a summary of your changes

The changeset will create a markdown file in `.changeset/` that looks like:

```markdown
---
"next-dynamic-env": patch
---

Fixed issue with server-side environment validation
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: your feature description"
```

### 5. Push and Create a Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub.

## ✅ Pull Request Checklist

Before submitting your PR, ensure:

- [ ] Tests pass (`pnpm test`)
- [ ] Code is linted (`pnpm lint`)
- [ ] TypeScript has no errors (`pnpm typecheck`)
- [ ] Changeset is created (`pnpm changeset`)
- [ ] Examples still work if you changed core functionality
- [ ] Documentation is updated if needed

## 📝 Commit Convention

We follow conventional commits for clear history:

- `fix:` Bug fixes
- `feat:` New features
- `docs:` Documentation changes
- `chore:` Maintenance tasks
- `test:` Test changes
- `refactor:` Code refactoring
- `perf:` Performance improvements
- `style:` Code style changes

Add `!` for breaking changes: `feat!: breaking change description`

Examples:
```bash
git commit -m "fix: handle undefined environment variables correctly"
git commit -m "feat: add support for array validation"
git commit -m "docs: update README with new examples"
git commit -m "feat!: change API to use async validation"
```

## 🚢 Release Process

Releases are fully automated through GitHub Actions:

1. **You merge a PR with changesets** → Triggers the release workflow
2. **Bot creates a "Version Packages" PR** → Updates versions and CHANGELOG
3. **Merge the version PR** → Automatically:
   - Publishes to npm
   - Creates GitHub release
   - Updates documentation

### Manual Release (Emergency Only)

If needed, maintainers can trigger a release manually:

```bash
# Create changeset
pnpm changeset

# Version packages
pnpm changeset version

# Publish to npm
pnpm changeset publish
```

## 🧪 Testing Guidelines

- Write tests for new features
- Update tests when changing existing functionality
- Aim for good coverage but prioritize meaningful tests
- Use descriptive test names

Example test structure:
```typescript
describe('createDynamicEnv', () => {
  it('should validate required environment variables', () => {
    // Test implementation
  });
  
  it('should handle missing optional variables gracefully', () => {
    // Test implementation
  });
});
```

## 🐛 Reporting Issues

When reporting issues, please include:

1. **Environment details** (Next.js version, Node version, OS)
2. **Minimal reproduction** (code snippet or repository)
3. **Expected behavior** vs **Actual behavior**
4. **Error messages** (if any)
5. **Steps to reproduce**

## 💬 Getting Help

- **Issues**: [GitHub Issues](https://github.com/reesmorris/next-dynamic-env/issues)
- **Discussions**: Use GitHub Discussions for questions
- **Examples**: Check the `/examples` directory for usage patterns

## 🙏 Thank You!

Every contribution helps make this library better. Whether it's fixing a typo, adding a feature, or reporting a bug - I appreciate your help!