export type CreateProxmoxVMParams = {
  userId: string;
  vmName: string;
  proxmoxNode?: string;
  sshKeyName: string;
};
