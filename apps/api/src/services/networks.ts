import { PrismaClient } from '@saas-monorepo/database';

import { CreateNetworkPayload } from '../types/network.js';
import { AbstractServiceOptions } from '../types/services.js';

export class NetworksService {
  prisma: PrismaClient;
  constructor(options: AbstractServiceOptions) {
    this.prisma = options.prisma;
  }

  async createNetwork(payload: CreateNetworkPayload) {
    const checkUser = await this.prisma.user.findUnique({
      where: { id: payload.userId },
    });
    if (!checkUser) {
      throw new Error('invalid User');
    }
    const createNetwork = await this.prisma.network.create({
      data: {
        name: payload.name,
        description: payload.description,
        nodeCount: payload.nodeCount,
        consensus: payload.consensus,
        userId: checkUser.id,
      },
    });

    // logic to create nodes based on nodeCount
    const nodes = Array.from({ length: payload.nodeCount }, (_, index) => ({
      networkId: createNetwork.id,
      name: `Node-${index + 1}`,
      status: 'active',
    }));

    await this.prisma.node.createMany({
      data: nodes,
    });

    return createNetwork;
  }

  async deleteNetwork(networkId: string) {
    const checkNetwork = await this.prisma.network.findUnique({
      where: { id: networkId },
    });
    if (!checkNetwork) {
      throw new Error("Network don't Exist");
    }
    const deleteNetwork = await this.prisma.network.delete({
      where: { id: networkId },
    });
    return deleteNetwork;
  }

  async stopNetwork(networkId: string) {
    // Implement logic to stop the network
    // This could involve updating a status field in the database
  }

  async getUserNetworks(userId: string) {
    return await this.prisma.network.findMany({
      where: { userId },
    });
  }

  async decrementNodeCount(networkId: string) {
    await this.prisma.network.update({
      where: { id: networkId },
      data: {
        nodeCount: {
          decrement: 1, // Decrement the node count by 1
        },
      },
    });
  }
}
