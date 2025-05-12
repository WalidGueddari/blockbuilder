// types/network.ts
export interface Network {
  id: string;
  name: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  currency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}
