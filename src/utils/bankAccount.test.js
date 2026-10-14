import { describe, expect, it } from 'vitest';
import { maskBankAccount } from './bankAccount';

describe('maskBankAccount', () => {
  it('masks leaving last four digits', () => {
    expect(maskBankAccount('1234567890')).toBe('****7890');
  });

  it('returns null for blank values', () => {
    expect(maskBankAccount(null)).toBeNull();
    expect(maskBankAccount('  ')).toBeNull();
  });
});
