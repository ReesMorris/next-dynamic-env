import { dynamicEnv } from '@/dynamic-env';
import { waitForEnv } from 'next-dynamic-env';

(async () => {
  // This will be undefined
  console.log('This is undefined:', dynamicEnv.APP_NAME);

  // Wait for the environment to be ready
  await waitForEnv({
    onReady: () => {
      console.log('Environment is ready');
    }
  });

  // Now it should be defined
  console.log('This is defined:', dynamicEnv.APP_NAME);
})();
