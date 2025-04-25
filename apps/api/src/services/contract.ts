import { PrismaClient } from '@saas-monorepo/database';
import { exec } from 'child_process';
import fs from 'fs';
import { NodeSSH } from 'node-ssh';
import path from 'path';
import { promisify } from 'util';

import { AbstractServiceOptions } from '../types/services.js';

const execAsync = promisify(exec);

export class ContractService {
  prisma: PrismaClient;
  private readonly CONTAINER_NAME = 'hardhat';
  private readonly ssh: NodeSSH;
  private readonly config = {
    sshKeyDir: process.env.SSH_KEY_DIR || '',
  };

  constructor(options: AbstractServiceOptions) {
    this.prisma = options.prisma;
    this.ssh = new NodeSSH();
  }

  private async getSSHConnection(networkId: string) {
    const network = await this.prisma.network.findUnique({
      where: { id: networkId },
      include: { server: true },
    });

    if (!network || !network.server) {
      throw new Error(`Network ${networkId} or its server not found`);
    }

    const sshKeyPath = path.join(this.config.sshKeyDir, network.server.sshKeyName);
    const privateKeyContent = fs.readFileSync(sshKeyPath, 'utf8');

    return {
      server: network.server,
      privateKey: privateKeyContent,
    };
  }

  private async connectToServer(networkId: string, retries = 3): Promise<void> {
    const { server, privateKey } = await this.getSSHConnection(networkId);

    for (let i = 0; i < retries; i++) {
      try {
        await this.ssh.connect({
          host: server.publicIpAddress,
          username: server.adminUsername,
          privateKey: privateKey,
          readyTimeout: 30000,
          keepaliveInterval: 10000,
        });
        return;
      } catch (error: any) {
        if (i === retries - 1) {
          throw new Error(
            `Failed to connect to server after ${retries} attempts: ${error.message}`,
          );
        }
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }

  private async disconnectFromServer(): Promise<void> {
    this.ssh.dispose();
  }

  private validateAddress(address: string): void {
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      throw new Error('Invalid contract address format');
    }
  }

  private validateFunctionName(functionName: string): void {
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(functionName)) {
      throw new Error('Invalid function name format');
    }
  }

  async interactWithContract(
    networkId: string,
    address: string,
    functionName: string,
    args: string[] = [],
  ): Promise<string> {
    try {
      this.validateAddress(address);
      this.validateFunctionName(functionName);

      await this.connectToServer(networkId);

      // Execute the command on the server
      const command = `docker exec ${this.CONTAINER_NAME} npx ts-node --transpile-only scripts/interact.ts "${address}" "${functionName}" ${args.join(' ')}`;
      const result = await this.ssh.execCommand(command);

      if (result.stderr) {
        throw new Error(result.stderr);
      }

      return result.stdout;
    } catch (error: any) {
      throw new Error(`Failed to interact with contract: ${error.message}`);
    } finally {
      await this.disconnectFromServer();
    }
  }

  async deployContract(
    networkId: string,
    contractFile: Buffer,
    contractName: string,
  ): Promise<string> {
    try {
      await this.connectToServer(networkId);

      // Create a temporary file to store the contract
      const tempFilePath = `/tmp/${contractName}.sol`;

      // Upload the contract file to the server
      await this.ssh.putFile(contractFile.toString(), tempFilePath);

      // Compile the contract first
      const compileCommand = `docker exec ${this.CONTAINER_NAME} npx hardhat compile`;
      const compileResult = await this.ssh.execCommand(compileCommand);

      if (compileResult.stderr) {
        throw new Error(`Compilation failed: ${compileResult.stderr}`);
      }

      // Move the file to the contracts directory
      const moveCommand = `docker cp ${tempFilePath} ${this.CONTAINER_NAME}:/app/contracts/${contractName}.sol`;
      await this.ssh.execCommand(moveCommand);

      // Clean up the temporary file
      await this.ssh.execCommand(`rm ${tempFilePath}`);

      // Trigger deployment
      const deployCommand = `docker exec ${this.CONTAINER_NAME} npx hardhat run scripts/deploy.ts --network localhost`;
      const result = await this.ssh.execCommand(deployCommand);

      if (result.stderr) {
        throw new Error(result.stderr);
      }

      return result.stdout;
    } catch (error: any) {
      throw new Error(`Failed to deploy contract: ${error.message}`);
    } finally {
      await this.disconnectFromServer();
    }
  }

  async verifyContract(networkId: string, address: string, contractName: string): Promise<string> {
    try {
      this.validateAddress(address);
      await this.connectToServer(networkId);

      const verifyCommand = `docker exec ${this.CONTAINER_NAME} npx hardhat verify --network localhost ${address} "${contractName}"`;
      const result = await this.ssh.execCommand(verifyCommand);

      if (result.stderr) {
        throw new Error(result.stderr);
      }

      return result.stdout;
    } catch (error: any) {
      throw new Error(`Failed to verify contract: ${error.message}`);
    } finally {
      await this.disconnectFromServer();
    }
  }

  async getContractABI(networkId: string, address: string): Promise<string> {
    try {
      this.validateAddress(address);
      await this.connectToServer(networkId);

      const abiCommand = `docker exec ${this.CONTAINER_NAME} npx hardhat get-abi ${address}`;
      const result = await this.ssh.execCommand(abiCommand);

      if (result.stderr) {
        throw new Error(result.stderr);
      }

      return result.stdout;
    } catch (error: any) {
      throw new Error(`Failed to get contract ABI: ${error.message}`);
    } finally {
      await this.disconnectFromServer();
    }
  }
}
