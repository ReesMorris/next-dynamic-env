import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createLogger } from './create-logger';

describe('createLogger', () => {
  let consoleLogSpy: any;
  let consoleWarnSpy: any;
  let consoleErrorSpy: any;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('when enabled', () => {
    it('should log messages when enabled', () => {
      const logger = createLogger(true);
      logger.log('Test message');

      expect(consoleLogSpy).toHaveBeenCalledWith('Test message');
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });

    it('should log warnings when enabled', () => {
      const logger = createLogger(true);
      logger.warn('Warning message');

      expect(consoleWarnSpy).toHaveBeenCalledWith('Warning message');
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    });

    it('should log errors when enabled', () => {
      const logger = createLogger(true);
      logger.error('Error message');

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error message');
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('should log errors with details when provided', () => {
      const logger = createLogger(true);
      const errorDetails = { code: 'ERR_001', context: 'test' };
      logger.error('Error message', errorDetails);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error message',
        errorDetails
      );
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('should add prefix to log messages', () => {
      const logger = createLogger(true, 'MyApp');
      logger.log('Test message');

      expect(consoleLogSpy).toHaveBeenCalledWith('[MyApp] Test message');
    });

    it('should add prefix to warning messages', () => {
      const logger = createLogger(true, 'MyApp');
      logger.warn('Warning message');

      expect(consoleWarnSpy).toHaveBeenCalledWith('[MyApp] Warning message');
    });

    it('should add prefix to error messages', () => {
      const logger = createLogger(true, 'MyApp');
      logger.error('Error message');

      expect(consoleErrorSpy).toHaveBeenCalledWith('[MyApp] Error message');
    });

    it('should add prefix to error messages with details', () => {
      const logger = createLogger(true, 'MyApp');
      const details = { error: true };
      logger.error('Error message', details);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[MyApp] Error message',
        details
      );
    });
  });

  describe('when disabled', () => {
    it('should not log messages when disabled', () => {
      const logger = createLogger(false);
      logger.log('Test message');

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should not log warnings when disabled', () => {
      const logger = createLogger(false);
      logger.warn('Warning message');

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should not log errors when disabled', () => {
      const logger = createLogger(false);
      logger.error('Error message');

      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should not log errors with details when disabled', () => {
      const logger = createLogger(false);
      logger.error('Error message', { details: 'test' });

      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should not log even with prefix when disabled', () => {
      const logger = createLogger(false, 'MyApp');
      logger.log('Test message');
      logger.warn('Warning message');
      logger.error('Error message');

      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('prefix handling', () => {
    it('should handle empty string prefix', () => {
      const logger = createLogger(true, '');
      logger.log('Test message');

      expect(consoleLogSpy).toHaveBeenCalledWith('Test message');
    });

    it('should handle special characters in prefix', () => {
      const logger = createLogger(true, '@#$%^&*()');
      logger.log('Test message');

      expect(consoleLogSpy).toHaveBeenCalledWith('[@#$%^&*()] Test message');
    });

    it('should handle long prefix', () => {
      const longPrefix = 'VeryLongApplicationNameWithLotsOfDetails';
      const logger = createLogger(true, longPrefix);
      logger.log('Test');

      expect(consoleLogSpy).toHaveBeenCalledWith(`[${longPrefix}] Test`);
    });

    it('should handle Unicode in prefix', () => {
      const logger = createLogger(true, '🚀App');
      logger.log('Starting...');

      expect(consoleLogSpy).toHaveBeenCalledWith('[🚀App] Starting...');
    });
  });

  describe('message handling', () => {
    it('should handle empty messages', () => {
      const logger = createLogger(true, 'App');
      logger.log('');
      logger.warn('');
      logger.error('');

      expect(consoleLogSpy).toHaveBeenCalledWith('[App] ');
      expect(consoleWarnSpy).toHaveBeenCalledWith('[App] ');
      expect(consoleErrorSpy).toHaveBeenCalledWith('[App] ');
    });

    it('should handle multiline messages', () => {
      const logger = createLogger(true);
      const multiline = 'Line 1\nLine 2\nLine 3';
      logger.log(multiline);

      expect(consoleLogSpy).toHaveBeenCalledWith(multiline);
    });

    it('should handle various error detail types', () => {
      const logger = createLogger(true);

      // String details
      logger.error('Error', 'string details');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error', 'string details');

      // Number details
      logger.error('Error', 42);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error', 42);

      // Boolean details
      logger.error('Error', true);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error', true);

      // Array details
      logger.error('Error', [1, 2, 3]);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error', [1, 2, 3]);

      // Object details
      const obj = { key: 'value' };
      logger.error('Error', obj);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error', obj);

      // Null details
      logger.error('Error', null);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error', null);
    });

    it('should handle undefined details differently from null', () => {
      const logger = createLogger(true);

      // Undefined should call error with single argument
      logger.error('Error with undefined', undefined);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error with undefined');
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

      // Null should call error with two arguments
      logger.error('Error with null', null);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error with null', null);
    });
  });

  describe('multiple loggers', () => {
    it('should support multiple independent loggers', () => {
      const logger1 = createLogger(true, 'App1');
      const logger2 = createLogger(true, 'App2');
      const logger3 = createLogger(false, 'App3');

      logger1.log('Message from App1');
      logger2.log('Message from App2');
      logger3.log('Message from App3');

      expect(consoleLogSpy).toHaveBeenCalledWith('[App1] Message from App1');
      expect(consoleLogSpy).toHaveBeenCalledWith('[App2] Message from App2');
      expect(consoleLogSpy).not.toHaveBeenCalledWith(
        '[App3] Message from App3'
      );
      expect(consoleLogSpy).toHaveBeenCalledTimes(2);
    });
  });
});
