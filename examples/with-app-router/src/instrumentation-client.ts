import { clientEnv } from '@/dynamic-env';
import { waitForEnv } from 'next-dynamic-env';

(async () => {
  // This will be undefined
  console.log('This is undefined:', clientEnv.API_URL);

  // Wait for the environment to be ready
  await waitForEnv({
    onReady: () => {
      console.log('Environment is ready');
    }
  });

  // Now it should be defined
  console.log('This is defined:', clientEnv.API_URL);
})();
