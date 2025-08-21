import { DEFAULT_WINDOW_ENV_VAR_NAME } from '@/constants';
import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ClientEnv, ProcessedEnv } from '../types';
import { DynamicEnvScript } from './dynamic-env-script';

// Helper to create mock ClientEnv objects
function createMockClientEnv<T extends ProcessedEnv>(env: T): ClientEnv<T> {
  return new Proxy({} as ClientEnv<T>, {
    get(_, prop: string | symbol) {
      if (prop === '__raw') {
        return env;
      }
      if (prop === '__isClient') {
        return true;
      }
      const key = String(prop);
      return env[key as keyof T];
    },
    has(_, prop: string | symbol) {
      const key = String(prop);
      return key === '__raw' || key === '__isClient' || key in env;
    },
    ownKeys() {
      return [...Object.keys(env), '__raw', '__isClient'];
    },
    getOwnPropertyDescriptor(_, prop: string | symbol) {
      const key = String(prop);
      if (key === '__raw' || key === '__isClient' || key in env) {
        return { configurable: true, enumerable: true };
      }
      return undefined;
    }
  });
}

// Mock Next.js Script component
vi.mock('next/script', () => ({
  default: ({ children, dangerouslySetInnerHTML, ...props }: any) => {
    // Extract the script content and execute it for testing
    const scriptContent = children || dangerouslySetInnerHTML?.__html;
    if (scriptContent) {
      try {
        // biome-ignore lint/security/noGlobalEval: Needed for testing
        eval(scriptContent);
      } catch (e) {
        console.error('Error executing script:', e);
      }
    }
    return <script {...props} data-testid='next-script' />;
  }
}));

describe('DynamicEnvScript', () => {
  beforeEach(() => {
    // Clear console mocks
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render script with default id', () => {
      const env = createMockClientEnv({ API_URL: 'https://api.example.com' });
      const { container } = render(<DynamicEnvScript clientEnv={env} />);

      const script = container.querySelector('[data-testid="next-script"]');
      expect(script).toBeTruthy();
      expect(script?.getAttribute('id')).toBe('next-dynamic-env-script');
    });

    it('should render script with custom id', () => {
      const env = createMockClientEnv({ API_URL: 'https://api.example.com' });
      const { container } = render(
        <DynamicEnvScript clientEnv={env} id='custom-id' />
      );

      const script = container.querySelector('[data-testid="next-script"]');
      expect(script).toBeTruthy();
      expect(script?.getAttribute('id')).toBe('custom-id');
    });

    it('should use beforeInteractive strategy', () => {
      const env = createMockClientEnv({ API_URL: 'https://api.example.com' });
      const { container } = render(<DynamicEnvScript clientEnv={env} />);

      const script = container.querySelector('[data-testid="next-script"]');
      expect(script).toBeTruthy();
      expect(script?.getAttribute('strategy')).toBe('beforeInteractive');
    });
  });

  describe('environment injection', () => {
    it('should inject environment variables into window object', () => {
      const env = createMockClientEnv({
        API_URL: 'https://api.example.com',
        APP_NAME: 'Test App'
      });

      render(<DynamicEnvScript clientEnv={env} />);

      expect(window[DEFAULT_WINDOW_ENV_VAR_NAME]).toEqual({
        API_URL: 'https://api.example.com',
        APP_NAME: 'Test App'
      });
    });

    it('should filter out undefined values', () => {
      const env = createMockClientEnv({
        API_URL: 'https://api.example.com',
        UNDEFINED_VAR: undefined,
        APP_NAME: 'Test App'
      });

      render(<DynamicEnvScript clientEnv={env} />);

      expect(window[DEFAULT_WINDOW_ENV_VAR_NAME]).toEqual({
        API_URL: 'https://api.example.com',
        APP_NAME: 'Test App'
      });
      expect(
        window[DEFAULT_WINDOW_ENV_VAR_NAME]?.UNDEFINED_VAR
      ).toBeUndefined();
    });

    it('should preserve processed values (arrays, numbers, booleans)', () => {
      const env = createMockClientEnv({
        STRING_VAR: 'text',
        NUMBER_VAR: 123 as any,
        BOOLEAN_VAR: true as any,
        ARRAY_VAR: ['item1', 'item2'] as any,
        NULL_VAR: null as any
      });

      render(<DynamicEnvScript clientEnv={env} />);

      expect(window[DEFAULT_WINDOW_ENV_VAR_NAME]).toEqual({
        STRING_VAR: 'text',
        NUMBER_VAR: 123,
        BOOLEAN_VAR: true,
        ARRAY_VAR: ['item1', 'item2'],
        NULL_VAR: null
      });
    });
  });

  describe('security', () => {
    it('should filter out values containing </script> tags', () => {
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      const env = createMockClientEnv({
        SAFE_VAR: 'safe value',
        UNSAFE_VAR: 'malicious </script><script>alert("XSS")</script>',
        ANOTHER_SAFE: 'another safe value'
      });

      render(<DynamicEnvScript clientEnv={env} />);

      expect(window[DEFAULT_WINDOW_ENV_VAR_NAME]).toEqual({
        SAFE_VAR: 'safe value',
        ANOTHER_SAFE: 'another safe value'
      });
      expect(window[DEFAULT_WINDOW_ENV_VAR_NAME]?.UNSAFE_VAR).toBeUndefined();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[next-dynamic-env] Env var "UNSAFE_VAR" contains </script> tag and was filtered out'
      );
    });
  });

  describe('with createDynamicEnv', () => {
    // Test with plain object to verify the functionality works
    it('should work with plain environment object', () => {
      const env = createMockClientEnv({
        API_URL: 'https://api.example.com',
        APP_NAME: 'Test App'
      });

      render(<DynamicEnvScript clientEnv={env} />);

      expect(window[DEFAULT_WINDOW_ENV_VAR_NAME]).toEqual({
        API_URL: 'https://api.example.com',
        APP_NAME: 'Test App'
      });
    });
  });

  describe('development warnings', () => {
    beforeEach(() => {
      // Set NODE_ENV to development for these tests
      process.env.NODE_ENV = 'development';
    });

    it('should call onMissingVar for undefined values in development', () => {
      const onMissingVar = vi.fn();

      const env = createMockClientEnv({
        API_URL: 'https://api.example.com',
        UNDEFINED_VAR: undefined,
        NULL_VAR: null as any,
        EMPTY_VAR: '',
        VALID_VAR: 'valid'
      });

      render(<DynamicEnvScript clientEnv={env} onMissingVar={onMissingVar} />);

      expect(onMissingVar).toHaveBeenCalledTimes(3);
      expect(onMissingVar).toHaveBeenCalledWith('UNDEFINED_VAR');
      expect(onMissingVar).toHaveBeenCalledWith('NULL_VAR');
      expect(onMissingVar).toHaveBeenCalledWith('EMPTY_VAR');
      expect(onMissingVar).not.toHaveBeenCalledWith('API_URL');
      expect(onMissingVar).not.toHaveBeenCalledWith('VALID_VAR');
    });

    it('should not call onMissingVar in production', () => {
      process.env.NODE_ENV = 'production';
      const onMissingVar = vi.fn();

      const env = createMockClientEnv({
        API_URL: 'https://api.example.com',
        UNDEFINED_VAR: undefined
      });

      render(<DynamicEnvScript clientEnv={env} onMissingVar={onMissingVar} />);

      expect(onMissingVar).not.toHaveBeenCalled();
    });
  });
});
