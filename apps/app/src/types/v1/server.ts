export interface Server {
  id: string;
  azureId: string;
  adminUsername: string;
  vmName: string;
  location: string;
  macAddress: string;
  powerState: string;
  privateIpAddress: string;
  publicIpAddress: string;
  resourceGroup: string;
  dnsName: string;
  sshKeyName: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}
