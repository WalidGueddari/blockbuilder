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

  async setupDockerAndNginx(VMid: string, userId: string) {
    const { sshKeyDir } = config;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found.`);
    }

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

      // Update package lists and install Docker, Docker Compose, and Nginx
      console.log('Updating package lists and installing Docker, Docker Compose, and Nginx...');
      const installCmd =
        'sudo apt-get update && sudo apt-get install -y docker.io docker-compose nginx';
      const installResult = await ssh.execCommand(installCmd);
      console.log('Installation output:', installResult.stdout, installResult.stderr);

      // Enable and start the Docker service
      console.log('Enabling and starting Docker service...');
      const dockerCmd = 'sudo systemctl enable docker && sudo systemctl start docker';
      const dockerResult = await ssh.execCommand(dockerCmd);
      console.log('Docker service output:', dockerResult.stdout, dockerResult.stderr);

      // Allow HTTP and HTTPS traffic through the firewall
      console.log('Allowing HTTP (80) and HTTPS (443) traffic through firewall...');
      const firewallCmd = 'sudo ufw allow 80/tcp && sudo ufw allow 443/tcp';
      const firewallResult = await ssh.execCommand(firewallCmd);
      console.log('Firewall configuration output:', firewallResult.stdout, firewallResult.stderr);

      // Prepare the Nginx configuration for load balancing.
      // In this example, Nginx will load balance between 4 endpoints.
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

      // Upload the Nginx configuration using sudo tee.
      console.log('Uploading Nginx configuration...');
      // Escape newlines and quotes for safe command execution
      const escapedNginxConfig = nginxConfig
        .replace(/\$/g, '\\$')
        .replace(/\n/g, '\\n')
        .replace(/"/g, '\\"');
      const nginxConfigCmd = `echo -e "${escapedNginxConfig}" | sudo tee /etc/nginx/conf.d/blockchain.conf`;
      const nginxUploadResult = await ssh.execCommand(nginxConfigCmd);
      console.log(
        'Nginx config upload output:',
        nginxUploadResult.stdout,
        nginxUploadResult.stderr,
      );

      // Test the Nginx configuration and restart Nginx if the test passes.
      console.log('Testing Nginx configuration...');
      const testResult = await ssh.execCommand('sudo nginx -t');
      console.log('Nginx test output:', testResult.stdout, testResult.stderr);

      console.log('Restarting Nginx...');
      const restartResult = await ssh.execCommand('sudo systemctl restart nginx');
      console.log('Nginx restart output:', restartResult.stdout, restartResult.stderr);

      // // Set up Certbot for HTTPS.
      // console.log('Setting up Certbot for HTTPS...');
      // // Install Certbot using snap
      // const snapInstall = await ssh.execCommand('sudo snap install --classic certbot');
      // console.log('Certbot snap install output:', snapInstall.stdout, snapInstall.stderr);

      // // Configure Certbot with the Nginx plugin
      // const certbotSetup = await ssh.execCommand(
      //   `sudo certbot --nginx --non-interactive --agree-tos --email ${user.email} --redirect`
      // );
      // console.log('Certbot setup output:', certbotSetup.stdout, certbotSetup.stderr);

      // // Perform a dry-run renewal to test automatic certificate renewal.
      // const certbotRenew = await ssh.execCommand('sudo certbot renew --dry-run');
      // console.log('Certbot renew dry-run output:', certbotRenew.stdout, certbotRenew.stderr);

      console.log(
        'Setup complete: Docker, Docker Compose, and Nginx have been installed and configured.',
      );
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
}
