import { PrismaClient } from '@saas-monorepo/database';
import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { promisify } from 'util';

import { AbstractServiceOptions } from '../types/services.js';

const execAsync = promisify(exec);

export class NodesService {
  prisma: PrismaClient;

  constructor(options: AbstractServiceOptions) {
    this.prisma = options.prisma;
  }

  async SetUpNetwork(nodesNumber: number, networId: string) {
    const NETWORK_BIN_DIR = process.env.NETWORK_BIN_DIR;
    if (!NETWORK_BIN_DIR) {
      throw new Error('NETWORK_BIN_DIR is not defined');
    }

    // Define your scripts and parameters
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
        // Export NUM_NODES as an environment variable and run the script
        const command = `NUM_NODES=${nodesNumber} NET_ID=${networId} ${NETWORK_BIN_DIR}/${script} ${params}`;
        console.log(`Executing: ${command}`);

        const { stdout } = await execAsync(command, {
          shell: '/bin/bash',
        });

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

  async generateDockerComposeFile(
    bootnode: boolean,
    networId: string,
    enodeUrl?: string,
    nodeCount?: number,
  ) {
    try {
      const NETWORK_BIN_DIR = process.env.NETWORK_BIN_DIR;
      if (!NETWORK_BIN_DIR) {
        throw new Error('NETWORK_BIN_DIR is not defined');
      }

      const BOOTNODE_ENV = {
        BASE_DIR: process.env.BASE_DIR,
        BOOTNODE_DIR: process.env.BOOTNODE_DIR,
        BOOTNODE_CONTAINER_NAME: process.env.BOOTNODE_CONTAINER_NAME,
        BOOTNODE_INDEX: process.env.BOOTNODE_INDEX,
        BOOTNODE_P2P_PORT: process.env.BOOTNODE_P2P_PORT,
        BOOTNODE_P2P_HOST: process.env.BOOTNODE_P2P_HOST,
        BOOTNODE_RPC_HTTP_PORT: process.env.BOOTNODE_RPC_HTTP_PORT,
        BOOTNODE_HTTP_HOST: process.env.BOOTNODE_HTTP_HOST,
        BOOTNODE_RPC_WS_PORT: process.env.BOOTNODE_RPC_WS_PORT,
        BOOTNODE_WS_HOST: process.env.BOOTNODE_WS_HOST,
        BOOTNODE_IP: process.env.BOOTNODE_IP,
      };

      const NODE_ENV = {
        NODE_INDEX: process.env.NODE_INDEX,
        NODE_P2P_PORT: process.env.NODE_P2P_PORT,
        NODE_P2P_HOST: process.env.NODE_P2P_HOST,
        NODE_RPC_HTTP_PORT: process.env.NODE_RPC_HTTP_PORT,
        NODE_HTTP_HOST: process.env.NODE_HTTP_HOST,
        NODE_RPC_WS_PORT: process.env.NODE_RPC_WS_PORT,
        NODE_WS_HOST: process.env.NODE_WS_HOST,
        BASE_NODE_IP_PREFIX: process.env.BASE_NODE_IP_PREFIX,
        START_IP_SUFFIX: process.env.START_IP_SUFFIX,
      };

      // Check if all BOOTNODE_ENV variables are defined
      for (const [key, value] of Object.entries(BOOTNODE_ENV)) {
        if (!value) {
          throw new Error(`Environment variable ${key} is not defined`);
        }
      }

      // Check if all NODE_ENV variables are defined
      for (const [key, value] of Object.entries(NODE_ENV)) {
        if (!value) {
          throw new Error(`Environment variable ${key} is not defined`);
        }
      }

      if (bootnode) {
        const command = `NET_ID=${networId} NODE_INDEX=${BOOTNODE_ENV.BOOTNODE_INDEX} P2P_PORT=${BOOTNODE_ENV.BOOTNODE_P2P_PORT} P2P_HOST=${BOOTNODE_ENV.BOOTNODE_P2P_HOST} RPC_HTTP_PORT=${BOOTNODE_ENV.BOOTNODE_RPC_HTTP_PORT} HTTP_HOST=${BOOTNODE_ENV.BOOTNODE_HTTP_HOST} RPC_WS_PORT=${BOOTNODE_ENV.BOOTNODE_RPC_WS_PORT} WS_HOST=${BOOTNODE_ENV.BOOTNODE_WS_HOST} NODE_IP=${BOOTNODE_ENV.BOOTNODE_IP} ${NETWORK_BIN_DIR}/generate_docker_compose_bootnode.sh`;
        console.log('Command to execute:', command);

        try {
          const { stdout } = await execAsync(command, {
            shell: '/bin/bash',
          });
          console.log('Output for generate_docker_compose_bootnode.sh:', stdout);
          return stdout;
        } catch (error) {
          console.error('Error executing generate_docker_compose_bootnode.sh:', error);
          throw error;
        }
      } else {
        if (!nodeCount) {
          throw new Error('nodeCount is required when bootnode is false');
        }
        const outputs = [];
        for (let i = 2; i <= nodeCount; i++) {
          const currentIp = `${NODE_ENV.BASE_NODE_IP_PREFIX}${Number(NODE_ENV.START_IP_SUFFIX) + (i - 1)}`;
          const currentP2PPort = Number(NODE_ENV.NODE_P2P_PORT ?? 30304) + (i - 1);
          const currentWsPort = Number(NODE_ENV.NODE_RPC_WS_PORT ?? 8547) + (i - 1) * 2;
          const currentHttpPort = Number(NODE_ENV.NODE_RPC_HTTP_PORT ?? 8548) + (i - 1) * 2;

          const command = `NET_ID=${networId} NODE_INDEX=${i} P2P_PORT=${currentP2PPort} P2P_HOST=${NODE_ENV.NODE_P2P_HOST} RPC_HTTP_PORT=${currentHttpPort} HTTP_HOST=${NODE_ENV.NODE_HTTP_HOST} RPC_WS_PORT=${currentWsPort} WS_HOST=${NODE_ENV.NODE_WS_HOST} NODE_IP=${currentIp} ENODE_URL=${enodeUrl} ${NETWORK_BIN_DIR}/generate_docker_compose_node.sh`;
          try {
            const { stdout } = await execAsync(command, { shell: '/bin/bash' });
            console.log('Output for generate_docker_compose_node.sh:', stdout);
            outputs.push(stdout);
          } catch (error) {
            console.error(
              `Error executing generate_docker_compose_node.sh (NODE_INDEX = ${i}):`,
              error,
            );
            throw error;
          }
        }
        return outputs;
      }
    } catch (error) {
      console.error('Error in GenerateDockerComposeFile:', error);
      throw error;
    }
  }

  async runBootNode(networId: string, nodeCount?: number) {
    const NETWORK_BIN_DIR = process.env.NETWORK_BIN_DIR;
    if (!NETWORK_BIN_DIR) {
      throw new Error('NETWORK_BIN_DIR is not defined');
    }

    const BOOTNODE_ENV = {
      BOOTNODE_INDEX: process.env.BOOTNODE_INDEX,
      BOOTNODE_P2P_PORT: process.env.BOOTNODE_P2P_PORT,
      BOOTNODE_IP: process.env.BOOTNODE_IP,
    };

    // Check if all BOOTNODE_ENV variables are defined
    for (const [key, value] of Object.entries(BOOTNODE_ENV)) {
      if (!value) {
        throw new Error(`Environment variable ${key} is not defined`);
      }
    }

    const command = `NET_ID=${networId} NODE_INDEX=${BOOTNODE_ENV.BOOTNODE_INDEX} ${NETWORK_BIN_DIR}/start_bootnode.sh`;
    console.log('Command to execute:', command);

    try {
      const { stdout } = await execAsync(command, {
        shell: '/bin/bash',
      });
      console.log('Output for run_network.sh:', stdout);
      return stdout;
    } catch (error) {
      console.error('Error executing run_network.sh:', error);
      throw error;
    }
  }

  async runNode(networId: string, nodeCount: number) {
    const NETWORK_BIN_DIR = process.env.NETWORK_BIN_DIR;
    if (!NETWORK_BIN_DIR) {
      throw new Error('NETWORK_BIN_DIR is not defined');
    }

    try {
      const outputs = [];
      for (let i = 1; i <= nodeCount; i++) {
        const command = `NET_ID=${networId} NODE_INDEX=${i} ${NETWORK_BIN_DIR}/start_bootnode.sh`;
        try {
          const { stdout } = await execAsync(command, { shell: '/bin/bash' });
          console.log('Output for generate_docker_compose_node.sh:', stdout);
          outputs.push(stdout);
        } catch (error) {
          console.error(
            `Error executing generate_docker_compose_node.sh (NODE_INDEX = ${i}):`,
            error,
          );
          throw error;
        }
      }
      return outputs;
    } catch (error) {
      console.error('Error in runNode:', error);
      throw error;
    }
  }

  async createEnodeUrl(networkId: string) {
    try {
      const BASE_DIR = process.env.BASE_DIR;
      if (!BASE_DIR) {
        throw new Error('BASE_DIR is not defined');
      }
      const BOOTNODE_INDEX = process.env.BOOTNODE_INDEX;
      if (!BOOTNODE_INDEX) {
        throw new Error('NODE_INDEX is not defined');
      }

      const BOOTNODE_P2P_PORT = process.env.BOOTNODE_P2P_PORT;
      if (!BOOTNODE_P2P_PORT) {
        throw new Error('BOOTNODE_P2P_PORT is not defined');
      }

      const BOOTNODE_IP = process.env.BOOTNODE_IP;
      if (!BOOTNODE_IP) {
        throw new Error('BOOTNODE_IP is not defined');
      }

      // Read the key.pub file
      const keyFilePath = `${BASE_DIR}/${networkId}/Node-${BOOTNODE_INDEX}/data/key.pub`;
      const keyData = await fs.readFile(keyFilePath, 'utf8');
      const publicKey = keyData.trim();

      // Validate the public key format
      if (!publicKey.startsWith('0x') || publicKey.length <= 2) {
        throw new Error('Invalid key format in file');
      }

      // Remove the "0x" prefix
      const keyWithoutPrefix = publicKey.slice(2);

      // Form the enode URL
      const enodeUrl = `enode://${keyWithoutPrefix}@${BOOTNODE_IP}:${BOOTNODE_P2P_PORT}`;
      console.log('Generated enode URL:', enodeUrl);

      return enodeUrl;
    } catch (error) {
      console.error('Error in createEnodeUrl:', error);
      throw error;
    }
  }
}
