// containerService.ts
import { PrismaClient } from '@saas-monorepo/database';
import { exec } from 'child_process';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { promisify } from 'util';

// 1. Import the centralized config
import { config } from '../config.js';
import { NodeService } from '../services/nodes.js';
import { CreateNodePayload, NodePayload } from '../types/node.js';
import { AbstractServiceOptions } from '../types/services.js';

const execAsync = promisify(exec);

export class ContainerService {
  prisma: PrismaClient;
  nodeService: NodeService;

  constructor(options: AbstractServiceOptions) {
    this.prisma = options.prisma;
    this.nodeService = new NodeService({ prisma: this.prisma });
  }

  /**
   * 1. Set up the network by running bash scripts.
   */
  async SetUpNetwork(nodesNumber: number, networId: string) {
    // Grab NETWORK_BIN_DIR from config
    const { networkBinDir } = config;

    // Define scripts and parameters
    const scripts = [
      { script: 'create_structure.sh', params: `${nodesNumber} ${networId}` },
      { script: 'create_config_file.sh', params: '' },
      { script: 'generate_keys_genesis.sh', params: '' },
      { script: 'distribute_keys.sh', params: '' },
    ];

    const results: Array<{ script: string; success: boolean; output?: string; error?: string }> =
      [];

    for (const { script, params } of scripts) {
      try {
        // Export NUM_NODES and NET_ID as environment variables for the script
        const command = `NUM_NODES=${nodesNumber} NET_ID=${networId} ${networkBinDir}/${script} ${params}`;
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

  /**
   * 3. Run multiple node containers.
   */
  async runNode(networId: string, nodeCount: number) {
    const { networkBinDir } = config;

    try {
      const outputs = [];
      for (let i = 1; i <= nodeCount; i++) {
        const command = `NET_ID=${networId} NODE_INDEX=${i} ${networkBinDir}/run_node.sh`;
        console.log('Command to execute:', command);
        try {
          const { stdout } = await execAsync(command, { shell: '/bin/bash' });
          console.log(`Output for runNode (NODE_INDEX=${i}):`, stdout);
          outputs.push(stdout);
        } catch (error) {
          console.error(`Error executing start_bootnode.sh (NODE_INDEX = ${i}):`, error);
          throw error;
        }
      }
      return outputs;
    } catch (error) {
      console.error('Error in runNode:', error);
      throw error;
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
      wsHost: bootnodeWsHost, // or your own logic
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
    } = config;

    const nodePayloads: NodePayload[] = [];

    // Generate docker-compose for nodes from 2..nodeCount
    for (let i = 2; i <= nodeCount; i++) {
      const currentIp = `${baseNodeIpPrefix}${startIpSuffix + (i - 1)}`;
      const currentP2PPort = nodeP2pPort + (i - 1);
      const currentWsPort = nodeRpcWsPort + (i - 1) * 2;
      const currentHttpPort = nodeRpcHttpPort + (i - 1) * 2;

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
