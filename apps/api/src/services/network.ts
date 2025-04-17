import { PrismaClient } from '@saas-monorepo/database';
import * as fs from 'fs/promises';
// Import file system module
import path from 'path';

import { InitNetworkPayload } from '../types/network.js';
import { Pagination } from '../types/response.js';
import { AbstractServiceOptions } from '../types/services.js';
import { Status } from '../types/status.js';

export class NewtorkSevice {
  prisma: PrismaClient;

  constructor(options: AbstractServiceOptions) {
    this.prisma = options.prisma;
  }

  async initNetwork(payload: InitNetworkPayload, serverId?: string) {
    // Generate a unique chain ID
    const chainId = await this._generateChainId();

    // Create the network with the generated chainId
    const initNetwork = await this.prisma.network.create({
      data: {
        ...payload,
        chainId,
        serverId,
      },
    });

    return initNetwork;
  }

  async updateServerId(networkId: string, serverId: string) {
    return this.prisma.network.update({
      where: { id: networkId },
      data: { serverId },
    });
  }

  async updateStatus(networkId: string, status: Status) {
    return this.prisma.network.update({
      where: { id: networkId },
      data: { status },
    });
  }

  async getNetworkById(id: string) {
    return this.prisma.network.findUnique({
      where: { id },
      select: {
        server: true,
        genesis: true,
      },
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

  async saveGenesisFile(networkId: string, filePath: string) {
    try {
      // Read the genesis file content
      const fileContent = await fs.readFile(path.resolve(filePath), 'utf-8');
      const genesisData = JSON.parse(fileContent); // Parse JSON data

      console.log('Genesis data:', genesisData);

      // Extract necessary fields from genesis file
      const {
        config: { berlinBlock, qbft },
        nonce,
        timestamp,
        gasLimit,
        difficulty,
        mixHash,
        coinbase,
        alloc,
      } = genesisData;

      const blockPeriod = qbft?.blockperiodseconds || 2;
      const epochLength = qbft?.epochlength || 30000;
      const requestTimeout = qbft?.requesttimeoutseconds || 4;

      // Save to the database
      const savedGenesis = await this.prisma.genesis.create({
        data: {
          networkId,
          berlinBlock,
          blockPeriod,
          epochLength,
          requestTimeout,
          nonce,
          timestamp,
          gasLimit,
          difficulty,
          mixHash,
          coinbase,
        },
      });

      // Save the allocations (allocs) data
      if (alloc) {
        const allocEntries = Object.entries(alloc);

        const allocData = allocEntries.map(([publicAddress, details]: [string, any]) => ({
          public_address: publicAddress,
          private_key: details.privateKey,
          balance: details.balance,
          networkId,
        }));

        await this.prisma.alloc.createMany({
          data: allocData,
          skipDuplicates: true,
        });

        console.log(`Saved ${allocEntries.length} allocations for network ${networkId}`);
      }

      return savedGenesis;
    } catch (error) {
      console.error('Error saving genesis file:', error);
      throw new Error('Failed to process and save the genesis file');
    }
  }

  private async _generateChainId() {
    try {
      while (true) {
        const chainId = Math.floor(10_000 + Math.random() * 999_990_000);

        const exists = await this.prisma.network.findFirst({
          where: { chainId },
        });

        if (!exists) return chainId;
      }
    } catch (error) {
      console.error('Error generating unique Chain ID:', error);
      throw new Error('Failed to generate a unique Chain ID');
    }
  }
}
