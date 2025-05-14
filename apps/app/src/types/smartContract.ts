export interface DeployedContract {
  address: string;
  name: string;
  type: string;
  deployedAt: string;
  description?: string;
  tags?: string[];
  abi?: any[];
}

export interface DraftContract {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  networkId?: string;
  description?: string;
  tags?: string[];
  type?: string;
}

export interface SmartContractState {
  deployedContracts: DeployedContract[];
  drafts: DraftContract[];
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
  args: string[];
}

export interface InteractContractResponse {
  result: any;
  error?: string;
}
