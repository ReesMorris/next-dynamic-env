// biome-ignore-all lint/suspicious/noMisplacedAssertion: This executable verifier deliberately runs Node assertions at module scope.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  BOOTSTRAP_PROTOCOL,
  loadBrowserBootstrap,
  parseBrowserBootstrap
} from '@astilba/env/browser';
import { build as bundle } from 'esbuild';
import {
  assertPinnedDependencies,
  digestApplicationArtifact,
  directoryText,
  withProductionServer
} from '../verification-utils.mts';
import {
  type Configuration,
  projection
} from './.astilba/env/browser/browser.deployment';
import { check as checkBrowser } from './.astilba/env/browserDeployment.server';
import { check as checkServer } from './.astilba/env/serverDeployment.server';
import {
  type DeploymentSource,
  databaseUrlSchema,
  deploymentSource
} from './src/env-source';
import { createSharedReadiness } from './src/environment-bootstrap';

const profiles = [
  {
    API_URL: 'https://api.staging.example.com',
    APPLICATION_ORIGIN: 'https://app.staging.example.com',
    APP_NAME: 'Staging Pages',
    DATABASE_URL: 'postgres://user:password@db/staging',
    DEBUG: 'true',
    FEATURES: 'auth,analytics',
    APPLICATION_PORT: '3001',
    SECRET_KEY: 'staging-private-key'
  },
  {
    API_URL: 'https://api.example.com',
    APPLICATION_ORIGIN: 'https://app.example.com',
    APP_NAME: 'Production Pages',
    DATABASE_URL: 'postgres://user:password@db/production',
    DEBUG: 'false',
    FEATURES: 'auth,analytics,beta',
    APPLICATION_PORT: '3000',
    SECRET_KEY: 'production-private-key'
  }
] as const satisfies readonly DeploymentSource[];

const bootstrapRecord = (
  values: object,
  origin: string
): Readonly<Record<string, unknown>> => ({
  audience: { origin },
  consumer: projection.consumer,
  contract: projection.contract,
  lifecycle: projection.lifecycle,
  projection: projection.digest,
  protocol: BOOTSTRAP_PROTOCOL,
  values
});

const bootstrap = (values: object, origin: string): string =>
  JSON.stringify(bootstrapRecord(values, origin));

const expectBootstrapFailure = (source: string, origin: string): void => {
  assert.throws(() =>
    parseBrowserBootstrap({
      expectedAudience: { origin },
      projection,
      source
    })
  );
};

await assertPinnedDependencies();

const validatedProfiles: Configuration[] = [];
for (const profile of profiles) {
  const browser = checkBrowser(deploymentSource(profile));
  assert.equal(browser.ok, true, 'public deployment profile must validate');
  if (!browser.ok) {
    throw new Error('Public deployment profile did not validate.');
  }
  assert.equal(typeof browser.value.port, 'number');
  assert.deepEqual(browser.value.features, profile.FEATURES.split(','));
  validatedProfiles.push(browser.value);

  const server = await checkServer(deploymentSource(profile), {
    databaseUrl: databaseUrlSchema
  });
  assert.equal(server.ok, true, 'private deployment profile must validate');

  const envelope = bootstrapRecord(browser.value, profile.APPLICATION_ORIGIN);
  assert.deepEqual(Object.keys(envelope).sort(), [
    'audience',
    'consumer',
    'contract',
    'lifecycle',
    'projection',
    'protocol',
    'values'
  ]);
  const parsed = parseBrowserBootstrap({
    expectedAudience: { origin: profile.APPLICATION_ORIGIN },
    projection,
    source: JSON.stringify(envelope)
  });
  assert.deepEqual(parsed.values, browser.value);

  const missingApiOrigin = { ...browser.value } as Record<string, unknown>;
  delete missingApiOrigin.apiOrigin;
  expectBootstrapFailure(
    bootstrap(missingApiOrigin, profile.APPLICATION_ORIGIN),
    profile.APPLICATION_ORIGIN
  );
  expectBootstrapFailure(
    bootstrap(
      { ...browser.value, databaseUrl: profile.DATABASE_URL },
      profile.APPLICATION_ORIGIN
    ),
    profile.APPLICATION_ORIGIN
  );
  expectBootstrapFailure(
    bootstrap(browser.value, 'https://wrong-audience.example.com'),
    profile.APPLICATION_ORIGIN
  );
  expectBootstrapFailure(
    JSON.stringify({ ...envelope, projection: 'sha256-stale-projection' }),
    profile.APPLICATION_ORIGIN
  );
  expectBootstrapFailure('not-json', profile.APPLICATION_ORIGIN);
}

