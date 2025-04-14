// containerService.ts
import { PrismaClient } from '@saas-monorepo/database';
import { exec } from 'child_process';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import fs from 'fs/promises';
import { NodeSSH } from 'node-ssh';
import path from 'path';
import { ClientChannel } from 'ssh2';
import { promisify } from 'util';

// 1. Import the centralized config
import { config } from '../config.js';
import { ContainerService } from '../services/containers.js';
import { NodeService } from '../services/nodes.js';
import { CreateAzureVMParams } from '../types/server.js';
import { AbstractServiceOptions } from '../types/services.js';
import { ServerService } from './server.js';

const execAsync = promisify(exec);

export class BlockscoutService {
  prisma: PrismaClient;
  nodeService: NodeService;
  serverService: ServerService;
  containerService: ContainerService;

  constructor(options: AbstractServiceOptions) {
    this.prisma = options.prisma;
    this.nodeService = new NodeService({ prisma: this.prisma });
    this.containerService = new ContainerService({ prisma: this.prisma });
    this.serverService = new ServerService({ prisma: this.prisma });
  }

  private async _generateDockerComposeFile(chainId: number, dns: string, networkId: string) {
    try {
      const { networkBinDir, blockScoutTemplateFile } = config;
      const command = [
        `BLOCKSCOUT_TEMPLATE_FILE=${blockScoutTemplateFile}`,
        `NET_ID=${networkId}`,
        `DNS_PLACEHOLDER=${dns}`,
        `CHAINID_PlACEHOLDER=${chainId}`,
        `${networkBinDir}/generate_docker_compose_blockscout.sh`,
      ].join(' ');

      console.log('Command to execute (blockscout)):', command);
      const { stdout } = await execAsync(command, { shell: '/bin/bash' });
      console.log('Output for generate_docker_compose_blockscout.sh:', stdout);
    } catch (error) {
      console.error('Error generating Docker Compose file for blockscout:', error);
      throw error;
    }
  }

  async runBlockscout(networkId: string, vmId: string) {
    const { sshKeyDir, remoteBaseDir, subnet } = config;
    const ssh = new NodeSSH();

    // Fetch the VM details from the database.
    const vm = await this.serverService.getSSHConnection(vmId);
    if (!vm) {
      return { success: false, message: [], errors: [`VM with ID ${vmId} not found.`] };
    }

    const sshKeyPath = path.join(sshKeyDir, vm.sshKeyName);
    const privateKeyContent = await fs.readFile(sshKeyPath, 'utf8');

    console.log(`SSH Key Path: ${sshKeyPath}`);

    try {
      console.log(`Connecting to VM ${vm.publicIpAddress} as ${vm.adminUsername}...`);
      await ssh.connect({
        host: vm.publicIpAddress,
        username: vm.adminUsername,
        privateKey: privateKeyContent,
      });

      // Create Docker network
      const createNetwork = await ssh.execCommand(
        `docker network create --subnet=${subnet} blockscout_network`,
        { execOptions: { pty: true } },
      );

      if (createNetwork.stderr) {
        throw new Error(`Failed to create network: ${createNetwork.stderr}`);
      }

      console.log('Network created successfully:', createNetwork.stdout);

      const outputs: string[] = [];
      const errors: string[] = [];

      const nodeDir = `${remoteBaseDir}/blockscout-${networkId}`;
      console.log(`Blockscout Directory:`, nodeDir);

      // Start Node
      let result = await ssh.execCommand(
        `cd ${nodeDir} && docker-compose up -d`,
        // { execOptions: { pty: true } }
      );

      if (result.stderr) {
        console.error(`Error starting Node-:`, result.stderr);
        errors.push(`Node- failed to start: ${result.stderr}`);
      } else {
        console.log(`docker-compose output for Node-:`, result.stdout);
        outputs.push(`Node started successfully.`);
      }

      ssh.dispose();

      if (errors.length > 0) {
        return { success: false, message: outputs, errors };
      }

      return { success: true, message: outputs };
    } catch (error: any) {
      console.error('Error in runNode:', error);
      return { success: false, message: [], errors: [error.message] };
    }
  }

  async deployingBlockscout(
    networkId: string,
    userId: string, // Added userId as a new input parameter
  ) {
    try {
      // Retrieve the network details from the database
      const network = await this.prisma.network.findUnique({
        where: { id: networkId },
        include: {
          server: true,
        },
      });
      if (!network) {
        throw new Error(`Network with ID ${networkId} not found`);
      }

      // Create a payload with the input userId
      const azurePayload: CreateAzureVMParams = {
        // Merge or override any properties from the original azureParams if needed
        resourceGroup: `${network.name}-blockscout`,
        userId: userId, // now set from the function input
        vmName: `${network.name}-blockscout`,
        sshKeyName: `${network.name}-blockscout`,
      };

      // Create the Azure VM server using the updated payload
      const serverInit = await this.serverService.createAzureVMServer(azurePayload);
      if (!serverInit) {
        throw new Error(`Failed to create Azure VM server`);
      }
      console.log('Azure VM server created:', serverInit);

      // Set up Docker and Nginx on the created server
      await this.serverService.setupDockerAndNginx(serverInit.id, true);

      if (!network.server.dnsName) {
        throw new Error('DNS name is missing from the Azure VM server.');
      }

      // Generate configuration (e.g., a Docker Compose file) for Blockscout
      const blockscoutConfig = await this._generateDockerComposeFile(
        network.chainId,
        network.server.dnsName,
        network.id,
      );

      // Optionally, you can log or further process blockscoutConfig
      console.log('Blockscout configuration generated:', blockscoutConfig);

      console.log('Transferring Blockscout directory to VM...');
      await this.serverService.transferDirectoryByName(serverInit.id, `blockscout-${network.id}`);
      console.log('Blockscout transferred to VM');

      // console.log('Stopping any running Besu nodes...');
      // await this.containerService.killBesuNode();
      // console.log('Existing Besu nodes terminated');

      console.log('Starting Blockscout...');
      const start = await this.runBlockscout(network.id, serverInit.id);

      return start;
    } catch (error) {
      console.error('Error deploying blockscout:', error);
      throw error;
    }
  }
}
