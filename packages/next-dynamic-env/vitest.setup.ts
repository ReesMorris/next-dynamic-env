import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { DEFAULT_WINDOW_ENV_VAR_NAME } from './src/constants';

// Clean up window object between tests
afterEach(() => {
  // Only clean up if window is defined (client-side tests)
  if (typeof window !== 'undefined') {
    delete window[DEFAULT_WINDOW_ENV_VAR_NAME];
  }
});
