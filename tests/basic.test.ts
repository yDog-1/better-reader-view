import { describe, it, expect } from 'vitest';

describe('Basic test suite', () => {
  it('should pass basic assertion', () => {
    expect(1 + 1).toBe(2);
  });

  it('should check string equality', () => {
    expect('hello').toBe('hello');
  });
});
