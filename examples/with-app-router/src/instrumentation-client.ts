import { env } from '@/env.runtime';
import { waitForEnv } from 'next-public-env';

(async () => {
  // This will be undefined
  console.log('This is undefined:', env('APP_NAME'));

  // Wait for the environment to be ready
  await waitForEnv({
    onReady: () => {
      console.log('Environment is ready');
    }
  });

  // Now it should be defined
  console.log('This is defined:', env('APP_NAME'));
})();
