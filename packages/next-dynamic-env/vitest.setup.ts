import '@testing-library/jest-dom';
import { afterEach } from 'vitest';

// Clean up window object between tests
afterEach(() => {
  // Only clean up if window is defined (client-side tests)
  if (typeof window !== 'undefined') {
    // Remove any dynamic env variables from window
    Object.keys(window).forEach(key => {
      if (key.startsWith('__') && key.includes('ENV')) {
        // biome-ignore lint/suspicious/noExplicitAny: Window type is not explicitly typed
        delete (window as any)[key];
      }
    });
  }
});
