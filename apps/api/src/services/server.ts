import { PrismaClient } from '@saas-monorepo/database';
import { exec } from 'child_process';
import fs from 'fs';
import { NodeSSH } from 'node-ssh';
import path from 'path';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';

import { config } from '../config.js';
import { azureAdminUsername } from '../constants.js';
import { CreateProxmoxVMParams } from '../types/server.js';
import { AbstractServiceOptions } from '../types/services.js';

const execAsync = promisify(exec);

export class ServerService {
  prisma: PrismaClient;

  constructor(options: AbstractServiceOptions) {
    this.prisma = options.prisma;
  }

  async createProxmoxVMServer(params: CreateProxmoxVMParams) {
    const { proxmoxHost, proxmoxUser, proxmoxPassword, proxmoxNode, proxmoxTemplateId, sshKeyDir } =
      config;

    const user = await this.prisma.user.findUnique({
      where: { id: params.userId },
    });

    if (!user) {
      throw new Error(`User with ID ${params.userId} not found.`);
    }

    const { vmName, sshKeyName } = params;
    const targetNode = params.proxmoxNode || proxmoxNode;

    // Determine the directory for the SSH key
    if (!sshKeyDir) {
      throw new Error('Cannot determine home directory for SSH key.');
    }
    const sshKeyPath = path.join(sshKeyDir, sshKeyName);
    const sshEmail = user.email;

    try {
      // Check if the public SSH key exists; if not, generate a new key pair.
      if (!fs.existsSync(`${sshKeyPath}.pub`)) {
        console.log('SSH key not found. Generating a new one...');
        await execAsync(
          `ssh-keygen -t rsa -b 4096 -m PEM -C "${sshEmail}" -f "${sshKeyPath}" -N ""`,
        );
      } else {
        console.log(`Using existing SSH key: ${sshKeyPath}.pub`);
      }

      // Connect to Proxmox node via SSH
      console.log(`Connecting to Proxmox Host ${proxmoxHost} as ${proxmoxUser}...`);
      const ssh = new NodeSSH();
      // Assuming password authentication for Proxmox host here, adjust if using SSH Key
      await ssh.connect({
        host: proxmoxHost,
        username: proxmoxUser,
        password: proxmoxPassword,
      });

      // 1. Get next available VMID
      const { stdout: nextIdStdout } = await ssh.execCommand('pvesh get /cluster/nextid');
      const newVmId = nextIdStdout.trim();
      console.log(`Next available VM ID is ${newVmId}`);

      // Sanitize the VM name for DNS compatibility (Proxmox requirements: no spaces, only alphanumeric and hyphens)
      const sanitizedVmName = vmName.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();

      // 2. Clone the template
      console.log(
        `Cloning template ${proxmoxTemplateId} to VM ${newVmId} (${sanitizedVmName}) on node ${targetNode}`,
      );
      const cloneCmd = `qm clone ${proxmoxTemplateId} ${newVmId} --name "${sanitizedVmName}" --full 1`;
      const cloneRes = await ssh.execCommand(cloneCmd);
      if (cloneRes.code !== 0) {
        throw new Error(`Failed to clone template: ${cloneRes.stderr}`);
      }

      // 3. Inject SSH Key (assuming cloud-init is used on the template)
      // First copy the key to the proxmox host temporarily
      const pubKeyContent = fs.readFileSync(`${sshKeyPath}.pub`, 'utf8');
      await ssh.execCommand(`echo "${pubKeyContent.trim()}" > /tmp/${newVmId}_key.pub`);
      await ssh.execCommand(`qm set ${newVmId} --sshkeys /tmp/${newVmId}_key.pub`);

      // 4. Start the VM
      console.log(`Starting Proxmox VM ${newVmId}...`);
      await ssh.execCommand(`qm start ${newVmId}`);

      // 5. Fetch assigned IP Address (Waiting for QEMU Guest Agent)
      console.log(
        'Waiting for VM to boot and acquire IP (requires QEMU Guest Agent on template)...',
      );
      let assignedIp = '';
      for (let i = 0; i < 20; i++) {
        await new Promise((res) => setTimeout(res, 5000));
        const ipRes = await ssh.execCommand(`qm guest cmd ${newVmId} network-get-interfaces`);
        if (!ipRes.stderr && ipRes.stdout) {
          try {
            // Basic parsing, assuming QEMU agent returns JSON
            const data = JSON.parse(ipRes.stdout);
            // Find first non-loopback ipv4
            for (const iface of data) {
              if (iface.name !== 'lo' && iface['ip-addresses']) {
                const ip4 = iface['ip-addresses'].find(
                  (ip: any) => ip['ip-address-type'] === 'ipv4',
                );
                if (ip4 && ip4['ip-address'] !== '127.0.0.1') {
                  assignedIp = ip4['ip-address'];
                  break;
                }
              }
            }
            if (assignedIp) break;
          } catch (e) {
            console.log('IP parse error, retrying...', e);
          }
        }
      }

      if (!assignedIp) {
        console.warn(
          `Could not automatically retrieve IP for VM ${newVmId}. Please ensure QEMU Guest Agent is installed and running on the template.`,
        );
        assignedIp = 'UNKNOWN';
      }

      ssh.dispose();

      const vmInfo = {
        proxmoxVmId: newVmId,
        proxmoxNode: targetNode,
        adminUsername: 'ubuntu', // Or retrieve from config
        vmName,
        macAddress: '',
        powerState: 'running',
        privateIpAddress: assignedIp,
        publicIpAddress: assignedIp, // usually the same in private proxmox setups
        sshKeyName,
        dnsName: assignedIp, // Use IP instead of VM name for private lab access
        userId: user.id,
      };

      console.log('Saving Proxmox VM details to the database...');
      const savedVm = await this.prisma.vmServer.create({
        data: vmInfo,
      });

      console.log('Proxmox VM information saved successfully:', savedVm);
      return savedVm;
    } catch (error) {
      console.error('Error creating Proxmox VM:', error);
      throw error;
    }
  }

