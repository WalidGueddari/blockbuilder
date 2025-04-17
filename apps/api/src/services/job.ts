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

  async initJob(userId: string) {
    try {
      const job = await this.prisma.job.create({
        data: {
          userId: userId,
          status: 'queued',
        },
      });
      console.log('Job created:', job.id);
      return job;
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  }

  async runJob(payload: InitNetworkPayload, networkId: string, jobId: string) {
    setImmediate(async () => {
      try {
        /*
         * step 1 create azure vm for blockchain
         */
        console.log('Creating Azure VM Job...');
        await this.prisma.job.update({
          where: { id: jobId },
          data: {
            status: 'Creating Vm',
          },
        });
        const azurePayload: CreateAzureVMParams = {
          resourceGroup: payload.name,
          userId: payload.userId,
          vmName: payload.name,
          sshKeyName: payload.name,
        };
        const server = await this.serverService.createAzureVMServer(azurePayload);
        console.log('Azure VM created successfully');

        /*
         * step 2 update network: set server id to network
         */
        console.log('Updating network...');
        await this.prisma.job.update({
          where: { id: jobId },
          data: {
            status: 'Updating Network',
          },
        });
        const initNetwork = await this.networkService.updateServerId(networkId, server.id);
        console.log('Network updated successfully');

        /*
         * step 3  setup blockchain server
         */
        await this.prisma.job.update({
          where: { id: jobId },
          data: {
            status: 'Setting up Blockchain Server',
          },
        });
        console.log('Setting up blockchain server...');
        await this.serverService.setupDockerAndNginx(server.id, false);
        console.log('Blockchain server set up successfully');

        /*
         * step 4 Transferring network directory to VM
         */

        await this.prisma.job.update({
          where: { id: jobId },
          data: {
            status: 'Transferring Network Directory',
          },
        });
        console.log('Transferring network directory to VM...');
        await this.serverService.transferDirectoryByName(server.id, initNetwork.id);
        console.log('Directory transferred to VM successfully');

        /*
         * step 5 start network
         */
        await this.prisma.job.update({
          where: { id: jobId },
          data: {
            status: 'Starting Network',
          },
        });

        console.log('Starting network...');
        const start = await this.containerService.runNode({
          networkId: initNetwork.id,
          nodeCount: initNetwork.nodeCount,
          vmId: server.id,
        });
        if (start.success) {
          await this.networkService.updateStatus(initNetwork.id, Status.ACTIVE);
          console.info(`Network started successfully on VM ID: ${server.id}`);
        } else {
          await this.networkService.updateStatus(initNetwork.id, Status.FAILED);
          console.error(`Failed to start network on VM ID: ${server.id}`);
        }

        /*
         * step 6 create azure vm for blockscout
         */
        const azurePayloadBlockscout: CreateAzureVMParams = {
          // Merge or override any properties from the original azureParams if needed
          resourceGroup: `${payload.name}-blockscout`,
          userId: payload.userId,
          vmName: `${payload.name}-blockscout`,
          sshKeyName: `${payload.name}-blockscout`,
        };

        await this.prisma.job.update({
          where: { id: jobId },
          data: {
            status: 'Creating Blockscout VM',
          },
        });
        console.log('Creating Azure VM for Blockscout...');
        const blockscoutServer =
          await this.serverService.createAzureVMServer(azurePayloadBlockscout);
        console.log('Azure VM for Blockscout created successfully');

        /*
         * step 7 setup blockscout server
         */
        await this.prisma.job.update({
          where: { id: jobId },
          data: {
            status: 'Setting up Blockscout Server',
          },
        });
        console.log('Setting up Blockscout server...');
        await this.serverService.setupDockerAndNginx(blockscoutServer.id, true);
        console.log('Blockscout server set up successfully');

        /*
         * step 8 generating blockscout docker compose file
         */

        await this.prisma.job.update({
          where: { id: jobId },
          data: {
            status: 'Generating Blockscout Docker Compose File',
          },
        });
        if (!server.dnsName) {
          throw new Error('DNS name is missing from the Azure VM server.');
        }
        console.log('Generating Blockscout Docker Compose file...');
        await this.blockscoutService._generateDockerComposeFile(
          initNetwork.chainId,
          server.dnsName,
          initNetwork.id,
        );
        console.log('Blockscout Docker Compose file generated successfully');

        /*
         * step 9 Transferring blockscout directory to VM
         */
        await this.prisma.job.update({
          where: { id: jobId },
          data: {
            status: 'Transferring Blockscout Directory',
          },
        });
        console.log('Transferring Blockscout directory to VM...');
        await this.serverService.transferDirectoryByName(
          blockscoutServer.id,
          `blockscout-${initNetwork.id}`,
        );
        console.log('Blockscout directory transferred to VM successfully');

        /*
         * step 10 start blockscout
         */
        await this.prisma.job.update({
          where: { id: jobId },
          data: {
            status: 'Starting Blockscout',
          },
        });
        console.log('Starting Blockscout...');
        await this.blockscoutService.runBlockscout(initNetwork.id, blockscoutServer.id);
      } catch (error: any) {
        console.error('Error running job:', error);
        await this.prisma.job.update({
          where: { id: jobId },
          data: { status: 'error', errorMessage: error.message },
        });
        throw error;
      }
    });
  }
}
