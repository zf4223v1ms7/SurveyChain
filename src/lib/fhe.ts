import { hexlify, getAddress } from "ethers";

declare global {
  interface Window {
    relayerSDK?: {
      initSDK: () => Promise<void>;
      createInstance: (config: Record<string, unknown>) => Promise<any>;
      SepoliaConfig: Record<string, unknown>;
    };
    ethereum?: any;
    okxwallet?: any;
  }
}

let fheInstance: any = null;
let sdkPromise: Promise<any> | null = null;

const SDK_URL = 'https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.umd.cjs';

/**
 * Dynamically load Zama FHE SDK from CDN
 */
const loadSdk = async (): Promise<any> => {
  if (typeof window === 'undefined') {
    throw new Error('FHE SDK requires browser environment');
  }

  if (window.relayerSDK) {
    console.log('✅ SDK already loaded');
    return window.relayerSDK;
  }

  if (!sdkPromise) {
    sdkPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${SDK_URL}"]`) as HTMLScriptElement | null;
      if (existing) {
        console.log('⏳ SDK script tag exists, waiting...');
        // Wait a bit for SDK to initialize
        const checkInterval = setInterval(() => {
          if (window.relayerSDK) {
            clearInterval(checkInterval);
            resolve(window.relayerSDK);
          }
        }, 100);

        setTimeout(() => {
          clearInterval(checkInterval);
          if (window.relayerSDK) {
            resolve(window.relayerSDK);
          } else {
            reject(new Error('SDK script exists but window.relayerSDK not initialized'));
          }
        }, 5000);
        return;
      }

      console.log('📦 Loading SDK from CDN...');
      const script = document.createElement('script');
      script.src = SDK_URL;
      script.async = true;

      script.onload = () => {
        console.log('📦 Script loaded, waiting for SDK initialization...');
        // Give SDK time to initialize
        setTimeout(() => {
          if (window.relayerSDK) {
            console.log('✅ SDK initialized');
            resolve(window.relayerSDK);
          } else {
            console.error('❌ window.relayerSDK still undefined after load');
            reject(new Error('relayerSDK unavailable after load'));
          }
        }, 500);
      };

      script.onerror = () => {
        console.error('❌ Failed to load SDK script');
        reject(new Error('Failed to load FHE SDK'));
      };

      document.body.appendChild(script);
    });
  }

  return sdkPromise;
};

/**
 * Initialize FHE instance with Sepolia network configuration
 */
export async function initializeFHE(provider?: any): Promise<any> {
  if (fheInstance) {
    return fheInstance;
  }

  if (typeof window === 'undefined') {
    throw new Error('FHE SDK requires browser environment');
  }

  const ethereumProvider = provider ||
    window.ethereum ||
    (window as any).okxwallet?.provider ||
    (window as any).okxwallet ||
    (window as any).coinbaseWalletExtension;

  if (!ethereumProvider) {
    throw new Error('Ethereum provider not found. Please connect your wallet first.');
  }

  console.log('🔌 Using Ethereum provider:', {
    isOKX: !!(window as any).okxwallet,
    isMetaMask: !!(window.ethereum as any)?.isMetaMask,
  });

  const sdk = await loadSdk();
  if (!sdk) {
    throw new Error('FHE SDK not available');
  }

  await sdk.initSDK();

  const config = {
    ...sdk.SepoliaConfig,
    network: ethereumProvider,
  };

  fheInstance = await sdk.createInstance(config);
  console.log('✅ FHE instance initialized for Sepolia');

  return fheInstance;
}

/**
 * Encrypt a uint64 value (for voting: always encrypt 1)
 */
const toBytes32 = (bytes: Uint8Array): `0x${string}` => {
  if (bytes.length !== 32) {
    throw new Error(`FHE handle must be 32 bytes; received ${bytes.length}`);
  }
  return hexlify(bytes) as `0x${string}`;
};

export const encryptVote = async (
  contractAddress: string,
  userAddress: string
): Promise<{
  encryptedOne: `0x${string}`;
  proof: `0x${string}`;
}> => {
  console.log('[FHE] Encrypting vote (value: 1)');

  const fhe = await initializeFHE();
  const checksumAddress = getAddress(contractAddress);

  console.log('[FHE] Creating encrypted input...');
  const input = fhe.createEncryptedInput(checksumAddress, userAddress);
  input.add64(1n); // Always encrypt 1 for voting

  console.log('[FHE] Encrypting...');
  const { handles, inputProof } = await input.encrypt();

  if (!handles?.length) {
    throw new Error('No handles returned from FHE encryption');
  }

  console.log('[FHE] ✅ Encryption complete');
  console.log('[FHE] Handle type:', typeof handles[0]);
  console.log('[FHE] Handle value:', handles[0]);

  return {
    encryptedOne: toBytes32(handles[0]),
    proof: hexlify(inputProof) as `0x${string}`,
  };
};

/**
 * Decrypt a euint64 value (for viewing vote tallies)
 */
export const decryptTally = async (
  handle: string,
  contractAddress: string,
  userAddress: string
): Promise<bigint> => {
  console.log('[FHE] Decrypting tally handle:', handle);

  const fhe = await initializeFHE();
  const checksumAddress = getAddress(contractAddress);

  console.log('[FHE] Requesting decryption...');
  const decrypted = await fhe.decrypt(checksumAddress, handle, userAddress);

  console.log('[FHE] ✅ Decryption complete');
  return BigInt(decrypted);
};

export const __resetFHECacheForTests = () => {
  fheInstance = null;
  sdkPromise = null;
};
