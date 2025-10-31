import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initializeFHE, encryptVote, __resetFHECacheForTests } from '@/lib/fhe';

// Mock window.relayerSDK
const mockRelayerSDK = {
  initSDK: vi.fn().mockResolvedValue(undefined),
  createInstance: vi.fn().mockResolvedValue({
    createEncryptedInput: vi.fn().mockReturnValue({
      add64: vi.fn(),
      encrypt: vi.fn().mockResolvedValue({
        handles: [new Uint8Array(32).fill(1)],
        inputProof: new Uint8Array(64).fill(2),
      }),
    }),
  }),
  SepoliaConfig: {},
};

describe('FHE Library', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    __resetFHECacheForTests();
    // @ts-ignore
    global.window = {
      relayerSDK: mockRelayerSDK,
      ethereum: {},
    };
  });

  describe('initializeFHE', () => {
    it('should initialize FHE instance successfully', async () => {
      const fheInstance = await initializeFHE();
      expect(fheInstance).toBeDefined();
      expect(mockRelayerSDK.initSDK).toHaveBeenCalled();
      expect(mockRelayerSDK.createInstance).toHaveBeenCalled();
    });

    it('should return cached instance on subsequent calls', async () => {
      const instance1 = await initializeFHE();
      const instance2 = await initializeFHE();
      expect(instance1).toBe(instance2);
      expect(mockRelayerSDK.createInstance).toHaveBeenCalledTimes(1);
    });

    it('should throw error when no ethereum provider found', async () => {
      // @ts-ignore
      global.window = { relayerSDK: mockRelayerSDK };
      await expect(initializeFHE()).rejects.toThrow('Ethereum provider not found');
    });
  });

  describe('encryptVote', () => {
    const contractAddress = '0x1234567890123456789012345678901234567890';
    const userAddress = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';

    it('should encrypt vote successfully', async () => {
      const result = await encryptVote(contractAddress, userAddress);

      expect(result).toHaveProperty('encryptedOne');
      expect(result).toHaveProperty('proof');
      expect(result.encryptedOne).toMatch(/^0x[0-9a-f]{64}$/i);
      expect(result.proof).toMatch(/^0x[0-9a-f]+$/i);
    });

    it('should always encrypt value 1', async () => {
      const instance = await initializeFHE();
      const input = instance.createEncryptedInput(contractAddress, userAddress);

      await encryptVote(contractAddress, userAddress);

      expect(input.add64).toHaveBeenCalledWith(1n);
    });

    it('should convert handles to hex correctly', async () => {
      const result = await encryptVote(contractAddress, userAddress);

      // Check that hex starts with 0x
      expect(result.encryptedOne.startsWith('0x')).toBe(true);

      // Check that hex is 66 characters (0x + 64 hex chars for 32 bytes)
      expect(result.encryptedOne.length).toBe(66);
    });
  });
});
