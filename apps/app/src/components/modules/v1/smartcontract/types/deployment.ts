import type { ContractConfig } from './contract';

export interface DeploymentResult {
  id: string;
  contractAddress: string;
  transactionHash: string;
  networkId: string;
}

export interface DeploymentSuccess {
  open: boolean;
  address: string;
}

export interface ValidationErrors {
  [key: string]: string;
}

export interface DeploymentPayload {
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
