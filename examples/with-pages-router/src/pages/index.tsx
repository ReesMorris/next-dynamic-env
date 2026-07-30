import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import { useContext } from 'react';
import { load } from '../../.astilba/env/serverDeployment.server';
import { databaseUrlSchema, deploymentSource } from '../env-source';
import { EnvironmentContext } from '../environment-provider';

export const getServerSideProps = (async () => {
  await load(deploymentSource(), { databaseUrl: databaseUrlSchema });

  return { props: { serverConfigurationValidated: true } };
}) satisfies GetServerSideProps<{ serverConfigurationValidated: true }>;

const HomePage = ({
  serverConfigurationValidated
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const configuration = useContext(EnvironmentContext);

  if (configuration === undefined) {
    return (
      <main>
        <output aria-live='polite'>Loading deployment configuration.</output>
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>Astilba Env - Pages Router Demo</title>
        <meta name='description' content='Astilba Env Pages Router Example' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main>
        <div className='container'>
          <h1>🚀 Astilba Env Demo - Pages Router</h1>
          <p>
            This example demonstrates runtime environment variables using the
            Next Pages Router. The values below are accessible on both server
            and client.
          </p>
          <p>
            Server configuration:{' '}
            <strong>
              {serverConfigurationValidated ? 'validated' : 'unavailable'}
            </strong>
          </p>
        </div>

        <div className='container'>
          <span className='client-indicator client'>
            Client-side validated bootstrap
          </span>

          <div className='env-var'>
            <strong>API_URL:</strong> {configuration.apiOrigin}
          </div>

          <div className='env-var'>
            <strong>APP_NAME:</strong> {configuration.appName}
          </div>

          <div className='env-var'>
            <strong>PORT:</strong> {configuration.port}
          </div>

          <div className='env-var'>
            <strong>DEBUG:</strong> {configuration.debug ? 'true' : 'false'}
          </div>

          <div className='env-var'>
            <strong>FEATURES:</strong> {configuration.features.join(', ')}
          </div>
        </div>

        <div className='container'>
          <h2>How it works</h2>
          <p>
            In Pages Router, the Node API route validates public deployment
            configuration and returns inert JSON to the provider in{' '}
            <code>_app.tsx</code>.
          </p>
          <p>Server and browser boundaries are explicit:</p>
          <ul>
            <li>
              <strong>Server-side:</strong> The generated target validates
              private configuration without serialising it into props
            </li>
            <li>
              <strong>Client-side:</strong> Public values load from a
              same-origin, no-store JSON bootstrap
            </li>
          </ul>
        </div>
      </main>
    </>
  );
};

export default HomePage;
