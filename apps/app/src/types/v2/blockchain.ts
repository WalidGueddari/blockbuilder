// The payload the backend expects for /setup-network
export type InitNetworkPayload = {
  name: string;
  userId: string;
  nodeCount: number;
};

// The shape of the request body for the /setup-network endpoint
export interface SetupNetworkParams {
  initNetPayload: InitNetworkPayload;
  // vmId: string;
}

// The server returns an object that presumably has an `id`, `nodeCount`, etc.
// Adjust these fields to match exactly what `initNetwork` actually returns.
export interface SetupNetworkResponse {
  id: string;
  nodeCount: number;
  serverId: string;
}

// The payload for /start-network
export interface StartNodePayload {
  vmId: string;
  networkId: string;
  nodeCount: number;
}

// The shape of the request body for /start-network endpoint
export interface StartNetworkParams {
  payload: StartNodePayload;
}

// The server might return an object with a success flag, or some data about the started network
export interface StartNetworkResponse {
  success: boolean;
  // or any other fields your backend returns
}

// The shape of this slice's Redux state
export interface BlockchainState {
  loading: boolean;
  error: string | null;

  // Data from /setup-network
  setupNetworkResult: SetupNetworkResponse | null;

  // Data from /start-network
  startNetworkResult: StartNetworkResponse | null;
}
