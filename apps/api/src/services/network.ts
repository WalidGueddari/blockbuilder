import { PrismaClient } from '@saas-monorepo/database';

import { InitNetworkPayload } from '../types/network.js';
import { AbstractServiceOptions } from '../types/services.js';

export class NewtorkSevice {
  prisma: PrismaClient;

  constructor(options: AbstractServiceOptions) {
    this.prisma = options.prisma;
  }

  async initNetwork(payload: InitNetworkPayload) {
    return this.prisma.network.create({
      data: payload,
    });
  }

  async getNetworkById(id: string) {
    return this.prisma.network.findUnique({
      where: { id },
    });
  }
}
