// HardhatService.ts
import { PrismaClient } from '@saas-monorepo/database';
import { exec } from 'child_process';
import fs from 'fs/promises';
import { NodeSSH } from 'node-ssh';
import path from 'path';
import { promisify } from 'util';

// 1. Import the centralized config
import { config } from '../config.js';
import { AbstractServiceOptions } from '../types/services.js';
import { ServerService } from './server.js';

const execAsync = promisify(exec);

export class HardhatService {
  prisma: PrismaClient;
  serverService: ServerService;

  constructor(options: AbstractServiceOptions) {
    this.prisma = options.prisma;
    this.serverService = new ServerService({ prisma: this.prisma });
  }

  async generateHardhatDockerCompose(networkId: string, network_dns: string): Promise<void> {
    const { networkBinDir, dockerUsername, hardhatContainerName, hardhatTemplateFile, baseDir } =
      config;
    try {
      // Get the first allocation (which contains the private key) from the database
      const alloc = await this.prisma.alloc.findFirst({
        where: { networkId },
        select: { private_key: true },
      });

      if (!alloc || !alloc.private_key) {
        throw new Error('No private key found for this network');
      }

      const command = `NET_ID=${networkId} HARDHAT_TEMPLATE_FILE=${hardhatTemplateFile} PRIVATE_KEY=${alloc.private_key} DNS_PLACEHOLDER=${network_dns} BASE_DIR=${baseDir} DOCKER_USER=${dockerUsername} HARDHAT_CONTAINER_NAME=${hardhatContainerName} ${networkBinDir}/generate_docker_compose_hardhat.sh`;
      console.log(`Executing: ${command}`);

      const { stdout } = await execAsync(command, { shell: '/bin/bash' });
      console.log('Hardhat Docker Compose generated:', stdout);
    } catch (error: any) {
      console.error('Error generating Hardhat Docker Compose:', error);
      throw new Error(`Failed to generate Hardhat Docker Compose: ${error.message}`);
    }
  }

  async startHardhat(
    networkId: string,
    vmId: string,
  ): Promise<{ success: boolean; message: string[]; errors?: string[] }> {
    const { sshKeyDir, remoteBaseDir } = config;
    const ssh = new NodeSSH();

    try {
      const vm = await this.serverService.getSSHConnection(vmId);
      if (!vm) {
        return { success: false, message: [], errors: [`VM with ID ${vmId} not found.`] };
      }

      const sshKeyPath = path.join(sshKeyDir, vm.sshKeyName);
      const privateKeyContent = await fs.readFile(sshKeyPath, 'utf8');

      await ssh.connect({
        host: vm.publicIpAddress,
        username: vm.adminUsername,
        privateKey: privateKeyContent,
      });

      const hardhatDir = `${remoteBaseDir}/${networkId}`;
      const result = await ssh.execCommand(
        `cd ${hardhatDir} && docker-compose -f docker-compose.hardhat.yml up -d`,
        {
          execOptions: { pty: true },
        },
      );

      ssh.dispose();

      if (result.stderr) {
        return {
          success: false,
          message: [],
          errors: [`Failed to start Hardhat: ${result.stderr}`],
        };
      }

      return {
        success: true,
        message: ['Hardhat started successfully.'],
      };
    } catch (error: any) {
      console.error('Error in startHardhat:', error);
      return {
        success: false,
        message: [],
        errors: [error.message],
      };
    }
  }

  async stopHardhat(
    networkId: string,
    vmId: string,
  ): Promise<{ success: boolean; message: string[]; errors?: string[] }> {
    const { sshKeyDir, remoteBaseDir } = config;
    const ssh = new NodeSSH();

    try {
      const vm = await this.serverService.getSSHConnection(vmId);
      if (!vm) {
        return { success: false, message: [], errors: [`VM with ID ${vmId} not found.`] };
      }

      const sshKeyPath = path.join(sshKeyDir, vm.sshKeyName);
      const privateKeyContent = await fs.readFile(sshKeyPath, 'utf8');

      await ssh.connect({
        host: vm.publicIpAddress,
        username: vm.adminUsername,
        privateKey: privateKeyContent,
      });

      const hardhatDir = `${remoteBaseDir}/${networkId}`;
      const result = await ssh.execCommand(
        `cd ${hardhatDir} && docker-compose -f docker-compose.hardhat.yml down`,
        {
          execOptions: { pty: true },
        },
      );

      ssh.dispose();

      if (result.stderr) {
        return {
          success: false,
          message: [],
          errors: [`Failed to stop Hardhat: ${result.stderr}`],
        };
      }

      return {
        success: true,
        message: ['Hardhat stopped successfully.'],
      };
    } catch (error: any) {
      console.error('Error in stopHardhat:', error);
      return {
        success: false,
        message: [],
        errors: [error.message],
      };
    }
  }
}
