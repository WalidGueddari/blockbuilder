import { PrismaClient } from '@saas-monorepo/database';

import { CreateNodePayload } from '../types/node.js';
import { AbstractServiceOptions } from '../types/services.js';
import { Status } from '../types/status.js';

export class NodeService {
  prisma: PrismaClient;

  constructor(options: AbstractServiceOptions) {
    this.prisma = options.prisma;
  }

  async saveNodes(payload: CreateNodePayload) {
    try {
      const node = await this.prisma.node.create({
        data: payload,
      });
      return node;
    } catch (error: any) {
      console.error('Full error:', error);
      throw new Error(`Unexpected error: ${error.message}\nFull error: ${error}`);
    }
  }

  async getNodeStatus(id: string) {
    try {
      return await this.prisma.node.findUnique({
        where: {
          id,
        },
        select: {
          status: true,
        },
      });
    } catch (error: any) {
      console.error('Full error:', error);
      throw new Error(`Unexpected error: ${error.message}\nFull error: ${error}`);
    }
  }

  async getNodes(networkId: string) {
    try {
      const nodes = await this.prisma.node.findMany({
        where: {
          networkId,
        },
        include: { network: true },
      });
      return nodes;
    } catch (error: any) {
      console.error('Full error:', error);
      throw new Error(`Unexpected error: ${error.message}\nFull error: ${error}`);
    }
  }

  async getNodeById(id: string) {
    try {
      const node = await this.prisma.node.findUnique({
        where: {
          id,
        },
      });
      return node;
    } catch (error: any) {
      console.error('Full error:', error);
      throw new Error(`Unexpected error: ${error.message}\nFull error: ${error}`);
    }
  }

  async updateNodeStatus(id: string, status: Status) {
    try {
      const node = await this.prisma.node.update({
        where: { id },
        data: { status },
      });
      return node;
    } catch (error: any) {
      console.error('Full error:', error);
      throw new Error(`Unexpected error: ${error.message}\nFull error: ${error}`);
    }
  }
}
