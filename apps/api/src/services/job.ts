// apps/api/src/services/job.ts
import { PrismaClient } from '@saas-monorepo/database';
import type { Redis } from 'ioredis';

import { Status } from '../constants.js';
import { InitNetworkPayload } from '../types/network.js';
import { Pagination } from '../types/response.js';
import { AbstractServiceOptions } from '../types/services.js';
import { BlockscoutService } from './blockscout.js';
import { ContainerService } from './containers.js';
import { HardhatService } from './hardhat.js';
import { NewtorkSevice } from './network.js';
import { ServerService } from './server.js';

export interface JobServiceOptions extends AbstractServiceOptions {
  redis: Redis;
}

export class JobService {
  /* ---------- Prisma client ----------------------------------------------------- */
  prisma: PrismaClient;
  redis: Redis;

  /* ---------- composed domain services ------------------------------------------- */
  containerService: ContainerService;
  serverService: ServerService;
  blockscoutService: BlockscoutService;
  networkService: NewtorkSevice;
  hardhatService: HardhatService;

  constructor(options: JobServiceOptions) {
    this.prisma = options.prisma;
    this.redis = options.redis;
    this.containerService = new ContainerService(options);
    this.serverService = new ServerService(options);
    this.blockscoutService = new BlockscoutService(options);
    this.networkService = new NewtorkSevice(options);
    this.hardhatService = new HardhatService(options);
  }

  /** Patch one job record with the latest status & (optionally) error */
  private async _updateJobStatus(jobId: string, status: string, errorMessage?: string) {
    try {
      const updated = await this.prisma.job.update({
        where: { id: jobId },
        data: { status, errorMessage, updatedAt: new Date() },
      });

      // ---- publish the update ----
      const channel = `jobs:${updated.id}`;
      const payload = JSON.stringify({ type: 'job_updated', job: updated });
      const receivers = await this.redis.publish(channel, payload);

      console.log(
        `Job ${updated.id} → "${status}" | published on ${channel} | ` +
          `${receivers} subscriber${receivers === 1 ? '' : 's'} received it.`,
      );

      return updated;
    } catch (err) {
      console.error(`Error updating job ${jobId}:`, err);
      throw err;
    }
  }

  /** Creates a new job record and returns it */
  async initJob(userId: string, networkId: string) {
    try {
      const job = await this.prisma.job.create({
        data: { userId, networkId, status: 'Initializing blockchain' },
      });

      const channel = `jobs:${job.id}`;
      const payload = JSON.stringify({ type: 'job_created', job });
      const receivers = await this.redis.publish(channel, payload);

      console.log(
        `Job ${job.id} published on ${channel}. ` +
          `${receivers} subscriber${receivers === 1 ? '' : 's'} received it.`,
      );

      return job;
    } catch (err) {
      console.error('Error creating job:', err);
      throw err;
    }
  }

  /** Grabs the first (oldest) job for a user */
  async getJob(userId: string, page: number, limit: number) {
    try {
      // Calculate the number of records to skip
      const skip = (page - 1) * limit;

      // Fetch the total count of records matching the search criteria
      const total = await this.prisma.job.count({
        where: {
          userId,
        },
      });

      // Calculate total number of pages
      const pages = Math.ceil(total / limit);

      const data = await this.prisma.job.findMany({
        where: {
          userId,
        },
        include: {
          Network: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      });

      if (!data) {
        throw new Error(`No job found for user ${userId}`);
      }

      const pagination: Pagination = {
        page,
        limit,
        pages,
        total,
        next: page < pages ? page + 1 : null,
        prev: page > 1 ? page - 1 : null,
      };

      return { data, pagination };
    } catch (err) {
      console.error(`Error getting job for ${userId}:`, err);
      throw err;
    }
  }

  /* ================================================================================
   *  FULL DEPLOYMENT FLOW — 10 steps
   * ==============================================================================*/

  async deployNetworkSteps(payload: InitNetworkPayload, networkId: string, jobId: string) {
    try {
      // Status 1: Provisioning servers
      await this._updateJobStatus(jobId, 'Provisioning servers');
      console.info('Step 1: Creating blockchain VM');
      const blockchainVm = await this.serverService.createAzureVMServer({
        resourceGroup: payload.name,
        userId: payload.userId,
        vmName: payload.name,
        sshKeyName: payload.name,
      });

      console.info('Step 7: Deploying explorer VM');
      const blockscoutVm = await this.serverService.createAzureVMServer({
        resourceGroup: `${payload.name}-blockscout`,
        userId: payload.userId,
        vmName: `${payload.name}-blockscout`,
        sshKeyName: `${payload.name}-blockscout`,
      });

      console.info('Step 2: Associating VM with network');
      const network = await this.networkService.updateServerId(networkId, blockchainVm.id);

      console.info('Step 8: Associating explorer VM');
      await this.networkService.updateBsServerId(networkId, blockscoutVm.id);

      // Status 2: Configuring servers
      await this._updateJobStatus(jobId, 'Configuring servers');
      console.info('Step 3: Configuring Docker & Nginx on blockchain VM');
      await this.serverService.setupDockerAndNginx(blockchainVm.id, false);

      console.info('Step 9: Configuring Docker & Nginx on explorer VM');
      await this.serverService.setupDockerAndNginx(blockscoutVm.id, true);

      // Status 3: Deploying network
      await this._updateJobStatus(jobId, 'Deploying network');
      console.info('Step 4: Transferring network files');
      await this.serverService.transferDirectoryByName(blockchainVm.id, network.id);

      console.info('Step 5: Starting blockchain nodes');
      const startResult = await this.containerService.runNode({
        networkId: network.id,
        nodeCount: network.nodeCount,
        vmId: blockchainVm.id,
      });
      await this.networkService.updateStatus(
        network.id,
        startResult.success ? Status.ACTIVE : Status.FAILED,
      );

      // Status 4: Setting up explorer
      await this._updateJobStatus(jobId, 'Setting up explorer');
      console.info('Step 6: Preparing explorer configuration');
      if (!blockchainVm.dnsName) throw new Error('VM DNS name is missing');
      await this.blockscoutService._generateDockerComposeFile(
        network.chainId,
        blockchainVm.dnsName,
        network.id,
      );

      console.info('Step 10: Transferring explorer files & starting');
      await this.serverService.transferDirectoryByName(blockscoutVm.id, `blockscout-${network.id}`);
      await this.blockscoutService.runBlockscout(network.id, blockscoutVm.id);

      // Status 5: Finalizing deployment
      await this._updateJobStatus(jobId, 'Finalizing deployment');
      console.info('Cleaning up stray Besu nodes');
      await this.containerService.killBesuNode();

      console.info('Deployment finished ✔');
      await this._updateJobStatus(jobId, 'Blockchain ready');
    } catch (err: any) {
      console.error('Deployment job failed:', err);
      await this._updateJobStatus(jobId, 'Deployment failed', err.message ?? String(err));
      throw err;
    }
  }
}
