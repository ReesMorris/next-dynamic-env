import type { StandardSchemaV1 } from '@astilba/env/runtime';

export type DeploymentSource = Readonly<Record<string, string | undefined>>;

export const deploymentSource = (
  source: DeploymentSource = process.env
): DeploymentSource => ({
  API_URL: source.API_URL,
  APP_NAME: source.APP_NAME,
  APPLICATION_ORIGIN: source.APPLICATION_ORIGIN,
  DATABASE_URL: source.DATABASE_URL,
  DEBUG: source.DEBUG ?? 'false',
  FEATURES: source.FEATURES ?? '',
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
