// types/network.ts
export interface NetworkDetailsProps {
  networkId: string;
}

export type InitNetworkPayload = {
  name: string;
  userId: string;
  nodeCount: number;
};

export type InitNetwork = {
  id: string;
  name: string;
  userId: string;
  nodeCount: number;
  createdAt: string;
};

export interface Pagination {
  page: number;
  limit: number;
  pages: number;
  total: number;
  next: number | null;
  prev: number | null;
}

export interface NetworksResponse {
  success: boolean;
  data: InitNetwork[];
  pagination: Pagination;
}
