import { Client } from './client';
import { Server } from './server';

const HomePage = () => {
  return (
    <main>
      <div className='container'>
        <h1>🚀 Next Public Env Demo</h1>
        <p>
          This example demonstrates runtime environment variables using the Next
          App Router. The examples below show how to access these variables in
          both client and server components.
        </p>
        <p>
          Also check the console output to see it running in{' '}
          <code>instrumentation-client.ts</code>.
        </p>
      </div>

      <Client />
      <Server />
    </main>
  );
};

export default HomePage;
