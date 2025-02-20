// types/server.ts

export interface CreateAzureVMParams {
  userId: string;
  vmName: string;
  resourceGroup: string;
  sshKeyName: string;
}

// createServer returns this
export interface CreateServerResponse extends CreateAzureVMParams {
  id: string; // the newly created server's ID
}
// setupServer request/response
export interface SetupServerParams {
  id: string;
  networkId: string;
}
export interface SetupServerResponse {
  success: boolean; // or any shape your backend actually returns
}

// The shape of our slice state
export interface ServerState {
  loading: boolean;
  error: string | null;

  // Data returned by createServer
  server: CreateServerResponse | null;

  // Data returned by setupServer
  setupServer: SetupServerResponse | null;
}
