# Astilba Env; App Router example

This example replaces `next-dynamic-env`'s inline script, globals, proxies,
and polling with a generated Astilba Env contract and an application-owned
bootstrap route. It keeps one Next.js artifact independent of deployment
configuration.

## Requirements

- Node.js 24;
- Next.js 16.2.12;
- React and ReactDOM 19.2.8;
- TypeScript 6.0.3; and
- `@astilba/env@0.2.2` installed exactly from the public npm registry.

## Configure and generate

Copy `.env.example` to a local `.env` for development. Do not supply a
deployment configuration while building the Docker image.

```sh
pnpm install
pnpm env:generate
pnpm env:check
pnpm build
```

`astilba.env.mts` declares public and private deployment entries without
reading them. The committed `.astilba/env/` directory contains generated,
application-owned server and browser modules. `env:check` makes generated
output drift fail the build.

## Runtime boundaries

- `src/app/server/server.tsx` loads the generated server target and can access
  validated private configuration without serialising it into the browser.
- `src/app/api/env/route.ts` is a force-dynamic Node route. It validates the
  public target and returns the exact bootstrap envelope with
  `Cache-Control: private, no-store`.
- `EnvironmentProvider` loads and validates that same-origin JSON response
  before mounting client code that depends on configuration.
- `instrumentation-client.ts` shares the provider's readiness promise only for
  Env-dependent instrumentation. It does not delay unrelated hydration.

`APPLICATION_ORIGIN` must exactly match the browser-facing canonical,
non-localhost HTTPS origin. Local development needs a locally trusted HTTPS
hostname and TLS proxy, such as `https://app.example.test`; default
`localhost` is not valid. The endpoint never derives the audience from `Host`
or forwarded headers.

## Run once; deploy twice

Build without deployment values, then run the same standalone artifact with
different values:

Run the build from the monorepo root because the Dockerfile uses the frozen
workspace lockfile while copying only this public-package consumer:

```sh
docker build -f examples/with-app-router/Dockerfile \
  -t astilba-env-app-router .
docker run --rm -p 3000:3000 \
  -e API_URL=https://api.staging.example.com \
  -e APPLICATION_ORIGIN=https://app.staging.example.com \
  -e DATABASE_URL=postgres://user:password@db/staging \
  -e SECRET_KEY=staging-secret \
  astilba-env-app-router
```

The public browser values change at the JSON boundary. Private source names
and values stay out of the browser graph and response.

## Verify the migration

```sh
pnpm test
```

The example verifier checks valid, missing, and malformed bootstrap behavior;
the trusted configured audience; legacy graph removal; private browser-graph
exclusion; shared instrumentation readiness; and two deployment profiles.

## Intentional migration changes

This is not a package rename. It removes `createDynamicEnv`, client and server
proxies, `DynamicEnvScript`, `waitForEnv`, the mutable browser global, implicit
Next build bypass, and warning-only validation. Built-in Env codecs replace
the useful public number, Boolean, list, URL, default, and empty-value
outcomes.

The custom database URL rule is a synchronous private Standard Schema
validator on the Node target. Asynchronous opaque validators are unsupported;
opaque validators cannot enter the browser or Cloudflare Workers path. This
example does not claim Next.js Edge Runtime support. See the
[public migration guide](https://astilba.com/docs/env/migrate-from-next-dynamic-env/)
for the complete replacement boundary.
