import { Client } from './client';
import { EnvironmentProvider } from './environment-provider';
import { Server } from './server';

// Force dynamic rendering to ensure runtime environment variables are loaded
export const dynamic = 'force-dynamic';

const HomePage = () => {
  return (
    <main>
      <div className='container'>
        <h1>🚀 Astilba Env Demo - App Router</h1>
        <p>
          This example demonstrates runtime environment variables using the Next
          App Router. The values below are accessible in both Server and Client
          Components.
        </p>
        <p>
          Also check the console output to see it running in{' '}
          <code>instrumentation-client.ts</code>.
        </p>
      </div>

      <Server />
      <EnvironmentProvider>
        <Client />
      </EnvironmentProvider>

      <div className='container'>
        <h2>How it works</h2>
        <p>
          In App Router, a Node runtime endpoint validates public deployment
          configuration and returns inert JSON to a Client Component.
        </p>
        <p>Server and browser boundaries are explicit:</p>
        <ul>
          <li>
            <strong>Server Components:</strong> The generated server target
            validates deployment values during server-side rendering
          </li>
          <li>
            <strong>Client Components:</strong> Public values arrive through a
            same-origin, no-store JSON bootstrap after validation
          </li>
          <li>
            <strong>Instrumentation:</strong> Env-dependent work shares the
            validated bootstrap promise; it does not delay unrelated hydration
          </li>
        </ul>
        <p>
          Private configuration remains in the server graph. The browser never
          receives private source names or values.
        </p>
      </div>
    </main>
  );
};

export default HomePage;
