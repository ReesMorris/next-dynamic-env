# Contributing to next-dynamic-env

## Making Changes

### 1. Create a Changeset

After making your changes, create a changeset to describe what changed:

```bash
pnpm changeset
```

This will prompt you to:
- Select the package (`next-dynamic-env`)
- Choose the version bump type:
  - **patch**: Bug fixes, documentation (0.1.0 → 0.1.1)
  - **minor**: New features, non-breaking changes (0.1.0 → 0.2.0)
  - **major**: Breaking changes (0.1.0 → 1.0.0)
- Write a summary of your changes

### 2. Commit Everything

```bash
git add .
git commit -m "feat: your feature description"
git push
```

## Release Process (Maintainers)

Releases are automated! When changesets are pushed to `main`:

1. **Changesets bot creates a PR** titled "chore: release package"
   - This PR updates versions and CHANGELOG.md
   - It accumulates all changesets since last release

2. **Review and merge the PR** to trigger:
   - Automatic npm publish
   - GitHub release creation
   - CHANGELOG.md updates

## Commit Convention

We follow conventional commits:
- `fix:` Bug fixes (triggers patch)
- `feat:` New features (triggers minor)
- `docs:` Documentation only
- `chore:` Maintenance tasks
- `test:` Test additions/changes
- `refactor:` Code refactoring

Add `!` for breaking changes: `feat!: breaking change`

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Build package
pnpm build:packages

# Run linting
pnpm lint
```