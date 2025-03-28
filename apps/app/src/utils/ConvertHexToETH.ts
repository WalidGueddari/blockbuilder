import { formatEther } from 'ethers';
import { toBigInt } from 'ethers';

// Helper for parsing hex

export function formatBalance(hexBalance: string): string {
  try {
    const wei = toBigInt(hexBalance);
    return `${formatEther(wei)} ETH`;
  } catch (error) {
    return 'Invalid balance';
  }
}
