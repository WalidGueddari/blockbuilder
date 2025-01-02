import { PrismaClient } from '@saas-monorepo/database';

import { AbstractServiceOptions } from '../types/services.js';
import { NetworksService } from './networks.js';

// Import the NetworksService

export class NodesService {
  prisma: PrismaClient;
  networksService: NetworksService;

  constructor(options: AbstractServiceOptions) {
    this.prisma = options.prisma;
    this.networksService = new NetworksService(options);
  }

  async createNode(networkId: string, name: string) {
    return await this.prisma.node.create({
      data: {
        name,
        networkId,
        status: 'active', // Default status when created
      },
    });
  }

  async deleteNode(nodeId: string) {
    const node = await this.prisma.node.findUniqueOrThrow({
      where: { id: nodeId },
    });

    // Delete the node
    await this.prisma.node.delete({
      where: { id: nodeId },
    });

    // Use instance method instead of static
    await this.networksService.decrementNodeCount(node.networkId);
  }

  async stopNode(nodeId: string) {
    return await this.prisma.node.update({
      where: { id: nodeId },
      data: { status: 'stopped' },
    });
  }

  async getNetworkNodes(networkId: string) {
    return await this.prisma.node.findMany({
      where: { networkId },
    });
  }

  async getNodeById(nodeId: string) {
    return await this.prisma.node.findUnique({
      where: { id: nodeId },
    });
  }
}
