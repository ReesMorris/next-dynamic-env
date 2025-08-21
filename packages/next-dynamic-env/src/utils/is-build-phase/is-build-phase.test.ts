import { afterEach, describe, expect, it } from 'vitest';
import { isBuildPhase } from './is-build-phase';

describe('isBuildPhase', () => {
  const originalNextPhase = process.env.NEXT_PHASE;

  afterEach(() => {
    // Restore original value
    if (originalNextPhase === undefined) {
      delete process.env.NEXT_PHASE;
    } else {
      process.env.NEXT_PHASE = originalNextPhase;
    }
  });

  it('should return true when NEXT_PHASE is phase-production-build', () => {
    process.env.NEXT_PHASE = 'phase-production-build';
    expect(isBuildPhase()).toBe(true);
  });

  it('should return false when NEXT_PHASE is not phase-production-build', () => {
    process.env.NEXT_PHASE = 'phase-production-server';
    expect(isBuildPhase()).toBe(false);
  });

  it('should return false when NEXT_PHASE is undefined', () => {
    delete process.env.NEXT_PHASE;
    expect(isBuildPhase()).toBe(false);
  });

  it('should return false for other Next.js phases', () => {
    const otherPhases = [
      'phase-export',
      'phase-production-server',
      'phase-development-server',
      ''
    ];

    otherPhases.forEach(phase => {
      process.env.NEXT_PHASE = phase;
      expect(isBuildPhase()).toBe(false);
    });
  });
});
