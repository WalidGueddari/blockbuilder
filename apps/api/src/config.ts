// config.ts
import * as dotenv from 'dotenv';

// Load environment variables from .env into process.env
dotenv.config();

/**
 * Throws an error if the environment variable is missing.
 */
function requiredVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Same as `requiredVar`, but parses the variable as an integer.
 */
function requiredIntVar(name: string): number {
  const raw = requiredVar(name); // This will throw if missing
  const parsed = parseInt(raw, 10);
  if (isNaN(parsed)) {
    throw new Error(`Invalid integer environment variable: ${name} = "${raw}"`);
  }
  return parsed;
}

export const config = {
  /**
   * Application Settings
   */
  //nodeEnv: requiredVar('NODE_ENV'),
  serverPort: requiredIntVar('SERVER_PORT'),
  serverHost: requiredVar('SERVER_HOST'),

  /**
   * Database
   */
  databaseUrl: requiredVar('DATABASE_URL'),

  /**
   * Auth
   */
  accessTokenSecret: requiredVar('ACCESS_TOKEN_SECRET'),
  accessTokenTtl: requiredVar('ACCESS_TOKEN_TTL'),

  /**
   * Directories and Files
   */
  baseDir: requiredVar('BASE_DIR'),
  qbftTemplateFile: requiredVar('QBFT_TEMPLATE_FILE'),
  bootnodeTemplateFile: requiredVar('BOOTNODE_TEMPLATE_FILE'),
  nodeTemplateFile: requiredVar('NODE_TEMPLATE_FILE'),
  networkBinDir: requiredVar('NETWORK_BIN_DIR'),

  /**
   * Network / Subnet
   */
  subnet: requiredVar('SUBNET'),

  /**
   * Bootnode Configuration
   */
  bootnodeDir: requiredVar('BOOTNODE_DIR'),
  bootnodeContainerName: requiredVar('BOOTNODE_CONTAINER_NAME'),
  bootnodeIndex: requiredIntVar('BOOTNODE_INDEX'),
  bootnodeP2pPort: requiredIntVar('BOOTNODE_P2P_PORT'),
  bootnodeP2pHost: requiredVar('BOOTNODE_P2P_HOST'),
  bootnodeRpcHttpPort: requiredIntVar('BOOTNODE_RPC_HTTP_PORT'),
  bootnodeHttpHost: requiredVar('BOOTNODE_HTTP_HOST'),
  bootnodeRpcWsPort: requiredIntVar('BOOTNODE_RPC_WS_PORT'),
  bootnodeWsHost: requiredVar('BOOTNODE_WS_HOST'),
  bootnodeIp: requiredVar('BOOTNODE_IP'),

  /**
   * Node Configuration
   */
  nodeIndex: requiredIntVar('NODE_INDEX'),
  nodeP2pPort: requiredIntVar('NODE_P2P_PORT'),
  nodeP2pHost: requiredVar('NODE_P2P_HOST'),
  nodeRpcHttpPort: requiredIntVar('NODE_RPC_HTTP_PORT'),
  nodeHttpHost: requiredVar('NODE_HTTP_HOST'),
  nodeRpcWsPort: requiredIntVar('NODE_RPC_WS_PORT'),
  nodeWsHost: requiredVar('NODE_WS_HOST'),

  /**
   * Node IP Allocation
   */
  baseNodeIpPrefix: requiredVar('BASE_NODE_IP_PREFIX'),
  startIpSuffix: requiredIntVar('START_IP_SUFFIX'),
};
