import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { createDynamicEnv } from './create-dynamic-env';

// Mock isBrowser utility
vi.mock('@/utils', () => ({
  isBrowser: vi.fn(() => false)
}));

import { isBrowser } from '@/utils';

describe('createDynamicEnv with server/client separation', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalWindow = global.window;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to server-side by default
    vi.mocked(isBrowser).mockReturnValue(false);
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    global.window = originalWindow;
  });

  describe('Server-side behavior', () => {
    it('should access both server and client variables on the server', () => {
      const env = createDynamicEnv({
        schema: z.object({
          CLIENT_VAR: z.string(),
          SERVER_VAR: z.string()
        }),
        client: {
          CLIENT_VAR: 'client-value'
        },
        server: {
          SERVER_VAR: 'server-value'
        }
      });

      expect(env.CLIENT_VAR).toBe('client-value');
      expect(env.SERVER_VAR).toBe('server-value');
    });

    it('should include all variables in __raw on server', () => {
      const env = createDynamicEnv({
        schema: z.object({
          CLIENT_VAR: z.string(),
          SERVER_VAR: z.string()
        }),
        client: {
          CLIENT_VAR: 'client-value'
        },
        server: {
          SERVER_VAR: 'server-value'
        }
      });

      expect(env.__raw).toEqual({
        CLIENT_VAR: 'client-value',
        SERVER_VAR: 'server-value'
      });
    });

    it('should apply transformations to both server and client vars', () => {
      const env = createDynamicEnv({
        schema: z.object({
          CLIENT_PORT: z.coerce.number(),
          SERVER_PORT: z.coerce.number()
        }),
        client: {
          CLIENT_PORT: '3000'
        },
        server: {
          SERVER_PORT: '5000'
        }
      });

      expect(env.CLIENT_PORT).toBe(3000);
      expect(env.SERVER_PORT).toBe(5000);
      expect(typeof env.CLIENT_PORT).toBe('number');
      expect(typeof env.SERVER_PORT).toBe('number');
    });
  });

  describe('Client-side behavior', () => {
    beforeEach(() => {
      vi.mocked(isBrowser).mockReturnValue(true);
      // Setup minimal window object
      global.window = {} as any;
    });

    it('should access client variables on the client', () => {
      const env = createDynamicEnv({
        schema: z.object({
          CLIENT_VAR: z.string(),
          SERVER_VAR: z.string().optional()
        }),
        client: {
          CLIENT_VAR: 'client-value'
        },
        server: {
          SERVER_VAR: 'server-value'
        }
      });

      expect(env.CLIENT_VAR).toBe('client-value');
    });

    it('should throw error when accessing server variables on client in development by default', () => {
      process.env.NODE_ENV = 'development';

      const env = createDynamicEnv({
        schema: z.object({
          CLIENT_VAR: z.string(),
          SERVER_VAR: z.string().optional()
        }),
        client: {
          CLIENT_VAR: 'client-value'
        },
        server: {
          SERVER_VAR: 'server-value'
        }
        // onValidationError defaults to 'throw'
      });

      expect(() => env.SERVER_VAR).toThrow(
        'Attempted to access server-only environment variable "SERVER_VAR" on the client'
      );
    });

    it('should warn instead of throwing when onValidationError is "warn"', () => {
      process.env.NODE_ENV = 'development';
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const env = createDynamicEnv({
        schema: z.object({
          CLIENT_VAR: z.string(),
          SERVER_VAR: z.string().optional()
        }),
        client: {
          CLIENT_VAR: 'client-value'
        },
        server: {
          SERVER_VAR: 'server-value'
        },
        onValidationError: 'warn'
      });

      // Should not throw
      expect(() => env.SERVER_VAR).not.toThrow();

      // Should return undefined
      expect(env.SERVER_VAR).toBeUndefined();

      // Should have warned
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'Attempted to access server-only environment variable "SERVER_VAR" on the client'
        )
      );

      warnSpy.mockRestore();
    });

    it('should warn with custom error handler for server variable access', () => {
      process.env.NODE_ENV = 'development';
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const customHandler = vi.fn();

      const env = createDynamicEnv({
        schema: z.object({
          CLIENT_VAR: z.string(),
          SERVER_VAR: z.string().optional()
        }),
        client: {
          CLIENT_VAR: 'client-value'
        },
        server: {
          SERVER_VAR: 'server-value'
        },
        onValidationError: customHandler
      });

      // Should not throw
      expect(() => env.SERVER_VAR).not.toThrow();

      // Should return undefined
      expect(env.SERVER_VAR).toBeUndefined();

      // Should have warned (custom handlers get a console.warn for server access)
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'Attempted to access server-only environment variable "SERVER_VAR" on the client'
        )
      );

      warnSpy.mockRestore();
    });

    it('should return undefined for server variables on client in production', () => {
      process.env.NODE_ENV = 'production';

      const env = createDynamicEnv({
        schema: z.object({
          CLIENT_VAR: z.string(),
          SERVER_VAR: z.string().optional()
        }),
        client: {
          CLIENT_VAR: 'client-value'
        },
        server: {
          SERVER_VAR: 'server-value'
        }
      });

      expect(env.SERVER_VAR).toBeUndefined();
    });

    it('should only include client variables in __raw on client', () => {
      const env = createDynamicEnv({
        schema: z.object({
          CLIENT_VAR1: z.string(),
          CLIENT_VAR2: z.string(),
          SERVER_VAR1: z.string().optional(),
          SERVER_VAR2: z.string().optional()
        }),
        client: {
          CLIENT_VAR1: 'client-1',
          CLIENT_VAR2: 'client-2'
        },
        server: {
          SERVER_VAR1: 'server-1',
          SERVER_VAR2: 'server-2'
        }
      });

      expect(env.__raw).toEqual({
        CLIENT_VAR1: 'client-1',
        CLIENT_VAR2: 'client-2'
      });
      expect(env.__raw.SERVER_VAR1).toBeUndefined();
      expect(env.__raw.SERVER_VAR2).toBeUndefined();
    });

    it('should use window values for client variables when available', () => {
      global.window = {
        __NEXT_DYNAMIC_ENV__: {
          CLIENT_VAR: 'window-value'
        }
      } as any;

      const env = createDynamicEnv({
        schema: z.object({
          CLIENT_VAR: z.string()
        }),
        client: {
          CLIENT_VAR: 'build-time-value'
        },
        server: {}
      });

      expect(env.CLIENT_VAR).toBe('window-value');
    });

    it('should validate and transform window values', () => {
      global.window = {
        __NEXT_DYNAMIC_ENV__: {
          CLIENT_PORT: '8080'
        }
      } as any;

      const env = createDynamicEnv({
        schema: z.object({
          CLIENT_PORT: z.coerce.number()
        }),
        client: {
          CLIENT_PORT: '3000'
        },
        server: {}
      });

      expect(env.CLIENT_PORT).toBe(8080);
      expect(typeof env.CLIENT_PORT).toBe('number');
    });

    it('should use custom varName for window object', () => {
      global.window = {
        MY_CUSTOM_ENV: {
          CLIENT_VAR: 'custom-window-value'
        }
      } as any;

      const env = createDynamicEnv({
        schema: z.object({
          CLIENT_VAR: z.string()
        }),
        client: {
          CLIENT_VAR: 'default-value'
        },
        server: {},
        varName: 'MY_CUSTOM_ENV'
      });

      expect(env.CLIENT_VAR).toBe('custom-window-value');
    });
  });

  describe('Validation and error handling', () => {
    it('should throw validation errors by default', () => {
      expect(() =>
        createDynamicEnv({
          schema: z.object({
            REQUIRED_VAR: z.string().min(1)
          }),
          client: {
            REQUIRED_VAR: ''
          },
          server: {}
        })
      ).toThrow();
    });

    it('should warn on validation errors when configured', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const env = createDynamicEnv({
        schema: z.object({
          REQUIRED_VAR: z.string().min(1)
        }),
        client: {
          REQUIRED_VAR: ''
        },
        server: {},
        onValidationError: 'warn'
      });

      expect(warnSpy).toHaveBeenCalled();
      expect(env.REQUIRED_VAR).toBe('');

      warnSpy.mockRestore();
    });

    it('should call custom error handler', () => {
      const errorHandler = vi.fn();

      const env = createDynamicEnv({
        schema: z.object({
          REQUIRED_VAR: z.string().min(1)
        }),
        client: {
          REQUIRED_VAR: ''
        },
        server: {},
        onValidationError: errorHandler
      });

      expect(errorHandler).toHaveBeenCalled();
      expect(env.REQUIRED_VAR).toBe('');
    });

    it('should skip validation when configured', () => {
      const env = createDynamicEnv({
        schema: z.object({
          REQUIRED_VAR: z.string().min(1)
        }),
        client: {
          REQUIRED_VAR: ''
        },
        server: {},
        skipValidation: true
      });

      expect(env.REQUIRED_VAR).toBe('');
    });
  });

  describe('Mixed environment configurations', () => {
    it('should handle variables defined in both server and client', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const env = createDynamicEnv({
        schema: z.object({
          SHARED_VAR: z.string()
        }),
        client: {
          SHARED_VAR: 'client-value'
        },
        server: {
          SHARED_VAR: 'server-value'
        }
      });

      // Should warn about duplicate
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('defined in both')
      );

      // Client value should take precedence
      expect(env.SHARED_VAR).toBe('client-value');

      warnSpy.mockRestore();
    });

    it('should handle optional server variables correctly', () => {
      const env = createDynamicEnv({
        schema: z.object({
          CLIENT_VAR: z.string(),
          OPTIONAL_SERVER: z.string().optional(),
          REQUIRED_SERVER: z.string().default('default-value')
        }),
        client: {
          CLIENT_VAR: 'client'
        },
        server: {
          OPTIONAL_SERVER: undefined,
          REQUIRED_SERVER: undefined
        }
      });

      expect(env.CLIENT_VAR).toBe('client');
      expect(env.OPTIONAL_SERVER).toBeUndefined();
      expect(env.REQUIRED_SERVER).toBe('default-value');
    });

    it('should handle complex transformations', () => {
      const env = createDynamicEnv({
        schema: z.object({
          CLIENT_FEATURES: z
            .string()
            .transform(val => val.split(',').filter(Boolean)),
          SERVER_HOSTS: z
            .string()
            .optional()
            .transform(val => val?.split(',').filter(Boolean) ?? [])
        }),
        client: {
          CLIENT_FEATURES: 'feature1,feature2,feature3'
        },
        server: {
          SERVER_HOSTS: 'host1,host2'
        }
      });

      expect(env.CLIENT_FEATURES).toEqual(['feature1', 'feature2', 'feature3']);
      expect(env.SERVER_HOSTS).toEqual(['host1', 'host2']);
    });
  });

  describe('Type safety', () => {
    it('should infer correct types from schema', () => {
      const env = createDynamicEnv({
        schema: z.object({
          STRING_VAR: z.string(),
          NUMBER_VAR: z.coerce.number(),
          BOOLEAN_VAR: z.coerce.boolean(),
          ARRAY_VAR: z.string().transform(val => val.split(','))
        }),
        client: {
          STRING_VAR: 'test',
          NUMBER_VAR: '123',
          BOOLEAN_VAR: 'true',
          ARRAY_VAR: 'a,b,c'
        },
        server: {}
      });

      // TypeScript should infer these types correctly
      // Using type assertions to verify type inference without "unused" warnings
      expect(env.STRING_VAR).toSatisfy(
        (v): v is string => typeof v === 'string'
      );
      expect(env.NUMBER_VAR).toSatisfy(
        (v): v is number => typeof v === 'number'
      );
      expect(env.BOOLEAN_VAR).toSatisfy(
        (v): v is boolean => typeof v === 'boolean'
      );
      expect(env.ARRAY_VAR).toSatisfy((v): v is string[] => Array.isArray(v));

      expect(typeof env.STRING_VAR).toBe('string');
      expect(typeof env.NUMBER_VAR).toBe('number');
      expect(typeof env.BOOLEAN_VAR).toBe('boolean');
      expect(Array.isArray(env.ARRAY_VAR)).toBe(true);
    });
  });
});
