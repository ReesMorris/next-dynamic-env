# Astilba Env; Pages Router example

This example uses the same framework-neutral Astilba Env contract as the App
Router example. It replaces `next-dynamic-env`'s globals, client proxy, and
inline script with generated modules and an application-owned JSON bootstrap.

## Requirements

- Node.js 24;
- Next.js 16.2.12; and
- React and ReactDOM 19.2.8;
- TypeScript 6.0.3; and
- `@astilba/env@0.2.2` installed exactly from the public npm registry.

## Configure and generate

Copy `.env.example` to a local `.env`, then generate the committed interface:

```sh
pnpm install
pnpm env:generate
pnpm env:check
pnpm build
```

`astilba.env.mts` declares values and bindings without reading their runtime
values. The generated server and browser modules in `.astilba/env/` are checked
before builds.

## Runtime boundaries

- `getServerSideProps` checks private server configuration without passing it
  into page props.
- `pages/api/env.ts` remains on the Node runtime. It validates the public
  target and returns the exact bootstrap envelope with
  `Cache-Control: private, no-store`.
- `EnvironmentProvider` in `_app.tsx` validates the same-origin response
  before rendering client code that uses public deployment values.

The API response audience is the configured `APPLICATION_ORIGIN`; it is never
derived from a request host header.

## Verify the migration

```sh
pnpm test
```

The verifier covers valid, missing, and malformed public bootstrap values,
server target validation, private browser-graph exclusion, legacy graph
removal, and two deployment profiles with generated artifacts unchanged.

## Intentional migration changes

This migration removes `createDynamicEnv`, proxies, `DynamicEnvScript`,
`waitForEnv`, the browser global, implicit Next build bypass, and
warning-only validation. Built-in Env codecs preserve the useful public
number, Boolean, list, URL, default, and empty-value outcomes.

The database URL rule is a synchronous private Standard Schema validator on
the Node target. Asynchronous opaque validators are unsupported; opaque
validators cannot enter the browser or Cloudflare Workers path. This example
does not claim Next.js Edge Runtime support. See the
[public migration guide](https://astilba.com/docs/env/migrate-from-next-dynamic-env/)
for the complete replacement boundary.
