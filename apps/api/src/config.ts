// config.ts
import { HardhatService } from './services/hardhat.js';

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
   * Polling
   */
  pollingInterval: requiredIntVar('POLL_INTERVAL'),

  /**
   * Directories and Files
   */
  baseDir: requiredVar('BASE_DIR'),
  qbftTemplateFile: requiredVar('QBFT_TEMPLATE_FILE'),
  bootnodeTemplateFile: requiredVar('BOOTNODE_TEMPLATE_FILE'),
  nodeTemplateFile: requiredVar('NODE_TEMPLATE_FILE'),
  blockScoutTemplateFile: requiredVar('BLOCKSCOUT_TEMPLATE_FILE'),
  hardhatTemplateFile: requiredVar('HARDHAT_TEMPLATE_FILE'),
  networkBinDir: requiredVar('NETWORK_BIN_DIR'),
  sshKeyDir: requiredVar('SSH_KEY_DIR'),
  templateDir: requiredVar('TEMPLATE_DIR'),

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

  /**
   * Deployement Configuration
   */
  proxmoxHost: requiredVar('PROXMOX_HOST'),
  proxmoxUser: requiredVar('PROXMOX_USER'),
  proxmoxPassword: requiredVar('PROXMOX_PASSWORD'),
  proxmoxNode: requiredVar('PROXMOX_NODE'),
  proxmoxTemplateId: requiredIntVar('PROXMOX_TEMPLATE_ID'),
  remoteBaseDir: requiredVar('REMOTE_BASE_DIR'),

  /**
   * tesseract Configuration
   */
  tesseraBootnodeIp: requiredVar('TESSERA_BOOTNODE_IP'),
  tesseraThirdPartyPort: requiredIntVar('TESS_THIRD_PARTY_PORT'),
  tesseraQ2TPort: requiredIntVar('TESS_Q2T_PORT'),
  tesseraP2PPort: requiredIntVar('TESS_P2P_PORT'),
  tesseraHelthPort: requiredIntVar('TESS_HEALTH_PORT'),
  tesseraStartIpSuffix: requiredIntVar('TESS_START_IP_SUFFIX'),

  /**
   * Hardhat Configuration
   */
  dockerUsername: requiredVar('DOCKER_USER'),
  hardhatContainerName: requiredVar('HARDHAT_CONTAINER_NAME'),

  /*
   * Redis Configuration
   */

  redisHost: requiredVar('REDIS_HOST'),
  redisPort: requiredIntVar('REDIS_PORT'),
  redisPassword: requiredVar('REDIS_PASSWORD'),
  redisFamily: requiredIntVar('REDIS_FAMILY'),

  /**
   * email Configuration
   */

  smtpHost: requiredVar('SMTP_HOST'),
  smtpUser: requiredVar('SMTP_USER'),
  smtpPass: requiredVar('SMTP_PASS'),
};
