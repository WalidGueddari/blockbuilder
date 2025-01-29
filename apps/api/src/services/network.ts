import { PrismaClient } from '@saas-monorepo/database';

import { InitNetworkPayload } from '../types/network.js';
import { Pagination } from '../types/response.js';
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

  async getNetworksByUserId(page: number, limit: number, userId: string) {
    // Calculate the number of records to skip
    const skip = (page - 1) * limit;

    // Fetch the total count of records matching the search criteria
    const total = await this.prisma.network.count({
      where: {
        userId,
      },
    });

    // Calculate total number of pages
    const pages = Math.ceil(total / limit);

    // Fetch the paginated data
    const data = await this.prisma.network.findMany({
      where: {
        userId,
      },
      skip,
      take: limit,
      orderBy: { create_at: 'desc' },
    });

    // Construct the pagination object
    const pagination: Pagination = {
      page,
      limit,
      pages,
      total,
      next: page < pages ? page + 1 : null,
      prev: page > 1 ? page - 1 : null,
    };

    return { data, pagination };
  }
}
