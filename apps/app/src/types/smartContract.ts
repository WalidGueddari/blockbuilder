export interface DeployedContract {
  address: string;
  name: string;
  type: string;
  deployedAt: string;
}

export interface SmartContractState {
  deployedContracts: DeployedContract[];
  loading: boolean;
  error: string | null;
}

export interface DeployContractPayload {
  contractName: string;
  contractContent: string;
  networkId: string;
}

export interface DeployContractResponse {
  result: string;
  error?: string;
}

export interface InteractContractPayload {
  networkId: string;
  address: string;
  functionName: string;
  args?: string[];
}

export interface InteractContractResponse {
  result: string;
  error?: string;
}
