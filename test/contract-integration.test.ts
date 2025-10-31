import { describe, it, expect } from 'vitest';
import { getAddress, isAddress } from 'ethers';
import { SURVEYCHAIN_ADDRESS, SURVEYCHAIN_ABI } from '@/config/contracts';

describe('Contract Configuration', () => {
  describe('SURVEYCHAIN_ADDRESS', () => {
    it('should be a valid Ethereum address', () => {
      expect(isAddress(SURVEYCHAIN_ADDRESS)).toBe(true);
    });

    it('should be checksummed', () => {
      const checksummed = getAddress(SURVEYCHAIN_ADDRESS);
      expect(SURVEYCHAIN_ADDRESS).toBe(checksummed);
    });

    it('should not be zero address', () => {
      expect(SURVEYCHAIN_ADDRESS).not.toBe('0x0000000000000000000000000000000000000000');
    });
  });

  describe('SURVEYCHAIN_ABI', () => {
    it('should have constructor definition', () => {
      const constructor = SURVEYCHAIN_ABI.find(item => item.type === 'constructor');
      expect(constructor).toBeDefined();
      expect(constructor?.inputs).toHaveLength(3);
    });

    it('should have vote function', () => {
      const voteFunction = SURVEYCHAIN_ABI.find(
        item => item.type === 'function' && item.name === 'vote'
      );
      expect(voteFunction).toBeDefined();
      expect(voteFunction?.inputs).toHaveLength(3);
      expect(voteFunction?.stateMutability).toBe('nonpayable');
    });

    it('should have getTally function', () => {
      const getTallyFunction = SURVEYCHAIN_ABI.find(
        item => item.type === 'function' && item.name === 'getTally'
      );
      expect(getTallyFunction).toBeDefined();
      expect(getTallyFunction?.stateMutability).toBe('view');
    });

    it('should have finalize function', () => {
      const finalizeFunction = SURVEYCHAIN_ABI.find(
        item => item.type === 'function' && item.name === 'finalize'
      );
      expect(finalizeFunction).toBeDefined();
      expect(finalizeFunction?.stateMutability).toBe('nonpayable');
    });

    it('should expose viewer authorization helpers', () => {
      const permissionFunctions = ['grantView', 'hasVoted'];

      permissionFunctions.forEach(funcName => {
        const func = SURVEYCHAIN_ABI.find(
          item => item.type === 'function' && item.name === funcName
        );
        expect(func).toBeDefined();
      });
    });

    it('should have required events', () => {
      const events = ['VoteCast', 'ViewerGranted', 'Finalized'];

      events.forEach(eventName => {
        const event = SURVEYCHAIN_ABI.find(
          item => item.type === 'event' && item.name === eventName
        );
        expect(event).toBeDefined();
      });
    });

    it('should have required error definitions', () => {
      const errors = [
        'AlreadyVoted',
        'VotingClosed',
        'VotingNotStarted',
        'InvalidOption',
        'ResultsLocked'
      ];

      errors.forEach(errorName => {
        const error = SURVEYCHAIN_ABI.find(
          item => item.type === 'error' && item.name === errorName
        );
        expect(error).toBeDefined();
      });
    });
  });
});
