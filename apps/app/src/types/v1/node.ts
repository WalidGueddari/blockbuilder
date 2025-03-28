import { Alloc } from './allocs';
import { Genesis } from './genesis';
import { Server } from './server';

export interface Network {
  id: string;
  publicIp: string;
  chainId: number;
  name: string;
  type: string;
  status: string;
  nodeCount: number;
  userId: string;
  serverId: string;
  create_at: string;
  updated_at: string;
  server: Server;
  genesis: Genesis;
  allocs: Alloc[];
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

export interface NodeResponse {
  success: boolean;
  node: Node;
}
