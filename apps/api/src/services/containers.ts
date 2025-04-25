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
import { Status } from '../constants.js';
import { NodeService } from '../services/nodes.js';
import { CreateNodePayload, NodePayload, StartNodePayload } from '../types/node.js';
import { AbstractServiceOptions } from '../types/services.js';
import { ServerService } from './server.js';

const execAsync = promisify(exec);

interface RemoteLogResult {
  stream: ClientChannel; // Adjust this if you have a more precise type
  ssh: NodeSSH;
}

export class ContainerService {
  prisma: PrismaClient;
  nodeService: NodeService;
  serverService: ServerService;

  constructor(options: AbstractServiceOptions) {
    this.prisma = options.prisma;
    this.nodeService = new NodeService({ prisma: this.prisma });
    this.serverService = new ServerService({ prisma: this.prisma });
  }

  /**
   * 1. Set up the network by running bash scripts.
   */
  async SetUpNetwork(nodesNumber: number, networId: string, chainId: number) {
    // Grab NETWORK_BIN_DIR from config
    const { networkBinDir } = config;

    // Define scripts and parameters
    const scripts = [
      { script: 'create_structure.sh', params: `${nodesNumber} ${networId}` },
      { script: 'create_config_file.sh', params: '' },
      { script: 'generate_keys_genesis.sh', params: '' },
      { script: 'distribute_keys.sh', params: '' },
      { script: 'generate_keys_tessera.sh', params: '' },
      { script: 'distribute_tessera_config.sh', params: '' },
    ];

    const results: Array<{ script: string; success: boolean; output?: string; error?: string }> =
      [];

    for (const { script, params } of scripts) {
      try {
        // Export NUM_NODES and NET_ID as environment variables for the script
        const command = `NUM_NODES=${nodesNumber} NET_ID=${networId} CHAIN_ID=${chainId} ${networkBinDir}/${script} ${params}`;
        console.log(`Executing: ${command}`);

        const { stdout } = await execAsync(command, { shell: '/bin/bash' });
        console.log(`Output for ${script}:`, stdout);

        results.push({ script, success: true, output: stdout });
      } catch (error: any) {
        console.error(`Error executing ${script}:`, error);
        results.push({
          script,
          success: false,
          error: `Unexpected error: ${error.message}\nFull error: ${error}`,
        });
      }
    }

    return results;
  }

  /**
   * 2. Generate Docker Compose files for bootnode or other nodes.
   */
  async generateDockerComposeFile(
    bootnode: boolean,
    networkId: string,
    enodeUrl?: string,
    nodeCount?: number,
  ): Promise<NodePayload[]> {
    if (bootnode) {
      return this._generateBootnodeDockerComposeFile(networkId);
    } else {
      if (!nodeCount) {
        throw new Error('nodeCount is required when bootnode is false');
      }
      return this._generateStandardDockerComposeFiles(networkId, enodeUrl, nodeCount);
    }
  }

  async killBesuNode() {
    try {
      const { baseDir } = config;
      await execAsync(`rm -rf ${baseDir}`);
    } catch (error) {
      console.error('Error in killBesuNode:', error);
      throw error;
    }
  }

