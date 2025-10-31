import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn utility', () => {
  it('merges conditional class names', () => {
    expect(cn('base', false && 'hidden', 'mt-4')).toBe('base mt-4');
  });

  it('de-duplicates tailwind classes by priority', () => {
    expect(cn('px-2', 'px-4', 'px-1')).toBe('px-1');
  });

  it('supports object style class expressions', () => {
    expect(cn('text-sm', { 'text-lg': true, 'text-xs': false })).toBe('text-lg');
  });
});
