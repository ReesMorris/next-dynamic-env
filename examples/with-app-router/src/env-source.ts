import type { StandardSchemaV1 } from '@astilba/env/runtime';

export type DeploymentSource = Readonly<Record<string, string | undefined>>;

export const deploymentSource = (
  source: DeploymentSource = process.env
): DeploymentSource => ({
  ANALYTICS_ID: source.ANALYTICS_ID,
  API_URL: source.API_URL,
  APPLICATION_ORIGIN: source.APPLICATION_ORIGIN,
  APP_NAME: source.APP_NAME,
  CONFIG: source.CONFIG,
  DATABASE_URL: source.DATABASE_URL,
  DEBUG: source.DEBUG ?? 'false',
  FEATURES: source.FEATURES ?? '',
  MAX_CONNECTIONS: source.MAX_CONNECTIONS ?? '10',
  APPLICATION_PORT: source.APPLICATION_PORT ?? '3000',
  SECRET_KEY: source.SECRET_KEY
});

export const databaseUrlSchema: StandardSchemaV1<string, string> = {
  '~standard': {
    validate(value) {
      if (typeof value === 'string') {
        try {
          new URL(value);
          return { value };
        } catch {
          // The diagnostic remains redacted at the generated Env boundary.
        }
      }

      return { issues: [{ message: 'A valid database URL is required.' }] };
    },
    vendor: 'astilba-env-example',
    version: 1
  }
};

export const parseConfiguration = (value: string | undefined): object => {
  if (value === undefined) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(value);
    return typeof parsed === 'object' &&
      parsed !== null &&
      !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return {};
  }
};
