import { createEnv } from 'next-public-env';

// Define all environment variables you want to be available in the client
export const RUNTIME_ENV = {
  APP_NAME: process.env.APP_NAME,
  API_URL: process.env.API_URL
} as const;

// Create the typed env function
export const env = createEnv(RUNTIME_ENV);
