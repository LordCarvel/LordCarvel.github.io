import { describe, it, expect } from 'vitest';

function sum(a: number, b: number): number {
  return a + b;
}

describe('sum', () => {
  it('should add two numbers correctly', () => {
    expect(sum(2, 3)).toBe(5);
  });
});