const defaultedSource = deploymentSource({
  API_URL: 'https://defaults.example.com',
  APPLICATION_ORIGIN: 'https://defaults-app.example.com',
  APP_NAME: 'Defaults Pages',
  DATABASE_URL: 'postgres://user:password@db/defaults'
});
const defaultedBrowser = checkBrowser(defaultedSource);
assert.equal(defaultedBrowser.ok, true);
if (!defaultedBrowser.ok) {
  throw new Error('Default mapping did not validate.');
}
assert.equal(defaultedBrowser.value.debug, false);
assert.deepEqual(defaultedBrowser.value.features, []);
assert.equal(defaultedBrowser.value.port, 3000);
const defaultedServer = await checkServer(defaultedSource, {
  databaseUrl: databaseUrlSchema
});
assert.equal(defaultedServer.ok, true);
if (!defaultedServer.ok) {
  throw new Error('Server default mapping did not validate.');
}
assert.equal(defaultedServer.value.secretKey, undefined);

for (const invalidPort of ['1.5', '9007199254740992']) {
  assert.equal(
    checkBrowser(
      deploymentSource({ ...profiles[0], APPLICATION_PORT: invalidPort })
    ).ok,
    false,
    'safeInteger must reject non-safe or non-integral input'
  );
}

type ProjectionDecoder = (
  input: Readonly<Record<string, unknown>>,
  failure: (code: string) => never
) => Readonly<Configuration>;
const decode = (
  projection as unknown as Readonly<{ decode: ProjectionDecoder }>
).decode;
const sparseFeatures: string[] = [];
sparseFeatures.length = 3;
sparseFeatures[0] = 'auth';
sparseFeatures[2] = 'beta';
assert.throws(() =>
  decode({ ...validatedProfiles[0], features: sparseFeatures }, code => {
    throw new Error(code);
  })
);

const invalidCanary = 'never-disclose-pages-database';
const invalidServer = await checkServer(
  deploymentSource({
    ...profiles[0],
    DATABASE_URL: invalidCanary,
    APPLICATION_PORT: 'not-an-integer'
  }),
  { databaseUrl: databaseUrlSchema }
);
assert.equal(invalidServer.ok, false);
if (invalidServer.ok) {
  throw new Error('Invalid server profile unexpectedly passed.');
}
const diagnostics = JSON.stringify(invalidServer.diagnostics);
assert.equal(diagnostics.includes(invalidCanary), false);
assert.equal(diagnostics.includes(String(invalidCanary.length)), false);
assert.ok(invalidServer.diagnostics.length >= 2);

const validSource = bootstrap(
  validatedProfiles[0],
  profiles[0].APPLICATION_ORIGIN
);
const responseAtEndpoint = (body: BodyInit, init: ResponseInit): Response => {
  const response = new Response(body, init);
  Object.defineProperty(response, 'url', {
    value: `${profiles[0].APPLICATION_ORIGIN}/api/env`
  });
  return response;
};
let observedRequestInit: RequestInit | undefined;
const loaded = await loadBrowserBootstrap({
  endpoint: '/api/env',
  expectedAudience: { origin: profiles[0].APPLICATION_ORIGIN },
  fetch: (_input, init) => {
    observedRequestInit = init;
    return Promise.resolve(
      responseAtEndpoint(validSource, {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      })
    );
  },
  projection,
  requestBaseUrl: `${profiles[0].APPLICATION_ORIGIN}/`
});
assert.deepEqual(loaded.values, validatedProfiles[0]);
assert.equal(observedRequestInit?.cache, 'no-store');
assert.equal(observedRequestInit?.redirect, 'error');

const redirectedResponse = responseAtEndpoint(validSource, {
  headers: { 'Content-Type': 'application/json' },
  status: 200
});
Object.defineProperty(redirectedResponse, 'redirected', { value: true });
await assert.rejects(() =>
  loadBrowserBootstrap({
    endpoint: '/api/env',
    expectedAudience: { origin: profiles[0].APPLICATION_ORIGIN },
    fetch: () => Promise.resolve(redirectedResponse),
    projection,
    requestBaseUrl: `${profiles[0].APPLICATION_ORIGIN}/`
  })
);
await assert.rejects(() =>
  loadBrowserBootstrap({
    endpoint: '/api/env',
    expectedAudience: { origin: profiles[0].APPLICATION_ORIGIN },
    fetch: () =>
      Promise.resolve(
        responseAtEndpoint(validSource, {
          headers: { 'Content-Type': 'text/plain' },
          status: 200
        })
      ),
    projection,
    requestBaseUrl: `${profiles[0].APPLICATION_ORIGIN}/`
  })
);

let readinessCalls = 0;
const readiness = createSharedReadiness(() => {
  readinessCalls += 1;
  return Promise.resolve('ready');
});
const firstReadiness = readiness();
const secondReadiness = readiness();
assert.strictEqual(firstReadiness, secondReadiness);
assert.equal(await firstReadiness, 'ready');
assert.equal(readinessCalls, 1);

