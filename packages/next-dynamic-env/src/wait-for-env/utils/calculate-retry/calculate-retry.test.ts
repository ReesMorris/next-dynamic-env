import { describe, expect, it } from 'vitest';
import { calculateRetry } from './calculate-retry';

describe('calculateRetry', () => {
  describe('retry decision', () => {
    it('should retry when attempt number is less than max retries', () => {
      const result = calculateRetry(0, 1000, 3, 2);
      expect(result.shouldRetry).toBe(true);
    });

    it('should retry on second attempt when max retries is 2', () => {
      const result = calculateRetry(1, 1000, 2, 2);
      expect(result.shouldRetry).toBe(true);
    });

    it('should not retry when attempt equals max retries', () => {
      const result = calculateRetry(3, 1000, 3, 2);
      expect(result.shouldRetry).toBe(false);
    });

    it('should not retry when attempt exceeds max retries', () => {
      const result = calculateRetry(5, 1000, 3, 2);
      expect(result.shouldRetry).toBe(false);
    });

    it('should not retry when max retries is 0', () => {
      const result = calculateRetry(0, 1000, 0, 2);
      expect(result.shouldRetry).toBe(false);
    });
  });

  describe('next delay calculation', () => {
    it('should calculate next delay with exponential backoff when retrying', () => {
      const result = calculateRetry(0, 1000, 3, 2);
      expect(result.nextDelay).toBe(2000); // 1000 * 2
    });

    it('should apply custom backoff multiplier', () => {
      const result = calculateRetry(0, 500, 3, 3);
      expect(result.nextDelay).toBe(1500); // 500 * 3
    });

    it('should handle fractional multipliers', () => {
      const result = calculateRetry(0, 1000, 3, 1.5);
      expect(result.nextDelay).toBe(1500); // 1000 * 1.5
    });

    it('should return current timeout when not retrying', () => {
      const result = calculateRetry(3, 1000, 3, 2);
      expect(result.nextDelay).toBe(1000); // No multiplication
    });

    it('should handle multiplier of 1 (no backoff)', () => {
      const result = calculateRetry(0, 1000, 3, 1);
      expect(result.nextDelay).toBe(1000); // 1000 * 1
    });

    it('should use default multiplier of 2 when not specified', () => {
      const result = calculateRetry(0, 1000, 3);
      expect(result.nextDelay).toBe(2000); // 1000 * 2 (default)
    });
  });

  describe('next attempt calculation', () => {
    it('should increment attempt number', () => {
      expect(calculateRetry(0, 1000, 3, 2).nextAttempt).toBe(1);
      expect(calculateRetry(1, 1000, 3, 2).nextAttempt).toBe(2);
      expect(calculateRetry(2, 1000, 3, 2).nextAttempt).toBe(3);
    });

    it('should increment even when not retrying', () => {
      const result = calculateRetry(3, 1000, 3, 2);
      expect(result.nextAttempt).toBe(4);
    });
  });

  describe('exponential backoff progression', () => {
    it('should correctly calculate multiple retry delays', () => {
      // First retry
      let result = calculateRetry(0, 100, 3, 2);
      expect(result.shouldRetry).toBe(true);
      expect(result.nextDelay).toBe(200);
      expect(result.nextAttempt).toBe(1);

      // Second retry
      result = calculateRetry(1, 200, 3, 2);
      expect(result.shouldRetry).toBe(true);
      expect(result.nextDelay).toBe(400);
      expect(result.nextAttempt).toBe(2);

      // Third retry
      result = calculateRetry(2, 400, 3, 2);
      expect(result.shouldRetry).toBe(true);
      expect(result.nextDelay).toBe(800);
      expect(result.nextAttempt).toBe(3);

      // No more retries
      result = calculateRetry(3, 800, 3, 2);
      expect(result.shouldRetry).toBe(false);
      expect(result.nextDelay).toBe(800); // No multiplication
      expect(result.nextAttempt).toBe(4);
    });

    it('should handle large backoff multipliers', () => {
      const result = calculateRetry(0, 100, 5, 10);
      expect(result.nextDelay).toBe(1000); // 100 * 10
    });

    it('should handle very small timeouts', () => {
      const result = calculateRetry(0, 1, 3, 2);
      expect(result.nextDelay).toBe(2);
    });

    it('should handle very large timeouts', () => {
      const result = calculateRetry(0, 10000, 3, 2);
      expect(result.nextDelay).toBe(20000);
    });
  });

  describe('edge cases', () => {
    it('should handle negative attempt numbers gracefully', () => {
      const result = calculateRetry(-1, 1000, 3, 2);
      expect(result.shouldRetry).toBe(true);
      expect(result.nextAttempt).toBe(0);
    });

    it('should handle negative max retries', () => {
      const result = calculateRetry(0, 1000, -1, 2);
      expect(result.shouldRetry).toBe(false);
    });

    it('should handle zero backoff multiplier', () => {
      const result = calculateRetry(0, 1000, 3, 0);
      expect(result.nextDelay).toBe(0);
    });

    it('should handle negative backoff multiplier', () => {
      const result = calculateRetry(0, 1000, 3, -2);
      expect(result.nextDelay).toBe(-2000);
    });

    it('should handle decimal attempt numbers (round down behavior)', () => {
      const result = calculateRetry(1.7, 1000, 3, 2);
      expect(result.shouldRetry).toBe(true);
      expect(result.nextAttempt).toBe(2.7);
    });
  });
});
