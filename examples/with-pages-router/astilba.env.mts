import { defineEnvironment, env } from '@astilba/env';

export default defineEnvironment({
  id: 'com.astilba.example.pages-router',
  entries: {
    apiOrigin: env.public.deployment.origin(),
    appName: env.public.deployment.string({ minimumCodePoints: 1 }),
    applicationOrigin: env.public.deployment.origin(),
    databaseUrl: env.private.deployment.opaque({
      input: { kind: 'string' },
      output: { kind: 'string' },
      revision: '1',
      semantics: 'com.astilba.example.database-url/v1'
    }),
    debug: env.public.deployment.boolean({
      blank: 'invalid',
      falseInput: 'false',
      trueInput: 'true'
    }),
    features: env.public.deployment.stringList({ emptyItems: 'drop' }),
    port: env.public.deployment.safeInteger({
      maximum: 65_535,
      minimum: 1
    }),
    secretKey: env.private.deployment.secret({
      blank: 'missing',
      required: false
    })
  },
  consumers: {
    browser: env.browser([
      'apiOrigin',
      'appName',
      'applicationOrigin',
      'debug',
      'features',
      'port'
    ]),
    server: env.server([
      'apiOrigin',
      'appName',
      'applicationOrigin',
      'databaseUrl',
      'debug',
      'features',
      'port',
      'secretKey'
    ])
  },
  targets: {
    browserDeployment: env.process('browser', {
      apiOrigin: 'API_URL',
      appName: 'APP_NAME',
      applicationOrigin: 'APPLICATION_ORIGIN',
      debug: 'DEBUG',
      features: 'FEATURES',
      port: 'APPLICATION_PORT'
    }),
    serverDeployment: env.process('server', {
      apiOrigin: 'API_URL',
      appName: 'APP_NAME',
      applicationOrigin: 'APPLICATION_ORIGIN',
      databaseUrl: 'DATABASE_URL',
      debug: 'DEBUG',
      features: 'FEATURES',
      port: 'APPLICATION_PORT',
      secretKey: 'SECRET_KEY'
    })
  }
});
