import {
  loadBrowserBootstrap,
  type ValidatedBootstrap
} from '@astilba/env/browser';
import {
  type Configuration,
  projection
} from '../../.astilba/env/browser/browser.deployment';

export const createSharedReadiness = <T>(
  loader: () => Promise<T>
): (() => Promise<T>) => {
  let readiness: Promise<T> | undefined;

  return () => {
    readiness ??= loader().catch((error: unknown) => {
      readiness = undefined;
      throw error;
    });
    return readiness;
  };
};

export const loadDeploymentEnvironment = createSharedReadiness<
  ValidatedBootstrap<Configuration>
>(() =>
  loadBrowserBootstrap({
    endpoint: '/api/env',
    expectedAudience: { origin: window.location.origin },
    fetch: globalThis.fetch,
    projection,
    requestBaseUrl: window.location.href
  })
);
