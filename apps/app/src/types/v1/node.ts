export interface Network {
  id: string;
  name: string;
  type: string;
  status: string;
  nodeCount: number;
  userId: string;
  serverId: string;
  create_at: string;
  updated_at: string;
}

export interface Node {
  id: string;
  networkId: string;
  name: string;
  container: string;
  status: string;
  p2pPort: number;
  rpcHttpPort: number;
  rpcWsPort: number;
  p2pHost: string;
  rpcHttpHost: string;
  rpcWsHost: string;
  wsHost: string;
  nodeIp: string;
  enodeUrl: string;
  isBootnode: boolean;
  create_at: string;
  updated_at: string;
  network: Network;
}

export interface NodesResponse {
  success: boolean;
  nodes: Node[];
}
