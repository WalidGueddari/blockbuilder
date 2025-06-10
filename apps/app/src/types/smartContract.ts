import type { ContractTransaction } from 'ethers';

import { Contract } from '../components/modules/v1/smartcontract/types/contract';
import { ContractConfig } from '../components/modules/v1/smartcontract/types/contract';

export interface DeployedContract {
  id: string;
  address: string;
  name: string;
  type: string;
  description?: string;
  tags: string[];
  abi?: any;
  config?: ContractConfig;
  networkId: string;
  transactionHash: string;
  deployedAt: string;
  createdAt: string;
  updatedAt: string;
  favorites: Array<{
    id: string;
    createdAt: string;
  }>;
}

export interface DraftContract {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  networkId?: string;
  description?: string;
  tags: string[];
  type?: string;
  config: ContractConfig;
}

export interface SmartContractState {
  deployedContracts: DeployedContract[];
  drafts: DraftContract[];
  loading: boolean;
  error: string | null;
  draftToEditId: string | null;
  importedContracts: Contract[];
}

export interface DeployContractPayload {
  contractName: string;
  contractContent: string;
  networkId: string;
  description?: string;
  tags?: string[];
  abi?: any;
  type?: string;
  config?: ContractConfig;
}

export interface DeployContractResponse {
  id: string;
  contractAddress: string;
  transactionHash: string;
  networkId: string;
}

export interface InteractContractPayload {
  networkId: string;
  address: string;
  functionName: string;
  args: string[];
}

export interface InteractContractResponse {
  result: any;
  error?: string;
}
