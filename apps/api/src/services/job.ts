import { PrismaClient } from '@saas-monorepo/database';
import path from 'path';

import { config } from '../config.js';
import { Status } from '../constants.js';
import { InitNetworkPayload } from '../types/network.js';
import { CreateAzureVMParams } from '../types/server.js';
import { AbstractServiceOptions } from '../types/services.js';
import { BlockscoutService } from './blockscout.js';
import { ContainerService } from './containers.js';
import { NewtorkSevice } from './network.js';
import { ServerService } from './server.js';

export class JobSevice {
  prisma: PrismaClient;
  containerService: ContainerService;
  serverService: ServerService;
  blockscoutService: BlockscoutService;
  networkService: NewtorkSevice;

  constructor(options: AbstractServiceOptions) {
    this.prisma = options.prisma;
    this.containerService = new ContainerService(options);
    this.serverService = new ServerService(options);
    this.blockscoutService = new BlockscoutService(options);
    this.networkService = new NewtorkSevice(options);
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
      // console.log('Job created:', job.id);
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
      console.log('Job found:', job);
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
        await this._updateJobStatus(jobId, 'Deploying blockchain');
        const blockchainVm = await this.serverService.createAzureVMServer({
          resourceGroup: payload.name,
          userId: payload.userId,
          vmName: payload.name,
          sshKeyName: payload.name,
        });

        // Step 2: Associate VM with network
        // await this._updateJobStatus(jobId, 'Updating network with VM');
        const network = await this.networkService.updateServerId(networkId, blockchainVm.id);

        // Step 3: Configure Docker & Nginx
        // await this._updateJobStatus(jobId, 'Setting up blockchain server');
        await this.serverService.setupDockerAndNginx(blockchainVm.id, false);

        // Step 4: Transfer network files
        // await this._updateJobStatus(jobId, 'Transferring network directory');
        await this.serverService.transferDirectoryByName(blockchainVm.id, network.id);

        // Step 5: Start the blockchain nodes
        // await this._updateJobStatus(jobId, 'Starting network');
        const startResult = await this.containerService.runNode({
          networkId: network.id,
          nodeCount: network.nodeCount,
          vmId: blockchainVm.id,
        });

        // Update network status based on start outcome
        await this.networkService.updateStatus(
          network.id,
          startResult.success ? Status.ACTIVE : Status.FAILED,
        );

        // Step 6: Prepare Blockscout
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
        await this._updateJobStatus(jobId, 'Deploying Blockscout');
        const blockscoutVm = await this.serverService.createAzureVMServer({
          resourceGroup: `${payload.name}-blockscout`,
          userId: payload.userId,
          vmName: `${payload.name}-blockscout`,
          sshKeyName: `${payload.name}-blockscout`,
        });

        // Step 8: Associate Blockscout VM
        // await this._updateJobStatus(jobId, 'Updating network with Blockscout VM');
        await this.networkService.updateBsServerId(networkId, blockscoutVm.id);

        // Step 9: Configure Blockscout server
        // await this._updateJobStatus(jobId, 'Setting up Blockscout server');
        await this.serverService.setupDockerAndNginx(blockscoutVm.id, true);

        // Step 10: Transfer Blockscout files and start
        // await this._updateJobStatus(jobId, 'Transferring Blockscout directory');
        await this.serverService.transferDirectoryByName(
          blockscoutVm.id,
          `blockscout-${network.id}`,
        );

        // await this._updateJobStatus(jobId, 'Starting Blockscout');
        await this.blockscoutService.runBlockscout(network.id, blockscoutVm.id);

        // Cleanup any stray Besu nodes
        await this.containerService.killBesuNode();

        // Final: mark job complete
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
