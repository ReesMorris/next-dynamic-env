import Head from 'next/head';
import { useEffect, useState } from 'react';
import { dynamicEnv } from '../../dynamic-env';

const HomePage = () => {
  // Use state to track if we're on the client after hydration
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      <Head>
        <title>Next Dynamic Env - Pages Router Demo</title>
        <meta
          name='description'
          content='Next Dynamic Env Pages Router Example'
        />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main>
        <div className='container'>
          <h1>🚀 Next Dynamic Env Demo - Pages Router</h1>
          <p>
            This example demonstrates runtime environment variables using the
            Next Pages Router. The values below are accessible on both server
            and client.
          </p>
          {isClient && (
            <p>
              Rendered on: <strong>Client (after hydration)</strong>
            </p>
          )}
        </div>

        <div className='container'>
          <span
            className={`client-indicator ${isClient ? 'client' : 'server'}`}
          >
            {isClient ? 'Client-Side (Hydrated)' : 'Server-Side Rendered'}
          </span>

          <div className='env-var'>
            <strong>API_URL:</strong> {dynamicEnv.API_URL}
          </div>

          <div className='env-var'>
            <strong>APP_NAME:</strong> {dynamicEnv.APP_NAME}
          </div>

          <div className='env-var'>
            <strong>PORT:</strong> {dynamicEnv.PORT}
          </div>

          <div className='env-var'>
            <strong>DEBUG:</strong> {dynamicEnv.DEBUG ? 'true' : 'false'}
          </div>

          <div className='env-var'>
            <strong>FEATURES:</strong> {dynamicEnv.FEATURES.join(', ')}
          </div>
        </div>

        <div className='container'>
          <h2>How it works</h2>
          <p>
            In Pages Router, the <code>DynamicEnvScript</code> is added in{' '}
            <code>_app.tsx</code> to inject environment variables into the
            window object.
          </p>
          <p>
            The same <code>dynamicEnv</code> object works on both server and
            client:
          </p>
          <ul>
            <li>
              <strong>Server-side:</strong> Values come from{' '}
              <code>process.env</code>
            </li>
            <li>
              <strong>Client-side:</strong> Values come from{' '}
              <code>window.__NEXT_DYNAMIC_ENV__</code>
            </li>
          </ul>
        </div>
      </main>
    </>
  );
};

export default HomePage;
