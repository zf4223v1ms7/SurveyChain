import { describe, it, expect } from 'vitest';
import { SURVEYCHAIN_ABI, SURVEYCHAIN_ADDRESS } from '@/config/contracts';
import { getAddress } from 'viem';

describe('SURVEYCHAIN_ABI', () => {
  it('keeps vote signature compatible with encrypted handles', () => {
    const voteFn = SURVEYCHAIN_ABI.find(
      (entry) => entry.type === 'function' && entry.name === 'vote',
    );

    expect(voteFn).toBeDefined();
    expect(voteFn?.inputs?.map((input) => input.type)).toEqual([
      'uint256',
      'bytes32',
      'bytes',
    ]);
  });

  it('returns structured survey metadata in getSurveyInfo', () => {
    const surveyInfoFn = SURVEYCHAIN_ABI.find(
      (entry) => entry.type === 'function' && entry.name === 'getSurveyInfo',
    );

    expect(surveyInfoFn).toBeDefined();
    expect(surveyInfoFn?.outputs?.map((out) => out.type)).toEqual([
      'string',
      'uint256',
      'uint256',
      'bool',
      'uint256',
    ]);
  });

  it('exposes authorization related custom errors', () => {
    const errorNames = new Set(
      SURVEYCHAIN_ABI.filter((entry) => entry.type === 'error').map((error) => error.name),
    );

    expect(errorNames).toEqual(
      new Set([
        'AlreadyFinalized',
        'AlreadyVoted',
        'InvalidOption',
        'NotAuthorized',
        'ResultsLocked',
        'VotingClosed',
        'VotingNotStarted',
      ]),
    );
  });
});

describe('SURVEYCHAIN_ADDRESS', () => {
  it('is a checksummed address', () => {
    expect(getAddress(SURVEYCHAIN_ADDRESS)).toBe(SURVEYCHAIN_ADDRESS);
  });
});
