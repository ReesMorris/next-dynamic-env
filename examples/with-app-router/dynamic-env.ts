import { createDynamicEnv } from 'next-dynamic-env';

export const dynamicEnv = createDynamicEnv({
  APP_NAME: process.env.APP_NAME,
  API_URL: process.env.API_URL
});
