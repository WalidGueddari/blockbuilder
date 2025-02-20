import { PrismaClient } from '@saas-monorepo/database';
import { exec } from 'child_process';
import fs from 'fs';
import { NodeSSH } from 'node-ssh';
import path from 'path';
import { promisify } from 'util';

import { config } from '../config.js';
import { azureAdminUsername } from '../constants.js';
import { CreateAzureVMParams } from '../types/server.js';
import { AbstractServiceOptions } from '../types/services.js';

const execAsync = promisify(exec);

export class ServerService {
  prisma: PrismaClient;

  constructor(options: AbstractServiceOptions) {
    this.prisma = options.prisma;
  }

  async createAzureVMServer(params: CreateAzureVMParams) {
    // Extract Azure parameters from your configuration file (loaded from .env variables)
    const {
      subscriptionId,
      location,
      image,
      size,
      osDiskSize,
      storageType,
      securityType,
      sshKeyDir,
    } = config;

    const adminUsername = azureAdminUsername;

    const user = await this.prisma.user.findUnique({
      where: { id: params.userId },
    });

    if (!user) {
      throw new Error(`User with ID ${params.userId} not found.`);
    }

    // Destructure the additional parameters
    const { vmName, resourceGroup, sshKeyName } = params;

    // Determine the directory for the SSH key: use provided sshKeyDir or fall back to HOME/USERPROFILE
    if (!sshKeyDir) {
      throw new Error('Cannot determine home directory for SSH key.');
    }
    // Construct the full path to the SSH key (without the .pub extension)
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

      // Create the Azure resource group (if it doesn't exist)
      console.log(`Creating resource group "${resourceGroup}" in location "${location}"`);
      await execAsync(`az group create --name "${resourceGroup}" --location "${location}"`);

      // Deploy the Azure VM using the Azure CLI command with dynamic parameters
      console.log(`Deploying Azure VM: ${vmName}`);
      const vmCreateCmd = `az vm create --subscription "${subscriptionId}" --resource-group "${resourceGroup}" --name "${vmName}" --location "${location}" --size "${size}" --image "${image}" --admin-username "${adminUsername}" --ssh-key-value "${sshKeyPath}.pub" --os-disk-size-gb "${osDiskSize}" --storage-sku "${storageType}" --security-type "${securityType}" --verbose`;
      await execAsync(vmCreateCmd);

      console.log('VM Deployment Complete!');

      // Retrieve VM details using Azure CLI commands
      console.log('Fetching VM details...');
      const { stdout: vmId } = await execAsync(
        `az vm show --resource-group "${resourceGroup}" --name "${vmName}" --query "id" -o tsv`,
      );
      const { stdout: vmLocation } = await execAsync(
        `az vm show --resource-group "${resourceGroup}" --name "${vmName}" --query "location" -o tsv`,
      );
      const { stdout: privateIP } = await execAsync(
        `az vm show --resource-group "${resourceGroup}" --name "${vmName}" -d --query "privateIps" -o tsv`,
      );
      const { stdout: publicIP } = await execAsync(
        `az vm show --resource-group "${resourceGroup}" --name "${vmName}" -d --query "publicIps" -o tsv`,
      );
      const { stdout: actualAdminUsername } = await execAsync(
        `az vm show --resource-group "${resourceGroup}" --name "${vmName}" --query "osProfile.adminUsername" -o tsv`,
      );

      // Retrieve the network interface ID and then the MAC address
      const { stdout: nicId } = await execAsync(
        `az vm show --resource-group "${resourceGroup}" --name "${vmName}" --query "networkProfile.networkInterfaces[0].id" -o tsv`,
      );
      const { stdout: macAddress } = await execAsync(
        `az network nic show --ids ${nicId.trim()} --query "macAddress" -o tsv`,
      );
      const { stdout: powerState } = await execAsync(
        `az vm get-instance-view --resource-group "${resourceGroup}" --name "${vmName}" --query "instanceView.statuses[1].displayStatus" -o tsv`,
      );

      // Build the VM information object
      const vmInfo = {
        azureId: vmId.trim(),
        adminUsername: actualAdminUsername.trim(),
        vmName,
        location: vmLocation.trim(),
        macAddress: macAddress.trim(),
        powerState: powerState.trim(),
        privateIpAddress: privateIP.trim(),
        publicIpAddress: publicIP.trim(),
        resourceGroup,
        sshKeyName,
        userId: user.id,
      };

      // Save the VM details to the database using Prisma.
      console.log('Saving VM details to the database...');
      const savedVm = await this.prisma.vmServer.create({
        data: vmInfo,
      });

      console.log('VM information saved successfully:', savedVm);
      return savedVm;
    } catch (error) {
      console.error('Error creating Azure VM:', error);
      throw error;
    }
  }

  async setupDockerAndNginx(VMid: string) {
    const { sshKeyDir } = config;

    // Fetch the VM details from the database
    const vm = await this.getSSHConnection(VMid);
    if (!vm) {
      throw new Error(`VM with ID ${VMid} not found.`);
    }

    const sshKeyPath = path.join(sshKeyDir, vm.sshKeyName);
    const privateKeyContent = fs.readFileSync(sshKeyPath, 'utf8');

    console.log(`SSH Key Path: ${sshKeyPath}`);
    const ssh = new NodeSSH();
    try {
      console.log(`Connecting to VM ${vm.publicIpAddress} as ${vm.adminUsername}...`);
      await ssh.connect({
        host: vm.publicIpAddress,
        username: vm.adminUsername,
        privateKey: privateKeyContent,
      });

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
      const nginxConfig = `
  upstream blockchain_nodes {
      server 192.168.1.100:8545;
      server 192.168.1.102:8550;
      server 192.168.1.103:8552;
      server 192.168.1.104:8554;
  }
  server {
      listen 80;
      server_name ${vm.publicIpAddress};
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
      // Escape newlines and quotes for safe command execution
      const escapedNginxConfig = nginxConfig
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

      console.log(
        'Setup complete: Docker, Docker Compose, Nginx, and additional packages have been installed and configured.',
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

    try {
      console.log(`Connecting to VM ${vm.publicIpAddress} as ${vm.adminUsername}...`);
      await ssh.connect({
        host: vm.publicIpAddress,
        username: vm.adminUsername,
        privateKey: privateKeyContent,
      });

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
