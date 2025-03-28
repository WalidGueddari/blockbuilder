export interface Genesis {
  id: string;
  networkId: string;
  berlinBlock: number;
  blockPeriod: number;
  epochLength: number;
  requestTimeout: number;
  nonce: string;
  timestamp: string;
  gasLimit: string;
  difficulty: string;
  mixHash: string;
  coinbase: string;
  create_at: string; // or Date, depending on usage
}
