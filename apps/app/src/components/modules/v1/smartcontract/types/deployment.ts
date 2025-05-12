export interface DeploymentResult {
  contractAddress: string;
  transactionHash: string;
}

export interface DeploymentSuccess {
  open: boolean;
  address: string;
}

export interface ValidationErrors {
  [key: string]: string;
}
