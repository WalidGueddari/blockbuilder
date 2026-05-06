import { DraftContract, PrismaClient } from '@saas-monorepo/database';
import { exec } from 'child_process';
import fs from 'fs';
import { NodeSSH } from 'node-ssh';
import path from 'path';
import { promisify } from 'util';

import { AbstractServiceOptions } from '../types/services.js';

// Define ContractConfig locally, mirroring the frontend structure
// This should ideally be a shared type if possible in your monorepo structure.
export type ContractType =
  | 'ERC20'
  | 'ERC721'
  | 'ERC1155'
  | 'Stablecoin'
  | 'RWA'
  | 'Governor'
  | 'Custom'
  | 'Imported';

export interface ContractConfig {
  contractType: ContractType;
  name: string;
  symbol: string;
  mintable: boolean;
  burnable: boolean;
  pausable: boolean;
  decimals?: number;
  initialSupply?: string;
  maxSupply?: string;
  royaltyFee?: number;
  governanceSettings?: {
    votingDelay: number;
    votingPeriod: number;
    proposalThreshold: number;
  };
  rwaSettings?: {
    assetType: string;
    jurisdiction: string;
    complianceRequired: boolean;
  };
  stablecoinSettings?: {
    pegCurrency: string;
    oracleAddress?: string;
  };
  baseUri?: string;
  governorName?: string;
  votingDelay?: number; // Note: Duplicated from governanceSettings, check if intentional
  votingPeriod?: number; // Note: Duplicated from governanceSettings, check if intentional
  proposalThreshold?: number; // Note: Duplicated from governanceSettings, check if intentional
  quorumNumerator?: number;
  customCode?: string; // This is usually the main contract code, `content` in DraftContract seems to be this.
  description?: string;
  tags?: string[];
}
interface BackendInteractionResult {
  success: boolean;
  contractAddress: string;
  functionName: string;
  network: string;
  timestamp: string;
  functionType: 'view' | 'transaction';
  result?: any;
  transactionHash?: string;
  gasUsed?: string;
  blockNumber?: number;
  logs?: any[];
  signerAddress?: string;
  error?: string;
}

const execAsync = promisify(exec);

export class ContractService {
  prisma: PrismaClient;
  private readonly CONTAINER_NAME = 'hardhat';
  private readonly ssh: NodeSSH;
  private readonly deployedContractService: DeployedContractService;
  private readonly config = {
    sshKeyDir: process.env.SSH_KEY_DIR || '',
  };

