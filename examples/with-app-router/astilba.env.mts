import { defineEnvironment, env } from '@astilba/env';

export default defineEnvironment({
  id: 'com.astilba.example.app-router',
  entries: {
    analyticsId: env.public.deployment.string({
      minimumCodePoints: 1,
      required: false
    }),
    apiOrigin: env.public.deployment.origin(),
    applicationOrigin: env.public.deployment.origin(),
    appName: env.public.deployment.string({
      minimumCodePoints: 1,
      required: false
    }),
    configText: env.private.deployment.text({
      blank: 'missing',
      required: false
    }),
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
    maxConnections: env.private.deployment.integer({
      maximum: 10_000,
      minimum: 1
    }),
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
      'analyticsId',
      'apiOrigin',
      'applicationOrigin',
      'appName',
      'debug',
      'features',
      'port'
    ]),
    server: env.server([
      'analyticsId',
      'apiOrigin',
      'applicationOrigin',
      'appName',
      'configText',
      'databaseUrl',
      'debug',
      'features',
      'maxConnections',
      'port',
      'secretKey'
    ])
  },
  targets: {
    browserDeployment: env.process('browser', {
      analyticsId: 'ANALYTICS_ID',
      apiOrigin: 'API_URL',
      applicationOrigin: 'APPLICATION_ORIGIN',
      appName: 'APP_NAME',
      debug: 'DEBUG',
      features: 'FEATURES',
      port: 'APPLICATION_PORT'
    }),
    serverDeployment: env.process('server', {
      analyticsId: 'ANALYTICS_ID',
      apiOrigin: 'API_URL',
      applicationOrigin: 'APPLICATION_ORIGIN',
      appName: 'APP_NAME',
      configText: 'CONFIG',
      databaseUrl: 'DATABASE_URL',
      debug: 'DEBUG',
      features: 'FEATURES',
      maxConnections: 'MAX_CONNECTIONS',
      port: 'APPLICATION_PORT',
      secretKey: 'SECRET_KEY'
    })
  }
});
