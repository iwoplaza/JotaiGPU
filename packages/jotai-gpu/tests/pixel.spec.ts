import { pixel } from 'jotai-gpu';
import { describe, expect, it } from 'vitest';

describe('pixel', () => {
  it('works', () => {
    expect(pixel()).toHaveProperty('does');
  });
});
