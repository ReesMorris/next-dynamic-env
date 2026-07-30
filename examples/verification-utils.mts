// biome-ignore-all lint/suspicious/noMisplacedAssertion: These helpers implement an executable verification harness.
import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const ENV_INTEGRITY =
  'sha512-B6UaBdrKPRPvwNzo5CIhWtBiZjijxxAObj62TIA8Z52HBwVYyy//IjcxVNe2e+TUvmh0cFsg2WzvCBHrOylrng==';

export const assertPinnedDependencies = async (): Promise<void> => {
  const packageMetadata = JSON.parse(
    await readFile('node_modules/@astilba/env/package.json', 'utf8')
  ) as { name?: unknown; version?: unknown };
  assert.deepEqual(
    { name: packageMetadata.name, version: packageMetadata.version },
    { name: '@astilba/env', version: '0.2.2' }
  );

  for (const [name, version] of [
    ['next', '16.2.12'],
    ['react', '19.2.8'],
    ['react-dom', '19.2.8']
  ] as const) {
    const installed = JSON.parse(
      await readFile(`node_modules/${name}/package.json`, 'utf8')
    ) as { version?: unknown };
    assert.equal(installed.version, version);
  }

  assert.equal(
    execFileSync('node_modules/.bin/tsc', ['--version'], {
      encoding: 'utf8'
    }).trim(),
    'Version 6.0.3'
  );
  const lockfile = await readFile('../../pnpm-lock.yaml', 'utf8');
  assert.match(
    lockfile,
    new RegExp(
      String.raw`'@astilba/env@0\.2\.2':\n\s+resolution: \{integrity: ${ENV_INTEGRITY.replace('+', String.raw`\+`)}\}`
    )
  );
};

export const filesIn = async (directory: string): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(entry => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? filesIn(path) : [path];
    })
  );
  return files.flat();
};

export const digestDirectory = async (directory: string): Promise<string> => {
  const files = (await filesIn(directory)).sort();
  const hash = createHash('sha256');

  for (const file of files) {
    hash.update(file);
    hash.update(await readFile(file));
  }

  return hash.digest('hex');
};

export const digestApplicationArtifact = async (): Promise<string> => {
  const paths = [
    '.next/BUILD_ID',
    '.next/required-server-files.json',
    '.next/routes-manifest.json',
    ...(await filesIn('.next/server')),
    ...(await filesIn('.next/static'))
  ].sort();
  const hash = createHash('sha256');

  for (const path of paths) {
    hash.update(path);
    hash.update(await readFile(path));
  }

  return hash.digest('hex');
};

export const directoryText = async (directory: string): Promise<string> =>
  (
    await Promise.all(
      (await filesIn(directory)).map(file => readFile(file, 'utf8'))
    )
  ).join('\n');

const delay = async (milliseconds: number): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, milliseconds));
};

export const withProductionServer = async <T,>(
  environment: Readonly<Record<string, string>>,
  port: number,
  run: (baseUrl: string) => Promise<T>
): Promise<Readonly<{ logs: string; result: T }>> => {
  const next = join(process.cwd(), 'node_modules/next/dist/bin/next');
  const child = spawn(
    process.execPath,
    [next, 'start', '--hostname', '127.0.0.1', '--port', String(port)],
    {
      cwd: process.cwd(),
      env: { ...process.env, ...environment, NODE_ENV: 'production' },
      stdio: ['ignore', 'pipe', 'pipe']
    }
  );
  let logs = '';
  let spawnError: Error | undefined;
  const exited = new Promise<void>(resolve => {
    child.once('exit', () => resolve());
    child.once('error', error => {
      spawnError = error;
      logs += `\nNext production server spawn failed: ${error.message}`;
      resolve();
    });
  });
  child.stdout.on('data', chunk => {
    logs += String(chunk);
  });
  child.stderr.on('data', chunk => {
    logs += String(chunk);
  });

  const baseUrl = `http://127.0.0.1:${port}`;
  try {
    let ready = false;
    for (let attempt = 0; attempt < 100; attempt += 1) {
      if (spawnError) {
        break;
      }
      try {
        const response = await fetch(baseUrl, { redirect: 'error' });
        if (response.status < 500) {
          ready = true;
          break;
        }
      } catch {
        // The production server may still be starting.
      }
      await delay(100);
    }

    if (!ready) {
      throw new Error(`Next production server did not become ready.\n${logs}`);
    }

    return { logs, result: await run(baseUrl) };
  } finally {
    if (child.exitCode === null && child.signalCode === null) {
      child.kill('SIGTERM');
    }
    const exitedGracefully = await Promise.race([
      exited.then(() => true),
      delay(5_000).then(() => false)
    ]);
    if (!exitedGracefully) {
      child.kill('SIGKILL');
      await exited;
    }
  }
};