  /**
   * 3. Run multiple node containers.
   */
  async runNode(payload: StartNodePayload) {
    const { sshKeyDir, remoteBaseDir, subnet } = config;
    const ssh = new NodeSSH();

    // Fetch the VM details from the database.
    const vm = await this.serverService.getSSHConnection(payload.vmId);
    if (!vm) {
      return { success: false, message: [], errors: [`VM with ID ${payload.vmId} not found.`] };
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
        `docker network create --subnet=${subnet} ${payload.networkId}`,
        { execOptions: { pty: true } },
      );

      if (createNetwork.stderr) {
        throw new Error(`Failed to create network: ${createNetwork.stderr}`);
      }

      console.log('Network created successfully:', createNetwork.stdout);

      const outputs: string[] = [];
      const errors: string[] = [];

      if (!payload.nodeCount) {
        throw new Error('nodeCount is required');
      }

      for (let i = 1; i <= payload.nodeCount; i++) {
        const nodeDir = `${remoteBaseDir}/${payload.networkId}/Node-${i}`;
        console.log(`Node directory for Node-${i}:`, nodeDir);

        const node = await this.prisma.node.findFirst({
          where: {
            networkId: payload.networkId,
            name: `Node-${i}`,
          },
          select: {
            id: true,
          },
        });

        // Start Node
        let result = await ssh.execCommand(`cd ${nodeDir} && docker-compose up -d`, {
          execOptions: { pty: true },
        });

        if (result.stderr) {
          console.error(`Error starting Node-${i}:`, result.stderr);
          errors.push(`Node-${i} failed to start: ${result.stderr}`);
        } else {
          console.log(`docker-compose output for Node-${i}:`, result.stdout);
          if (node) {
            await this.nodeService.updateNodeStatus(node.id, Status.ACTIVE);
          }
          outputs.push(`Node-${i} started successfully.`);
        }
      }

      // Start Hardhat
      const hardhatDir = `${remoteBaseDir}/${payload.networkId}/hardhat`;
      console.log(`Node directory for Hardhat`, hardhatDir);

      let hardhatResult = await ssh.execCommand(`cd ${hardhatDir} && docker-compose up -d`, {
        execOptions: { pty: true },
      });

      if (hardhatResult.stderr) {
        console.error('Error starting Hardhat:', hardhatResult.stderr);
        errors.push(`Hardhat failed to start: ${hardhatResult.stderr}`);
      } else {
        console.log('Hardhat started successfully:', hardhatResult.stdout);
        outputs.push('Hardhat started successfully.');
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

  getLogs(container: string): ChildProcessWithoutNullStreams {
    const command = 'docker';
    const args = ['logs', '-f', `${container}`];
    console.log('Command to execute:', command, args.join(' '));

    const child = spawn(command, args, { shell: true });

    child.stdout.on('data', (data) => {
      console.log(`stdout [${container}]: ${data}`);
    });

    child.stderr.on('data', (data) => {
      console.error(`stderr [${container}]: ${data}`);
    });

    child.on('close', (code) => {
      console.log(`Child process for ${container} exited with code ${code}`);
    });

    return child;
  }

  async getRemoteLogs(container: string, vmId: string): Promise<RemoteLogResult> {
    // Retrieve VM details from your service/database.
    const vm = await this.serverService.getSSHConnection(vmId);
    if (!vm) {
      throw new Error(`VM with ID ${vmId} not found.`);
    }

    // Read the SSH private key.
    const sshKeyPath = path.join(config.sshKeyDir, vm.sshKeyName);
    const privateKeyContent = await fs.readFile(sshKeyPath, 'utf8');

    // Establish an SSH connection.
    const ssh = new NodeSSH();
    console.log(`Connecting to VM ${vm.publicIpAddress} as ${vm.adminUsername}...`);
    await ssh.connect({
      host: vm.publicIpAddress,
      username: vm.adminUsername,
      privateKey: privateKeyContent,
    });

    // Execute the docker logs command remotely.
    // Note: We use the underlying SSH2 connection to get a stream.
    return new Promise((resolve, reject) => {
      ssh.connection!.exec(`docker logs -f ${container}`, (err, stream) => {
        if (err) {
          ssh.dispose();
          return reject(err);
        }
        resolve({ stream, ssh });
      });
    });
  }

  /**
   * 4. Construct the enode URL from the public key file.
   */
  async createEnodeUrl(networkId: string, nodeIndex: number) {
    try {
      const { baseDir, bootnodeP2pPort, bootnodeIp } = config;

      // Read the key.pub file
      const keyFilePath = path.join(baseDir, networkId, `Node-${nodeIndex}`, 'data', 'key.pub');
      const keyData = await fs.readFile(keyFilePath, 'utf8');
      const publicKey = keyData.trim();

      // Validate the public key format
      if (!publicKey.startsWith('0x') || publicKey.length <= 2) {
        throw new Error(`Invalid key format in file: ${keyFilePath}`);
      }

      // Remove the "0x" prefix
      const keyWithoutPrefix = publicKey.slice(2);

      // Form the enode URL
      const enodeUrl = `enode://${keyWithoutPrefix}@${bootnodeIp}:${bootnodeP2pPort}`;
      console.log('Generated enode URL:', enodeUrl);

      return enodeUrl;
    } catch (error) {
      console.error('Error in createEnodeUrl:', error);
      throw error;
    }
  }

  /**
   * Private helper: generate Docker Compose for the bootnode.
   */
  private async _generateBootnodeDockerComposeFile(networkId: string): Promise<NodePayload[]> {
    const { networkBinDir } = config;
    const {
      bootnodeIndex,
      bootnodeP2pPort,
      bootnodeP2pHost,
      bootnodeRpcHttpPort,
      bootnodeHttpHost,
      bootnodeRpcWsPort,
      bootnodeWsHost,
      bootnodeIp,
      tesseraBootnodeIp,
      tesseraP2PPort,
      tesseraQ2TPort,
      tesseraThirdPartyPort,
      tesseraHelthPort,
    } = config;

    const command = [
      `NET_ID=${networkId}`,
      `NODE_INDEX=${bootnodeIndex}`,
      `P2P_PORT=${bootnodeP2pPort}`,
      `P2P_HOST=${bootnodeP2pHost}`,
      `RPC_HTTP_PORT=${bootnodeRpcHttpPort}`,
      `HTTP_HOST=${bootnodeHttpHost}`,
      `RPC_WS_PORT=${bootnodeRpcWsPort}`,
      `WS_HOST=${bootnodeWsHost}`,
      `NODE_IP=${bootnodeIp}`,
      `TESSERA_IP=${tesseraBootnodeIp}`,
      `TESS_P2P=${tesseraP2PPort}`,
      `TESS_Q2T_PORT=${tesseraQ2TPort}`,
      `TESS_THIRD_PARTY_PORT=${tesseraThirdPartyPort}`,
      `TESS_HEALTH_PORT=${tesseraHelthPort}`,
      `${networkBinDir}/generate_docker_compose_bootnode.sh`,
    ].join(' ');

    console.log('Command to execute (bootnode):', command);
    const { stdout } = await execAsync(command, { shell: '/bin/bash' });
    console.log('Output for generate_docker_compose_bootnode.sh:', stdout);

    const enodeUrl = await this.createEnodeUrl(networkId, bootnodeIndex);

    //save the node in the database
    await this.nodeService.saveNodes({
      networkId,
      name: `Node-${bootnodeIndex}`,
      container: `${networkId}-${bootnodeIndex}`,
      p2pPort: bootnodeP2pPort,
      rpcHttpPort: bootnodeRpcHttpPort,
      rpcWsPort: bootnodeRpcWsPort,
      p2pHost: bootnodeP2pHost,
      rpcHttpHost: bootnodeHttpHost,
      rpcWsHost: bootnodeWsHost,
      wsHost: bootnodeWsHost,
      nodeIp: bootnodeIp,
      isBootnode: true,
      enodeUrl: enodeUrl,
    });

    // Construct the single bootnode payload
    const bootnodePayload: NodePayload = {
      networkId,
      name: `Node-${bootnodeIndex}`,
      container: `${networkId}-${bootnodeIndex}`,
      p2pPort: bootnodeP2pPort,
      rpcHttpPort: bootnodeRpcHttpPort,
      rpcWsPort: bootnodeRpcWsPort,
      p2pHost: bootnodeP2pHost,
      rpcHttpHost: bootnodeHttpHost,
      rpcWsHost: bootnodeWsHost,
      wsHost: bootnodeWsHost,
      nodeIp: bootnodeIp,
      isBootnode: true,
      bootEnodeUrl: undefined,
    };

    // Return as an array for consistency
    return [bootnodePayload];
  }

  /**
   * Private helper: generate Docker Compose for standard (non-boot) nodes.
   */
  private async _generateStandardDockerComposeFiles(
    networkId: string,
    bootEnodeUrl: string | undefined,
    nodeCount: number,
  ): Promise<NodePayload[]> {
    const { networkBinDir } = config;
    const {
      nodeP2pPort,
      nodeP2pHost,
      nodeRpcHttpPort,
      nodeHttpHost,
      nodeRpcWsPort,
      nodeWsHost,
      baseNodeIpPrefix,
      startIpSuffix,
      tesseraStartIpSuffix,
      tesseraP2PPort,
      tesseraQ2TPort,
      tesseraThirdPartyPort,
      tesseraHelthPort,
    } = config;

    const nodePayloads: NodePayload[] = [];

    // Generate docker-compose for nodes from 2..nodeCount
    for (let i = 2; i <= nodeCount; i++) {
      const currentIp = `${baseNodeIpPrefix}${startIpSuffix + (i - 1)}`;
      const tesseraCurrentIp = `${baseNodeIpPrefix}${tesseraStartIpSuffix + (i - 1)}`;
      const currentP2PPort = nodeP2pPort + (i - 1);
      const currentWsPort = nodeRpcWsPort + (i - 1) * 2;
      const currentHttpPort = nodeRpcHttpPort + (i - 1) * 2;
      const currentTessP2PPort = tesseraP2PPort + (i - 1) * 100;
      const currentTessQ2TPort = tesseraQ2TPort + (i - 1) * 100;
      const currentTessThirdPartyPort = tesseraThirdPartyPort + (i - 1) * 100;
      const currentTessHealthPort = tesseraHelthPort + (i - 1) * 100;

      const command = [
        `NET_ID=${networkId}`,
        `NODE_INDEX=${i}`,
        `P2P_PORT=${currentP2PPort}`,
        `P2P_HOST=${nodeP2pHost}`,
        `RPC_HTTP_PORT=${currentHttpPort}`,
        `HTTP_HOST=${nodeHttpHost}`,
        `RPC_WS_PORT=${currentWsPort}`,
        `WS_HOST=${nodeWsHost}`,
        `NODE_IP=${currentIp}`,
        `ENODE_URL=${bootEnodeUrl || ''}`,
        `TESS_P2P=${currentTessP2PPort}`,
        `TESS_Q2T_PORT=${currentTessQ2TPort}`,
        `TESS_THIRD_PARTY_PORT=${currentTessThirdPartyPort}`,
        `TESS_HEALTH_PORT=${currentTessHealthPort}`,
        `TESSERA_IP=${tesseraCurrentIp}`,
        `${networkBinDir}/generate_docker_compose_node.sh`,
      ].join(' ');

      console.log(`Command to execute (node index = ${i}):`, command);

      const { stdout } = await execAsync(command, { shell: '/bin/bash' });
      console.log(`Output for generate_docker_compose_node.sh (NODE_INDEX=${i}):`, stdout);

      const enodeUrl = await this.createEnodeUrl(networkId, i);

      //save the node in the database
      await this.nodeService.saveNodes({
        networkId,
        name: `Node-${i}`,
        container: `${networkId}-${i}`,
        p2pPort: currentP2PPort,
        rpcHttpPort: currentHttpPort,
        rpcWsPort: currentWsPort,
        p2pHost: nodeP2pHost,
        rpcHttpHost: nodeHttpHost,
        rpcWsHost: nodeWsHost,
        wsHost: nodeWsHost,
        nodeIp: currentIp,
        isBootnode: false,
        enodeUrl: enodeUrl,
      });

      // Build the node payload object
      const nodePayload: NodePayload = {
        networkId,
        name: `Node-${i}`,
        container: `${networkId}-${i}`,
        p2pPort: currentP2PPort,
        rpcHttpPort: currentHttpPort,
        rpcWsPort: currentWsPort,
        p2pHost: nodeP2pHost,
        rpcHttpHost: nodeHttpHost,
        rpcWsHost: nodeWsHost,
        wsHost: nodeWsHost,
        nodeIp: currentIp,
        isBootnode: false,
        bootEnodeUrl: bootEnodeUrl || '',
      };

      nodePayloads.push(nodePayload);
    }

    return nodePayloads;
  }
}
