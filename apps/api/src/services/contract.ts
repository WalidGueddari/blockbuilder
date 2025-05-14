import { DraftContract, PrismaClient } from '@saas-monorepo/database';
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
    console.log(`Getting SSH connection for network ${networkId}`);
    const network = await this.prisma.network.findUnique({
      where: { id: networkId },
      include: { server: true },
    });

    if (!network || !network.server) {
      console.error(`Network ${networkId} or its server not found`);
      throw new Error(`Network ${networkId} or its server not found`);
    }

    console.log(`Found network and server for ${networkId}`);
    const sshKeyPath = path.join(this.config.sshKeyDir, network.server.sshKeyName);
    console.log(`SSH key path: ${sshKeyPath}`);

    if (!fs.existsSync(sshKeyPath)) {
      console.error(`SSH key file not found at ${sshKeyPath}`);
      throw new Error(`SSH key file not found at ${sshKeyPath}`);
    }

    const privateKeyContent = fs.readFileSync(sshKeyPath, 'utf8');
    console.log('SSH key loaded successfully');

    return {
      server: network.server,
      privateKey: privateKeyContent,
    };
  }

  private async connectToServer(networkId: string, retries = 3): Promise<void> {
    console.log(`Connecting to server for network ${networkId}`);
    const { server, privateKey } = await this.getSSHConnection(networkId);

    for (let i = 0; i < retries; i++) {
      try {
        console.log(`Attempt ${i + 1} to connect to server ${server.publicIpAddress}`);
        await this.ssh.connect({
          host: server.publicIpAddress,
          username: server.adminUsername,
          privateKey: privateKey,
          readyTimeout: 120000,
          keepaliveInterval: 50000,
          keepaliveCountMax: 30,
        });
        console.log('Successfully connected to server');
        return;
      } catch (error: any) {
        console.error(`Connection attempt ${i + 1} failed:`, error.message);
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
    console.log('Disconnecting from server');
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

      // Quote each argument to handle spaces/special chars
      const quotedArgs = args.map((arg) => `"${arg}"`).join(' ');
      const command = `docker exec ${this.CONTAINER_NAME} npx ts-node --transpile-only scripts/interact.ts "${address}" "${functionName}" ${quotedArgs}`;
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
    console.log(`🚀 Starting contract deployment: ${contractName} on network: ${networkId}`);

    const tempFilePath = `/tmp/${contractName}.sol`;
    const destPath = `.containers/${networkId}/hardhat/contracts/${contractName}.sol`;

    try {
      await this.connectToServer(networkId);

      // Step 1: Upload contract to temp file
      const contractContent = contractFile.toString('utf-8');
      const createFileCommand = `echo '${contractContent.replace(/'/g, "'\\''")}' > ${tempFilePath}`;
      console.log(`📦 Uploading contract to: ${tempFilePath}`);
      const createResult = await this.ssh.execCommand(createFileCommand);
      if (createResult.stderr) {
        console.error('❌ Error uploading contract:', createResult.stderr);
        throw new Error(`Failed to create contract file: ${createResult.stderr}`);
      }

      // Step 2: Move to Hardhat container-mounted path
      const moveCommand = `mv ${tempFilePath} ${destPath}`;
      console.log(`📂 Moving contract to: ${destPath}`);
      const moveResult = await this.ssh.execCommand(moveCommand);
      if (moveResult.stderr) {
        console.error('❌ Error moving contract:', moveResult.stderr);
        throw new Error(`Failed to move contract file: ${moveResult.stderr}`);
      }

      // Step 3: Compile inside the container
      const compileCommand = `docker exec ${this.CONTAINER_NAME} npx hardhat compile`;
      console.log(`🛠️ Compiling contract inside container: ${this.CONTAINER_NAME}`);
      const compileResult = await this.ssh.execCommand(compileCommand);

      // Filter out npm notices from stderr
      const filteredStderr = compileResult.stderr
        .split('\n')
        .filter((line) => !line.includes('npm notice'))
        .join('\n');

      if (filteredStderr) {
        console.error('❌ Compilation error:', filteredStderr);
        throw new Error(`Compilation failed: ${filteredStderr}`);
      }
      console.log('✅ Compilation output:\n', compileResult.stdout);

      // Step 4: Deploy the contract
      const deployCommand = `docker exec ${this.CONTAINER_NAME} npx hardhat run scripts/deploy.ts --network localhost`;
      console.log('🚀 Deploying contract...');
      const deployResult = await this.ssh.execCommand(deployCommand);
      if (deployResult.stderr) {
        console.error('❌ Deployment error:', deployResult.stderr);
        throw new Error(`Deployment failed: ${deployResult.stderr}`);
      }
      console.log('✅ Deployment output:\n', deployResult.stdout);

      return deployResult.stdout || 'Contract deployed successfully';
    } catch (error: any) {
      console.error('🛑 Deployment process failed:', error);
      throw new Error(`Failed to deploy contract: ${error.message}`);
    } finally {
      try {
        // Cleanup: Remove the uploaded contract file
        const cleanupCommand = `rm ${destPath}`;
        console.log(`🧹 Cleaning up contract file at: ${destPath}`);
        const cleanupResult = await this.ssh.execCommand(cleanupCommand);
        if (cleanupResult.stderr) {
          console.warn('⚠️ Warning: Failed to remove contract file:', cleanupResult.stderr);
        } else {
          console.log('🧼 Contract file removed successfully');
        }
      } catch (cleanupError) {
        console.warn('⚠️ Warning: Failed to cleanup contract file:', cleanupError);
      }
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

// apps/api/src/services/deployedContract.ts

export class DeployedContractService {
  prisma: PrismaClient;

  constructor(options: AbstractServiceOptions) {
    this.prisma = options.prisma;
  }

  async create(data: {
    address: string;
    name: string;
    type: string;
    description?: string;
    tags: string[];
    abi?: any;
    networkId: string;
  }) {
    return this.prisma.deployedContract.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.deployedContract.findMany({
      include: {
        network: true,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.deployedContract.findUnique({
      where: { id },
      include: {
        network: true,
        interactions: true,
      },
    });
  }
}

// apps/api/src/services/draftContract.ts
export class DraftContractService {
  prisma: PrismaClient;

  constructor(options: AbstractServiceOptions) {
    this.prisma = options.prisma;
  }

  async create(data: {
    name: string;
    content: string;
    type?: string;
    description?: string;
    tags: string[];
    networkId?: string;
  }) {
    return this.prisma.draftContract.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.draftContract.findMany();
  }

  async findById(id: string) {
    return this.prisma.draftContract.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: Partial<DraftContract>) {
    return this.prisma.draftContract.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.draftContract.delete({
      where: { id },
    });
  }
}