  constructor(options: AbstractServiceOptions) {
    this.prisma = options.prisma;
    this.ssh = new NodeSSH();
    this.deployedContractService = new DeployedContractService(options);
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
  ): Promise<any> {
    try {
      this.validateAddress(address);
      this.validateFunctionName(functionName);

      await this.connectToServer(networkId);
      console.log('🚀 Starting contract interaction: ${functionName} on network: ${networkId}');
      const quotedArgs = args.map((arg) => `"${arg}"`).join(' ');
      const command = `docker exec -e CONTRACT_ADDRESS=${address} -e CONTRACT_FUNCTION=${functionName} -e CONTRACT_ARGS='[${quotedArgs}]' ${this.CONTAINER_NAME} npx hardhat run scripts/interact.ts --network localhost`;

      const result = await this.ssh.execCommand(command);

      if (result.stderr) {
        throw new Error(result.stderr);
      }

      const outputLines = result.stdout.split('\n');
      const lastJsonLine = outputLines.reverse().find((line) => {
        try {
          const parsed = JSON.parse(line);
          return parsed && typeof parsed === 'object' && 'success' in parsed;
        } catch {
          return false;
        }
      });

      if (!lastJsonLine) {
        throw new Error('Failed to parse backend interaction result.');
      }

      const parsedResult: BackendInteractionResult = JSON.parse(lastJsonLine);

      if (!parsedResult.success) {
        throw new Error(parsedResult.error || 'Contract interaction failed.');
      }

      return parsedResult.result;
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
    options: {
      abi: any;
      description?: string;
      tags?: string[];
      config?: ContractConfig;
    },
  ): Promise<{ contractAddress: string; transactionHash: string; abi: any }> {
    console.log(`🚀 Starting contract deployment: ${contractName} on network: ${networkId}`);

    // Build paths
    const tempFilePath = `/tmp/${contractName}.sol`;
    const destPath = `.containers/${networkId}/hardhat/contracts/${contractName}.sol`;

    try {
      await this.connectToServer(networkId);

      // 1️⃣ Upload to temp file
      const source = contractFile.toString('utf-8');
      const safeContent = source.replace(/'/g, "'\\''");
      await this.ssh.execCommand(`echo '${safeContent}' > ${tempFilePath}`);

      // 2️⃣ Move into container-mounted dir
      await this.ssh.execCommand(`mv ${tempFilePath} ${destPath}`);

      // 3️⃣ Compile
      const compile = await this.ssh.execCommand(
        `docker exec ${this.CONTAINER_NAME} npx hardhat compile`,
      );
      const compileErr = compile.stderr
        .split('\n')
        .filter((l) => !l.includes('npm notice'))
        .join('\n');
      if (compileErr) throw new Error(`Compilation failed: ${compileErr}`);
      console.log('✅ Compilation succeeded');

      // 4️⃣ Deploy
      const deploy = await this.ssh.execCommand(
        `docker exec -e CONTRACT_PATH=contracts/${contractName}.sol -e CONTRACT_NAME=${contractName} ${this.CONTAINER_NAME} npx hardhat run scripts/deploy.ts --network localhost`,
      );
      if (deploy.stderr) throw new Error(`Deployment failed: ${deploy.stderr}`);
      console.log('✅ Raw deploy output:\n', deploy.stdout);

      // 5️⃣ Parse JSON result
      let parsed: {
        contractAddress: string;
        transactionHash: string;
        contractName?: string;
        artifactPath?: string;
        abi: any;
      };
      try {
        const stdout = deploy.stdout.trim();
        // Find the last complete JSON object in the output
        const jsonMatch = stdout.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('Could not find JSON in deployment output.');
        }
        parsed = JSON.parse(jsonMatch[0]);
      } catch (err) {
        console.error('❌ Could not parse deployment output. stdout content was:', deploy.stdout);
        throw new Error(
          `Invalid deployment result format or JSON not found: ${err instanceof Error ? err.message : String(err)}`,
        );
      }

      const { contractAddress, transactionHash, abi } = parsed; // Extract ABI from parsed result

      // 6️⃣ Persist to database
      await this.deployedContractService.create({
        address: contractAddress,
        name: contractName,
        type: options.config?.contractType ?? 'Custom',
        description: options.description,
        tags: options.tags ?? [],
        abi: abi,
        networkId,
        transactionHash,
      });

      console.log('✅ Deployment saved to database:', contractAddress);

      return { contractAddress, transactionHash, abi };
    } catch (err: any) {
      console.error('🛑 Deployment error:', err);
      throw new Error(`Failed to deploy contract: ${err.message}`);
    } finally {
      // Cleanup file inside container workspace
      try {
        //await this.ssh.execCommand(`rm ${destPath}`);
        console.log('🧼 Cleaned up deployed contract file');
      } catch {
        console.warn('⚠️ Could not remove contract file');
      }
      await this.disconnectFromServer();
    }
  }

  async addExternalContractUsingCode(
    networkId: string,
    address: string,
    contractFile: Buffer,
    contractName: string,
    options: {
      abi: any;
      description?: string;
      tags?: string[];
      config?: ContractConfig;
    },
  ): Promise<{ contractAddress: string; abi: any }> {
    console.log(`🚀 Starting contract adding: ${contractName} on network: ${networkId}`);

    // Build paths
    const tempFilePath = `/tmp/${contractName}.sol`;
    const destPath = `.containers/${networkId}/hardhat/contracts/${contractName}.sol`;

    try {
      await this.connectToServer(networkId);

      // 1️⃣ Upload to temp file
      const source = contractFile.toString('utf-8');
      const safeContent = source.replace(/'/g, "'\\''");
      await this.ssh.execCommand(`echo '${safeContent}' > ${tempFilePath}`);

      // 2️⃣ Move into container-mounted dir
      await this.ssh.execCommand(`mv ${tempFilePath} ${destPath}`);

      // 3️⃣ Compile
      const compile = await this.ssh.execCommand(
        `docker exec ${this.CONTAINER_NAME} npx hardhat compile`,
      );
      const compileErr = compile.stderr
        .split('\n')
        .filter((l) => !l.includes('npm notice'))
        .join('\n');
      if (compileErr) throw new Error(`Compilation failed: ${compileErr}`);
      console.log('✅ Compilation succeeded');

      // 4️⃣ Deploy
      const add = await this.ssh.execCommand(
        `docker exec ${this.CONTAINER_NAME} CONTRACT_ADDRESS=${address} CONTRACT_NAME=${contractName} SOURCE_FILE=${destPath}  NETWORK_DEPLOYED=localhost npx hardhat run scripts/addUsingCode.ts --network localhost `,
      );
      if (add.stderr) throw new Error(`Deployment failed: ${add.stderr}`);
      console.log('✅ Raw deploy output:\n', add.stdout);

      // 5️⃣ Parse JSON result
      let parsed: {
        contractAddress: string;
        transactionHash: string;
        contractName?: string;
        artifactPath?: string;
        abi: any;
      };
      try {
        const stdout = add.stdout.trim();
        // Find the last complete JSON object in the output
        const jsonMatch = stdout.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('Could not find JSON in deployment output.');
        }
        parsed = JSON.parse(jsonMatch[0]);
      } catch (err) {
        console.error('❌ Could not parse deployment output. stdout content was:', add.stdout);
        throw new Error(
          `Invalid deployment result format or JSON not found: ${err instanceof Error ? err.message : String(err)}`,
        );
      }

      const { contractAddress, transactionHash, abi } = parsed; // Extract ABI from parsed result

      // 6️⃣ Persist to database
      await this.deployedContractService.create({
        address: contractAddress,
        name: contractName,
        type: options.config?.contractType ?? 'Custom',
        description: options.description,
        tags: options.tags ?? [],
        abi: abi, // Use the ABI from deployment if available, fallback to options.abi
        networkId,
        transactionHash,
      });

      console.log('✅ Deployment saved to database:', contractAddress);

      return { contractAddress, abi };
    } catch (err: any) {
      console.error('🛑 Deployment error:', err);
      throw new Error(`Failed to deploy contract: ${err.message}`);
    } finally {
      // Cleanup file inside container workspace
      try {
        await this.ssh.execCommand(`rm ${destPath}`);
        console.log('🧼 Cleaned up deployed contract file');
      } catch {
        console.warn('⚠️ Could not remove contract file');
      }
      await this.disconnectFromServer();
    }
  }

  async addExternalContractUsingABI(
    networkId: string,
    address: string,
    contractName: string,
    options: {
      abi: any;
      description?: string;
      tags?: string[];
      config?: ContractConfig;
    },
  ): Promise<{ contractAddress: string; abi: any }> {
    console.log(`🚀 Starting contract adding using ABI: ${contractName} on network: ${networkId}`);

    try {
      await this.connectToServer(networkId);

      // 1️⃣ Create temporary ABI file
      const tempAbiPath = `/tmp/${contractName}_abi.json`;
      const safeAbiContent = JSON.stringify(options.abi).replace(/'/g, "'\\''");
      await this.ssh.execCommand(`echo '${safeAbiContent}' > ${tempAbiPath}`);

      // 2️⃣ Add contract using ABI
      const add = await this.ssh.execCommand(
        `docker exec ${this.CONTAINER_NAME} CONTRACT_ADDRESS=${address} CONTRACT_NAME=${contractName} ABI_FILE=${tempAbiPath} NETWORK_DEPLOYED=localhost npx hardhat run scripts/addUsingABI.ts --network localhost`,
      );
      if (add.stderr) throw new Error(`Adding contract failed: ${add.stderr}`);
      console.log('✅ Raw add output:\n', add.stdout);

      // 3️⃣ Parse JSON result
      let parsed: {
        contractAddress: string;
        transactionHash: string;
        contractName?: string;
        artifactPath?: string;
        abi: any;
      };
      try {
        const stdout = add.stdout.trim();
        // Find the last complete JSON object in the output
        const jsonMatch = stdout.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('Could not find JSON in add output.');
        }
        parsed = JSON.parse(jsonMatch[0]);
      } catch (err) {
        console.error('❌ Could not parse add output. stdout content was:', add.stdout);
        throw new Error(
          `Invalid add result format or JSON not found: ${err instanceof Error ? err.message : String(err)}`,
        );
      }

      const { contractAddress, transactionHash, abi } = parsed;

      // 4️⃣ Persist to database
      await this.deployedContractService.create({
        address: contractAddress,
        name: contractName,
        type: options.config?.contractType ?? 'Custom',
        description: options.description,
        tags: options.tags ?? [],
        abi: abi,
        networkId,
        transactionHash,
      });

      console.log('✅ Contract added to database:', contractAddress);

      return { contractAddress, abi };
    } catch (err: any) {
      console.error('🛑 Add contract error:', err);
      throw new Error(`Failed to add contract: ${err.message}`);
    } finally {
      // Cleanup temporary ABI file
      try {
        await this.ssh.execCommand(`rm /tmp/${contractName}_abi.json`);
        console.log('🧼 Cleaned up temporary ABI file');
      } catch {
        console.warn('⚠️ Could not remove temporary ABI file');
      }
      await this.disconnectFromServer();
    }
  }

  /* async verifyContract(networkId: string, address: string, contractName: string): Promise<string> {
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
  } */
}

// deployedContract services

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
    transactionHash: string;
  }) {
    return this.prisma.deployedContract.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.deployedContract.findMany({
      include: {
        network: true,
        favorites: true,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.deployedContract.findUnique({
      where: { id },
      include: {
        network: true,
        interactions: true,
        favorites: true,
      },
    });
  }

  async toggleFavorite(contractId: string): Promise<{ isFavorite: boolean }> {
    const contract = await this.prisma.deployedContract.findUnique({
      where: { id: contractId },
      include: { favorites: true },
    });

    if (!contract) {
      throw new Error('Contract not found');
    }

    if (contract.favorites.length > 0) {
      // Remove favorite
      const favorite = contract.favorites[0]!;
      await this.prisma.favoriteContract.delete({
        where: { id: favorite.id },
      });
      return { isFavorite: false };
    } else {
      // Add favorite
      await this.prisma.favoriteContract.create({
        data: {
          contractId,
        },
      });
      return { isFavorite: true };
    }
  }
}

// draftContract services
export class DraftContractService {
  prisma: PrismaClient;

  constructor(options: AbstractServiceOptions) {
    this.prisma = options.prisma;
  }

  async create(data: {
    name: string;
    type?: string;
    content: string;
    description?: string;
    tags: string[];
    networkId?: string;
    config: ContractConfig;
  }) {
    return this.prisma.draftContract.create({
      data: {
        ...data,
        type: data.config.contractType,
        config: JSON.parse(JSON.stringify(data.config)),
      },
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

  async update(id: string, data: Partial<DraftContract & { config?: ContractConfig }>) {
    const updateData: any = { ...data };
    if (data.config && data.config.contractType) {
      updateData.type = data.config.contractType;
    }
    return this.prisma.draftContract.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string) {
    return this.prisma.draftContract.delete({
      where: { id },
    });
  }
}
