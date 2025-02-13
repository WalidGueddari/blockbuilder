export type CreateAzureVMParams = {
  userId: string;
  vmName: string;
  // adminUsername: string;
  resourceGroup: string;
  sshKeyName: string;
  // sshEmail: string;
  // sshKeyDir?: string;
};
