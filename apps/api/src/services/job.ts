import { PrismaClient } from '@saas-monorepo/database';

import { Status } from '../constants.js';
import { InitNetworkPayload } from '../types/network.js';
import { AbstractServiceOptions } from '../types/services.js';
import { BlockscoutService } from './blockscout.js';
import { ContainerService } from './containers.js';
import { HardhatService } from './hardhat.js';
import { NewtorkSevice } from './network.js';
import { ServerService } from './server.js';

export class JobSevice {
  prisma: PrismaClient;
  containerService: ContainerService;
  serverService: ServerService;
  blockscoutService: BlockscoutService;
  networkService: NewtorkSevice;
  hardhatService: HardhatService;

  constructor(options: AbstractServiceOptions) {
    this.prisma = options.prisma;
    this.containerService = new ContainerService(options);
    this.serverService = new ServerService(options);
    this.blockscoutService = new BlockscoutService(options);
    this.networkService = new NewtorkSevice(options);
    this.hardhatService = new HardhatService(options);
  }

  async initJob(userId: string, networkId: string) {
    try {
      const job = await this.prisma.job.create({
        data: {
          userId: userId,
          networkId: networkId,
          status: 'Initializing blockchain',
        },
      });
      console.log('Job created:', job.id);
      return job;
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  }

  async getJob(userId: string) {
    try {
      const job = await this.prisma.job.findFirstOrThrow({
        where: { userId },
        include: {
          Network: true,
        },
      });
      // console.log('Job found:', job);
      return job;
    } catch (error) {
      console.error(`Error getting job for ${userId} :`, error);
      throw error;
    }
  }

  public async runJob(
    payload: InitNetworkPayload,
    networkId: string,
    jobId: string,
  ): Promise<void> {
    setImmediate(async () => {
      try {
        // Step 1: Deploy blockchain VM
        console.info('Step 1: Deploying blockchain VM');
        await this._updateJobStatus(jobId, 'Deploying blockchain');
        const blockchainVm = await this.serverService.createAzureVMServer({
          resourceGroup: payload.name,
          userId: payload.userId,
          vmName: payload.name,
          sshKeyName: payload.name,
        });

        // Step 2: Associate VM with network
        console.info('Step 2: Associating VM with network');
        const network = await this.networkService.updateServerId(networkId, blockchainVm.id);

        // Step 3: Configure Docker & Nginx
        console.info('Step 3: Configuring Docker & Nginx');
        await this.serverService.setupDockerAndNginx(blockchainVm.id, false);

        // Step 4: Transfer network files
        console.info('Step 4: Transferring network files');
        await this.serverService.transferDirectoryByName(blockchainVm.id, network.id);

        // Step 5: Start the blockchain nodes
        console.info('Step 5: Starting the blockchain nodes');
        const startResult = await this.containerService.runNode({
          networkId: network.id,
          nodeCount: network.nodeCount,
          vmId: blockchainVm.id,
        });
        await this.hardhatService.startHardhat(networkId, blockchainVm.id);

        // Update network status based on start outcome
        console.info('Updating network status based on start outcome');
        await this.networkService.updateStatus(
          network.id,
          startResult.success ? Status.ACTIVE : Status.FAILED,
        );

        // Step 6: Prepare Blockscout
        console.info('Step 6: Preparing Blockscout');
        if (!blockchainVm.dnsName) {
          throw new Error('VM DNS name is missing');
        }
        await this._updateJobStatus(jobId, 'Setting up Blockscout');
        await this.blockscoutService._generateDockerComposeFile(
          network.chainId,
          blockchainVm.dnsName,
          network.id,
        );

        // Step 7: Deploy Blockscout VM
        console.info('Step 7: Deploying Blockscout VM');
        await this._updateJobStatus(jobId, 'Deploying Blockscout');
        const blockscoutVm = await this.serverService.createAzureVMServer({
          resourceGroup: `${payload.name}-blockscout`,
          userId: payload.userId,
          vmName: `${payload.name}-blockscout`,
          sshKeyName: `${payload.name}-blockscout`,
        });

        // Step 8: Associate Blockscout VM
        console.info('Step 8: Associating Blockscout VM');
        await this.networkService.updateBsServerId(networkId, blockscoutVm.id);

        // Step 9: Configure Blockscout server
        console.info('Step 9: Configuring Blockscout server');
        await this.serverService.setupDockerAndNginx(blockscoutVm.id, true);

        // Step 10: Transfer Blockscout files and start
        console.info('Step 10: Transferring Blockscout files and starting');
        await this.serverService.transferDirectoryByName(
          blockscoutVm.id,
          `blockscout-${network.id}`,
        );
        await this.blockscoutService.runBlockscout(network.id, blockscoutVm.id);

        // Cleanup stray Besu nodes
        console.info('Cleaning up stray Besu nodes');
        await this.containerService.killBesuNode();

        // Final: mark job complete
        console.info('Final: marking job as complete');
        await this._updateJobStatus(jobId, 'Blockchain ready');
      } catch (error: any) {
        console.error('Deployment job failed:', error);
        await this._updateJobStatus(jobId, 'error', error.message);
        throw error;
      }
    });
  }

  private async _updateJobStatus(
    jobId: string,
    status: string,
    errorMessage?: string,
  ): Promise<void> {
    await this.prisma.job.update({
      where: { id: jobId },
      data: {
        status,
        ...(errorMessage && { errorMessage }),
      },
    });
  }
}
