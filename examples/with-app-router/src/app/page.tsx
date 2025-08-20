import { Client } from './client';
import { Server } from './server';

const HomePage = () => {
  return (
    <main>
      <div className='container'>
        <h1>🚀 Next Dynamic Env Demo - App Router</h1>
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
      <Client />

      <div className='container'>
        <h2>How it works</h2>
        <p>
          In App Router, the <code>DynamicEnvScript</code> is added in{' '}
          <code>layout.tsx</code> to inject environment variables into the
          window object.
        </p>
        <p>
          The same <code>dynamicEnv</code> object works in both Server and
          Client Components:
        </p>
        <ul>
          <li>
            <strong>Server Components:</strong> Values come directly from{' '}
            <code>process.env</code> during server-side rendering
          </li>
          <li>
            <strong>Client Components:</strong> Values come from{' '}
            <code>window.__NEXT_DYNAMIC_ENV__</code> after hydration
          </li>
          <li>
            <strong>Instrumentation:</strong> Available at app initialization
            for telemetry and logging setup
          </li>
        </ul>
        <p>
          The App Router's component model makes this particularly elegant -
          Server Components have direct access while Client Components
          automatically use the injected values.
        </p>
      </div>
    </main>
  );
};

export default HomePage;