let retryCalls = 0;
const retryingReadiness = createSharedReadiness(() => {
  retryCalls += 1;
  return retryCalls === 1
    ? Promise.reject(new Error('transient-bootstrap-failure'))
    : Promise.resolve('recovered');
});
const firstFailure = retryingReadiness();
assert.strictEqual(firstFailure, retryingReadiness());
await assert.rejects(firstFailure, /transient-bootstrap-failure/);
assert.equal(await retryingReadiness(), 'recovered');
assert.equal(retryCalls, 2);

const source = await directoryText('src');
for (const legacyExecutableMarker of [
  'from "next-dynamic-env"',
  "from 'next-dynamic-env'",
  'DynamicEnvScript',
  'waitForEnv',
  '__NEXT_DYNAMIC_ENV__',
  'setInterval('
]) {
  assert.equal(
    source.includes(legacyExecutableMarker),
    false,
    `${legacyExecutableMarker} must be removed from executable source`
  );
}
assert.match(source, /Retry deployment configuration/);
const packageJson = await readFile('package.json', 'utf8');
assert.equal(packageJson.includes('"next-dynamic-env"'), false);

const gitignore = await readFile('.gitignore', 'utf8');
assert.match(gitignore, /^\.env\*$/m);
assert.match(gitignore, /^!\.env\.example$/m);
const environmentExample = await readFile('.env.example', 'utf8');
assert.match(environmentExample, /^APPLICATION_PORT=3001$/m);
assert.equal(/^PORT=/m.test(environmentExample), false);
const environmentDeclaration = await readFile('astilba.env.mts', 'utf8');
assert.match(environmentDeclaration, /port: ['"]APPLICATION_PORT['"]/);
assert.equal(/port: ['"]PORT['"]/.test(environmentDeclaration), false);

const route = await readFile('src/pages/api/env.ts', 'utf8');
assert.match(route, /runtime: ['"]nodejs['"]/);
assert.match(route, /Cache-Control.*private, no-store/);
assert.equal(/headers\.get\(|forwarded|host/i.test(route), false);

await assert.rejects(() =>
  bundle({
    bundle: true,
    logLevel: 'silent',
    platform: 'browser',
    stdin: {
      contents: 'import "./.astilba/env/serverDeployment.server.ts";',
      loader: 'ts',
      resolveDir: process.cwd()
    },
    write: false
  })
);

const artifactDigest = await digestApplicationArtifact();
const runtimeEvidence: string[] = [];
for (const [index, profile] of profiles.entries()) {
  const runtime = await withProductionServer(
    profile,
    43_200 + index,
    async baseUrl => {
      const [pageResponse, environmentResponse] = await Promise.all([
        fetch(baseUrl, { redirect: 'error' }),
        fetch(`${baseUrl}/api/env`, { redirect: 'error' })
      ]);
      const page = await pageResponse.text();
      const environment = await environmentResponse.text();
      assert.equal(pageResponse.status, 200);
      assert.equal(environmentResponse.status, 200);
      assert.equal(
        environmentResponse.headers.get('cache-control'),
        'private, no-store'
      );
      const parsed = parseBrowserBootstrap({
        expectedAudience: { origin: profile.APPLICATION_ORIGIN },
        projection,
        source: environment
      });
      assert.equal(parsed.values.apiOrigin, profile.API_URL);
      assert.equal(parsed.values.port, Number(profile.APPLICATION_PORT));
      for (const privateValue of [profile.DATABASE_URL, profile.SECRET_KEY]) {
        assert.equal(page.includes(privateValue), false);
        assert.equal(environment.includes(privateValue), false);
      }
      return `${page}\n${environment}`;
    }
  );
  runtimeEvidence.push(runtime.result, runtime.logs);
  for (const privateValue of [profile.DATABASE_URL, profile.SECRET_KEY]) {
    assert.equal(runtime.logs.includes(privateValue), false);
  }
  assert.equal(await digestApplicationArtifact(), artifactDigest);
}

const browserBytes = await directoryText('.next/static');
const serverBytes = await directoryText('.next/server');
for (const privateMarker of [
  'databaseUrl',
  'secretKey',
  'DATABASE_URL',
  'SECRET_KEY',
  ...profiles.flatMap(profile => [profile.DATABASE_URL, profile.SECRET_KEY])
]) {
  assert.equal(
    browserBytes.includes(privateMarker),
    false,
    `${privateMarker} must be absent from the browser artifact`
  );
}
for (const privateValue of profiles.flatMap(profile => [
  profile.DATABASE_URL,
  profile.SECRET_KEY
])) {
  assert.equal(serverBytes.includes(privateValue), false);
  assert.equal(runtimeEvidence.join('\n').includes(privateValue), false);
}

console.log(
  JSON.stringify({
    artifactDigest,
    example: 'pages-router',
    package: '@astilba/env@0.2.2',
    profiles: profiles.length,
    status: 'pass'
  })
);
