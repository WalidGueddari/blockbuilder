export type ContractType =
  | 'ERC20'
  | 'ERC721'
  | 'ERC1155'
  | 'Stablecoin'
  | 'RWA'
  | 'Governor'
  | 'Custom'
  | 'Imported';

export interface ContractConfig {
  contractType: ContractType;
  name: string;
  symbol: string;
  mintable: boolean;
  burnable: boolean;
  pausable: boolean;
  decimals?: number;
  initialSupply?: string;
  maxSupply?: string;
  royaltyFee?: number;
  governanceSettings?: {
    votingDelay: number;
    votingPeriod: number;
    proposalThreshold: number;
  };
  rwaSettings?: {
    assetType: string;
    jurisdiction: string;
    complianceRequired: boolean;
  };
  stablecoinSettings?: {
    pegCurrency: string;
    oracleAddress?: string;
  };
  baseUri?: string;
  governorName?: string;
  votingDelay?: number;
  votingPeriod?: number;
  proposalThreshold?: number;
  quorumNumerator?: number;
  customCode?: string;
  description?: string;
  tags?: string[];
}

export interface Contract {
  id: string;
  name: string;
  type: string;
  address: string;
  description?: string;
  status?: ContractStatus;
  accounts?: ContractAccount[];
  tags?: string[];
  abi: any[];
  isFavorite?: boolean;
  config?: ContractConfig;
}

export interface ContractStatus {
  successCount: number;
  failureCount: number;
  lastInteraction: string;
}

export interface ContractAccount {
  role: string;
  address: string;
}

export interface Draft {
  id: string;
  name: string;
  type: ContractType;
  updatedAt: string;
  data: {
    config: ContractConfig;
    code: string;
  };
}

export interface UseCase {
  id: string;
  name: string;
  type: ContractType;
  description: string;
  defaults: Partial<ContractConfig>;
}

export const COMMON_TAGS = [
  'token',
  'nft',
  'defi',
  'governance',
  'stablecoin',
  'gaming',
  'mainnet',
  'testnet',
  'custom',
  'imported',
];
