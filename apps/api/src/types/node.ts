export type NodePayload = {
  networkId: string;
  name: string;
  container: string;
  p2pPort: number;
  rpcHttpPort: number;
  rpcWsPort: number;
  p2pHost: string;
  rpcHttpHost: string;
  rpcWsHost: string;
  wsHost: string;
  nodeIp: string;
  isBootnode: boolean;
  bootEnodeUrl?: string;
};

export type CreateNodePayload = {
  networkId: string;
  name: string;
  container: string;
  p2pPort: number;
  rpcHttpPort: number;
  rpcWsPort: number;
  p2pHost: string;
  rpcHttpHost: string;
  rpcWsHost: string;
  wsHost: string;
  nodeIp: string;
  isBootnode: boolean;
  enodeUrl: string;
};

export type StartNodePayload = {
  networkId: string;
  nodeCount: number;
  vmId: string;
};