  async setupDockerAndNginx(VMid: string, blockscout: boolean) {
    const { sshKeyDir } = config;

    const vm = await this.getSSHConnection(VMid);
    if (!vm) {
      throw new Error(`VM with ID ${VMid} not found.`);
    }

    const sshKeyPath = path.join(sshKeyDir, vm.sshKeyName);
    const privateKeyContent = fs.readFileSync(sshKeyPath, 'utf8');

    console.log(`SSH Key Path: ${sshKeyPath}`);
    const ssh = new NodeSSH();

    // Retry mechanism to give Cloud-Init time to inject the SSH key
    let connected = false;
    for (let i = 0; i < 6; i++) {
      try {
        console.log(
          `Attempt ${i + 1}/6: Connecting to VM ${vm.publicIpAddress} as ${vm.adminUsername}...`,
        );
        await ssh.connect({
          host: vm.publicIpAddress,
          username: vm.adminUsername,
          privateKey: privateKeyContent,
        });
        connected = true;
        break; // Successfully connected
      } catch (err) {
        console.log(
          `SSH connection failed (Cloud-Init might still be configuring). Retrying in 10 seconds...`,
        );
        await new Promise((res) => setTimeout(res, 10000));
      }
    }

    if (!connected) {
      throw new Error(
        `Failed to establish SSH connection to ${vm.publicIpAddress} after multiple retries.`,
      );
    }

    try {
      // Docker, Docker Compose, and Nginx Setup

      console.log('Updating package lists...');
      let result = await ssh.execCommand('sudo apt-get update');
      console.log('apt-get update:', result.stdout, result.stderr);

      console.log('Installing Docker, Docker Compose, and Nginx...');
      result = await ssh.execCommand('sudo apt-get install -y docker.io docker-compose nginx');
      console.log('Installation:', result.stdout, result.stderr);

      console.log('Enabling Docker service...');
      result = await ssh.execCommand('sudo systemctl enable docker');
      console.log('Enable Docker:', result.stdout, result.stderr);

      console.log('Starting Docker service...');
      result = await ssh.execCommand('sudo systemctl start docker');
      console.log('Start Docker:', result.stdout, result.stderr);

      // Add the admin user to the Docker group
      console.log('Adding user to the docker group...');
      result = await ssh.execCommand(`sudo usermod -aG docker ${vm.adminUsername}`);
      console.log('User added to docker group:', result.stdout, result.stderr);

      // Temporarily adjust Docker socket permissions (optional; best used as a safeguard)
      console.log('Adjusting permissions on Docker socket...');
      result = await ssh.execCommand('sudo chmod 666 /var/run/docker.sock');
      console.log('Docker socket permissions updated:', result.stdout, result.stderr);

      console.log('Allowing HTTP traffic on port 80...');
      result = await ssh.execCommand('sudo ufw allow 80/tcp');
      console.log('UFW allow 80:', result.stdout, result.stderr);

      console.log('Allowing HTTPS traffic on port 443...');
      result = await ssh.execCommand('sudo ufw allow 443/tcp');
      console.log('UFW allow 443:', result.stdout, result.stderr);

      // Nginx Configuration

      console.log('Preparing Nginx configuration for load balancing...');
      const nginxNetworkConfig = `
  upstream blockchain_nodes {
      server 192.168.1.100:8545;
      server 192.168.1.102:8550;
      server 192.168.1.103:8552;
      server 192.168.1.104:8554;
  }
  server {
      listen 80;
      server_name ${vm.dnsName};
      location / {
          proxy_pass http://blockchain_nodes;
          proxy_http_version 1.1;
          proxy_set_header Upgrade $http_upgrade;
          proxy_set_header Connection 'upgrade';
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
          proxy_cache_bypass $http_upgrade;
      }
  }
      `;

      const nginxBlockscoutConfig = `
  server {
      listen 80;
      server_name ${vm.dnsName};
      location / {
          proxy_pass http://127.0.0.1:26000;
          proxy_http_version 1.1;
          proxy_set_header Upgrade $http_upgrade;
          proxy_set_header Connection 'upgrade';
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
          proxy_cache_bypass $http_upgrade;
      }
  }
      `;

      let selectedConfig;
      if (blockscout) {
        console.log('Using Blockscout configuration...');
        selectedConfig = nginxBlockscoutConfig;
      } else {
        console.log('Using Network configuration...');
        selectedConfig = nginxNetworkConfig;
      }

      // Escape newlines and quotes for safe command execution
      const escapedNginxConfig = selectedConfig
        .replace(/\$/g, '\\$')
        .replace(/\n/g, '\\n')
        .replace(/"/g, '\\"');

      console.log('Uploading Nginx configuration...');
      result = await ssh.execCommand(
        `echo -e "${escapedNginxConfig}" | sudo tee /etc/nginx/conf.d/blockchain.conf`,
      );
      console.log('Nginx config upload:', result.stdout, result.stderr);

      console.log('Testing Nginx configuration...');
      result = await ssh.execCommand('sudo nginx -t');
      console.log('Nginx test:', result.stdout, result.stderr);

      console.log('Restarting Nginx...');
      result = await ssh.execCommand('sudo systemctl restart nginx');
      console.log('Nginx restart:', result.stdout, result.stderr);

      console.log('Installing Certbot for SSL...');
      result = await ssh.execCommand('sudo snap install --classic certbot');
      console.log('Certbot installation:', result.stdout, result.stderr);

      console.log('Preparing the Certbot command...');
      result = await ssh.execCommand('sudo ln -s /snap/bin/certbot /usr/bin/certbot');
      console.log('Certbot preparation:', result.stdout, result.stderr);

      console.log('Obtaining SSL certificate...');
      result = await ssh.execCommand(
        `sudo certbot --nginx -d ${vm.dnsName} --non-interactive --agree-tos --email itskhvlil@outlook.com `,
      );
      console.log('Certbot obtain SSL:', result.stdout, result.stderr);

      console.log('Testing automatic renewal...');
      result = await ssh.execCommand('sudo certbot renew --dry-run');
      console.log('Certbot test:', result.stdout, result.stderr);

      console.log(
        'Setup complete: Docker, Docker Compose, Nginx, Certbot, and additional packages have been installed and configured.',
      );

      return true;
    } catch (error) {
      console.error('Error during Docker and Nginx setup via SSH:', error);
      throw error;
    } finally {
      ssh.dispose();
    }
  }

  async getSSHConnection(id: string) {
    try {
      return await this.prisma.vmServer.findUnique({
        where: { id },
      });
    } catch (error) {
      console.error('Error fetching VM details:', error);
      throw error;
    }
  }

  async transferDirectoryByName(VMid: string, directoryName: string) {
    const { sshKeyDir, baseDir, remoteBaseDir } = config;

    // Fetch the VM details from the database.
    const vm = await this.getSSHConnection(VMid);
    if (!vm) {
      throw new Error(`VM with ID ${VMid} not found.`);
    }

    const sshKeyPath = path.join(sshKeyDir, vm.sshKeyName);
    const privateKeyContent = fs.readFileSync(sshKeyPath, 'utf8');

    console.log(`SSH Key Path: ${sshKeyPath}`);
    const ssh = new NodeSSH();

    let connected = false;
    for (let i = 0; i < 6; i++) {
      try {
        console.log(
          `Attempt ${i + 1}/6: Connecting to VM ${vm.publicIpAddress} as ${vm.adminUsername} for directory transfer...`,
        );
        await ssh.connect({
          host: vm.publicIpAddress,
          username: vm.adminUsername,
          privateKey: privateKeyContent,
        });
        connected = true;
        break;
      } catch (err) {
        console.log(`SSH connection failed. Retrying in 10 seconds...`);
        await new Promise((res) => setTimeout(res, 10000));
      }
    }

    if (!connected) {
      throw new Error(
        `Failed to establish SSH connection to ${vm.publicIpAddress} after multiple retries.`,
      );
    }

    try {
      // Construct full paths for the local and remote directories.
      const localDir = path.join(baseDir, directoryName);
      const remoteDir = path.join(remoteBaseDir, directoryName);

      console.log(`Transferring directory from ${localDir} to ${remoteDir}...`);

      // Transfer the entire directory.
      const status = await ssh.putDirectory(localDir, remoteDir, {
        recursive: true,
        concurrency: 5,
        validate: (itemPath) => true, // transfer all files
      });

      console.log(`Directory transfer status: ${status}`);
      ssh.dispose();
      return status;
    } catch (error) {
      console.error('Error transferring directory:', error);
      throw error;
    }
  }
}
