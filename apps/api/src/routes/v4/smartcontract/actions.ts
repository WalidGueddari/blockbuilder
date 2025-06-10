import { DraftContract as PrismaDraftContract } from '@saas-monorepo/database';
import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';

import {
  ContractConfig,
  ContractService,
  ContractType,
  DeployedContractService,
  DraftContractService,
} from '../../../services/contract.js';

// Define TypeBox schema for ContractConfig
// This needs to mirror the ContractConfig interface from contract.service.ts
const ContractTypeSchema = Type.Union([
  Type.Literal('ERC20'),
  Type.Literal('ERC721'),
  Type.Literal('ERC1155'),
  Type.Literal('Stablecoin'),
  Type.Literal('RWA'),
  Type.Literal('Governor'),
  Type.Literal('Custom'),
  Type.Literal('Imported'),
]);

const GovernanceSettingsSchema = Type.Object({
  votingDelay: Type.Number(),
  votingPeriod: Type.Number(),
  proposalThreshold: Type.Number(),
});

const RwaSettingsSchema = Type.Object({
  assetType: Type.String(),
  jurisdiction: Type.String(),
  complianceRequired: Type.Boolean(),
});

const StablecoinSettingsSchema = Type.Object({
  pegCurrency: Type.String(),
  oracleAddress: Type.Optional(Type.String()),
});

const ContractConfigSchema = Type.Object({
  contractType: ContractTypeSchema,
  name: Type.String(),
  symbol: Type.String(),
  mintable: Type.Boolean(),
  burnable: Type.Boolean(),
  pausable: Type.Boolean(),
  decimals: Type.Optional(Type.Number()),
  initialSupply: Type.Optional(Type.String()),
  maxSupply: Type.Optional(Type.String()),
  royaltyFee: Type.Optional(Type.Number()),
  governanceSettings: Type.Optional(GovernanceSettingsSchema),
  rwaSettings: Type.Optional(RwaSettingsSchema),
  stablecoinSettings: Type.Optional(StablecoinSettingsSchema),
  baseUri: Type.Optional(Type.String()),
  governorName: Type.Optional(Type.String()),
  votingDelay: Type.Optional(Type.Number()),
  votingPeriod: Type.Optional(Type.Number()),
  proposalThreshold: Type.Optional(Type.Number()),
  quorumNumerator: Type.Optional(Type.Number()),
  customCode: Type.Optional(Type.String()),
  description: Type.Optional(Type.String()),
  tags: Type.Optional(Type.Array(Type.String())),
});

const routes: FastifyPluginAsync = async (fastify, opts) => {
  const { prisma } = fastify;
  const contractService = new ContractService({ prisma });
  const deployedContractService = new DeployedContractService({ prisma });
  const draftContractService = new DraftContractService({ prisma });

  // Route to interact with a deployed contract
  fastify.post(
    '/:networkId/interact',
    {
      schema: {
        tags: ['smartcontract'],
        description: 'Interact with a deployed smart contract',
        params: Type.Object({
          networkId: Type.String({
            description: 'The ID of the network where the contract is deployed',
          }),
        }),
        body: Type.Object({
          address: Type.String({ description: 'The address of the deployed contract' }),
          functionName: Type.String({ description: 'The name of the function to call' }),
          args: Type.Optional(
            Type.Array(Type.String(), { description: 'Arguments to pass to the function' }),
          ),
        }),
        response: {
          200: Type.Object({
            result: Type.String({ description: 'The result of the contract interaction' }),
          }),
          500: Type.Object({
            error: Type.String({ description: 'Error message if the interaction fails' }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { networkId } = request.params as { networkId: string };
      const {
        address,
        functionName,
        args = [],
      } = request.body as {
        address: string;
        functionName: string;
        args?: string[];
      };

      try {
        const result = await contractService.interactWithContract(
          networkId,
          address,
          functionName,
          args,
        );
        return { result };
      } catch (error: any) {
        reply.code(500).send({ error: error.message });
      }
    },
  );

  // Route to deploy a new contract
  fastify.post(
    '/:networkId/deploy',
    {
      schema: {
        tags: ['smartcontract'],
        description: 'Deploy a new smart contract to a specified network',
        params: Type.Object({
          networkId: Type.String(),
        }),
        body: Type.Object({
          contractName: Type.String(),
          contractContent: Type.String(),
          description: Type.Optional(Type.String()),
          tags: Type.Optional(Type.Array(Type.String())),
          abi: Type.Optional(Type.Any()),
          type: Type.Optional(ContractTypeSchema), // Retained for potential direct use or logging
          config: Type.Optional(ContractConfigSchema), // Ensures body.config is validated as full ContractConfig
        }),
        response: {
          200: Type.Object({
            contractAddress: Type.String(),
            transactionHash: Type.String(),
          }),
          500: Type.Object({
            error: Type.String(),
          }),
        },
      },
    },
    async (request, reply) => {
      try {
        const { networkId } = request.params as { networkId: string };
        // request.body is validated by Fastify against the schema, including the full ContractConfigSchema for config
        const { contractName, contractContent, description, tags, abi, config } = request.body as {
          contractName: string;
          contractContent: string;
          description?: string;
          tags?: string[];
          abi?: any;
          type?: ContractType; // This is available if needed, but config.contractType is primary
          config?: ContractConfig; // This will be the full ContractConfig object if provided
        };

        const contractFile = Buffer.from(contractContent, 'utf-8');

        const deploymentResult = await contractService.deployContract(
          networkId,
          contractFile,
          contractName,
          {
            // Pass properties directly
            abi,
            description,
            tags,
            config, // Pass the validated config object directly
          },
        );

        return deploymentResult;
      } catch (error: any) {
        fastify.log.error(error);
        reply.code(500).send({ error: error.message });
      }
    },
  );

  // Route to add an external contract
  fastify.post(
    '/:networkId/add-external-contract',
    {
      schema: {
        tags: ['smartcontract'],
        description: 'Add an external contract to a specified network',
        params: Type.Object({
          networkId: Type.String(),
        }),
        body: Type.Object({
          contractName: Type.String(),
          contractAddress: Type.String(),
          abi: Type.Any(),
          description: Type.Optional(Type.String()),
          tags: Type.Optional(Type.Array(Type.String())),
          config: Type.Optional(ContractConfigSchema),
        }),
        response: {
          200: Type.Object({
            contractAddress: Type.String(),
            abi: Type.Any(),
          }),
          500: Type.Object({
            error: Type.String(),
          }),
        },
      },
    },
    async (request, reply) => {
      try {
        const { networkId } = request.params as { networkId: string };
        const {
          contractName,
          contractAddress,
          abi,
          description,
          tags = [],
          config,
        } = request.body as {
          contractName: string;
          contractAddress: string;
          abi: any;
          description?: string;
          tags?: string[];
          config?: ContractConfig;
        };

        // Add 'external' tag to distinguish external contracts
        const updatedTags = [...tags, 'external'];

        const result = await contractService.addExternalContractUsingABI(
          networkId,
          contractAddress,
          contractName,
          {
            abi,
            description,
            tags: updatedTags,
            config,
          },
        );

        return result;
      } catch (error: any) {
        fastify.log.error(error);
        reply.code(500).send({ error: error.message });
      }
    },
  );

  // Route to add an external contract using source code
  fastify.post(
    '/:networkId/add-external-contract-code',
    {
      schema: {
        tags: ['smartcontract'],
        description: 'Add an external contract using its source code',
        params: Type.Object({
          networkId: Type.String(),
        }),
        body: Type.Object({
          contractName: Type.String(),
          contractAddress: Type.String(),
          contractContent: Type.String(),
          description: Type.Optional(Type.String()),
          tags: Type.Optional(Type.Array(Type.String())),
          config: Type.Optional(ContractConfigSchema),
        }),
        response: {
          200: Type.Object({
            contractAddress: Type.String(),
            abi: Type.Any(),
          }),
          500: Type.Object({
            error: Type.String(),
          }),
        },
      },
    },
    async (request, reply) => {
      try {
        const { networkId } = request.params as { networkId: string };
        const {
          contractName,
          contractAddress,
          contractContent,
          description,
          tags = [],
          config,
        } = request.body as {
          contractName: string;
          contractAddress: string;
          contractContent: string;
          description?: string;
          tags?: string[];
          config?: ContractConfig;
        };

        // Add 'external' and 'source-code' tags
        const updatedTags = [...tags, 'external', 'source-code'];

        const contractFile = Buffer.from(contractContent, 'utf-8');

        const result = await contractService.addExternalContractUsingCode(
          networkId,
          contractAddress,
          contractFile,
          contractName,
          {
            abi: [], // Will be populated from compilation
            description,
            tags: updatedTags,
            config,
          },
        );

        return result;
      } catch (error: any) {
        fastify.log.error(error);
        reply.code(500).send({ error: error.message });
      }
    },
  );

  // Route to get contract interactions
  fastify.get(
    '/:networkId/interactions/:address',
    {
      schema: {
        tags: ['smartcontract'],
        description: 'Get interaction history for a contract',
        params: Type.Object({
          networkId: Type.String(),
          address: Type.String(),
        }),
        response: {
          200: Type.Array(
            Type.Object({
              id: Type.String(),
              functionName: Type.String(),
              functionType: Type.Union([Type.Literal('view'), Type.Literal('transaction')]),
              result: Type.Optional(Type.Any()),
              transactionHash: Type.Optional(Type.String()),
              gasUsed: Type.Optional(Type.String()),
              blockNumber: Type.Optional(Type.Number()),
              timestamp: Type.String(),
              signerAddress: Type.Optional(Type.String()),
            }),
          ),
          500: Type.Object({
            error: Type.String(),
          }),
        },
      },
    },
    async (request, reply) => {
      try {
        const { networkId, address } = request.params as { networkId: string; address: string };
        const contract = await deployedContractService.findById(address);
        if (!contract) {
          return reply.code(404).send({ error: 'Contract not found' });
        }
        return contract.interactions || [];
      } catch (error: any) {
        reply.code(500).send({ error: error.message });
      }
    },
  );

  // GET /smartcontract/deployed - List all deployed contracts
  fastify.get(
    '/deployed',
    {
      schema: {
        tags: ['smartcontract'],
        description: 'List all deployed smart contracts',
        response: {
          200: Type.Array(
            Type.Object({
              id: Type.String(),
              address: Type.String(),
              name: Type.String(),
              type: Type.String(),
              description: Type.Optional(Type.String()),
              tags: Type.Array(Type.String()),
              abi: Type.Optional(Type.Any()),
              transactionHash: Type.String(),
              deployedAt: Type.String(),
              networkId: Type.String(),
              createdAt: Type.String(),
              updatedAt: Type.String(),
              favorites: Type.Array(
                Type.Object({
                  id: Type.String(),
                  createdAt: Type.String(),
                }),
              ),
            }),
          ),
          500: Type.Object({
            error: Type.String(),
          }),
        },
      },
    },
    async (request, reply) => {
      try {
        const contracts = await deployedContractService.findAll();
        return contracts;
      } catch (error: any) {
        reply.code(500).send({ error: error.message });
      }
    },
  );

  // Route to get contract details
  fastify.get(
    '/:networkId/contract/:address',
    {
      schema: {
        tags: ['smartcontract'],
        description: 'Get detailed information about a deployed contract',
        params: Type.Object({
          networkId: Type.String(),
          address: Type.String(),
        }),
        response: {
          200: Type.Object({
            id: Type.String(),
            address: Type.String(),
            name: Type.String(),
            type: Type.String(),
            description: Type.Optional(Type.String()),
            tags: Type.Array(Type.String()),
            abi: Type.Optional(Type.Any()),
            transactionHash: Type.String(),
            deployedAt: Type.String(),
            networkId: Type.String(),
            createdAt: Type.String(),
            updatedAt: Type.String(),
            favorites: Type.Array(
              Type.Object({
                id: Type.String(),
                createdAt: Type.String(),
              }),
            ),
            interactions: Type.Array(
              Type.Object({
                id: Type.String(),
                functionName: Type.String(),
                functionType: Type.Union([Type.Literal('view'), Type.Literal('transaction')]),
                result: Type.Optional(Type.Any()),
                transactionHash: Type.Optional(Type.String()),
                gasUsed: Type.Optional(Type.String()),
                blockNumber: Type.Optional(Type.Number()),
                timestamp: Type.String(),
                signerAddress: Type.Optional(Type.String()),
              }),
            ),
          }),
          404: Type.Object({ error: Type.String() }),
          500: Type.Object({
            error: Type.String(),
          }),
        },
      },
    },
    async (request, reply) => {
      try {
        const { networkId, address } = request.params as { networkId: string; address: string };
        const contract = await deployedContractService.findById(address);
        if (!contract) {
          return reply.code(404).send({ error: 'Contract not found' });
        }
        return contract;
      } catch (error: any) {
        reply.code(500).send({ error: error.message });
      }
    },
  );

  // Route to search deployed contracts
  fastify.get(
    '/deployed/search',
    {
      schema: {
        tags: ['smartcontract'],
        description: 'Search deployed contracts by various criteria',
        querystring: Type.Object({
          query: Type.Optional(Type.String()),
          type: Type.Optional(ContractTypeSchema),
          tags: Type.Optional(Type.Array(Type.String())),
          networkId: Type.Optional(Type.String()),
          isFavorite: Type.Optional(Type.Boolean()),
        }),
        response: {
          200: Type.Array(
            Type.Object({
              id: Type.String(),
              address: Type.String(),
              name: Type.String(),
              type: Type.String(),
              description: Type.Optional(Type.String()),
              tags: Type.Array(Type.String()),
              abi: Type.Optional(Type.Any()),
              transactionHash: Type.String(),
              deployedAt: Type.String(),
              networkId: Type.String(),
              createdAt: Type.String(),
              updatedAt: Type.String(),
              favorites: Type.Array(
                Type.Object({
                  id: Type.String(),
                  createdAt: Type.String(),
                }),
              ),
            }),
          ),
          500: Type.Object({
            error: Type.String(),
          }),
        },
      },
    },
    async (request, reply) => {
      try {
        const { query, type, tags, networkId, isFavorite } = request.query as {
          query?: string;
          type?: ContractType;
          tags?: string[];
          networkId?: string;
          isFavorite?: boolean;
        };

        const contracts = await deployedContractService.findAll();

        // Filter contracts based on search criteria
        const filteredContracts = contracts.filter((contract) => {
          if (
            query &&
            !contract.name.toLowerCase().includes(query.toLowerCase()) &&
            !contract.description?.toLowerCase().includes(query.toLowerCase())
          ) {
            return false;
          }
          if (type && contract.type !== type) {
            return false;
          }
          if (tags && tags.length > 0 && !tags.every((tag) => contract.tags.includes(tag))) {
            return false;
          }
          if (networkId && contract.networkId !== networkId) {
            return false;
          }
          if (
            isFavorite !== undefined &&
            (isFavorite ? contract.favorites.length === 0 : contract.favorites.length > 0)
          ) {
            return false;
          }
          return true;
        });

        return filteredContracts;
      } catch (error: any) {
        reply.code(500).send({ error: error.message });
      }
    },
  );

  // POST /smartcontract/deployed/:contractId/favorite - Toggle favorite status
  fastify.post(
    '/deployed/:contractId/favorite',
    {
      schema: {
        tags: ['smartcontract'],
        description: 'Toggle favorite status for a deployed contract',
        params: Type.Object({
          contractId: Type.String(),
        }),
        response: {
          200: Type.Object({
            isFavorite: Type.Boolean(),
          }),
          404: Type.Object({ error: Type.String() }),
          500: Type.Object({
            error: Type.String(),
          }),
        },
      },
    },
    async (request, reply) => {
      try {
        const { contractId } = request.params as { contractId: string };
        const result = await deployedContractService.toggleFavorite(contractId);
        return result;
      } catch (error: any) {
        if (error.message === 'Contract not found') {
          return reply.code(404).send({ error: error.message });
        }
        reply.code(500).send({ error: error.message });
      }
    },
  );

  // New routes for Draft Contracts

  // GET /smartcontract/drafts - List all draft contracts
  fastify.get(
    '/drafts',
    {
      schema: {
        tags: ['smartcontract', 'draft'],
        description: 'List all draft contracts',
        response: {
          200: Type.Array(
            Type.Object({
              id: Type.String(),
              name: Type.String(),
              content: Type.String(),
              type: Type.Optional(Type.String()),
              description: Type.Optional(Type.String()),
              tags: Type.Array(Type.String()),
              networkId: Type.Optional(Type.String()),
              createdAt: Type.String({ format: 'date-time' }),
              updatedAt: Type.String({ format: 'date-time' }),
              config: Type.Optional(Type.Any()),
            }),
          ),
          500: Type.Object({
            error: Type.String(),
          }),
        },
      },
    },
    async (request, reply) => {
      try {
        const drafts = await draftContractService.findAll();
        return drafts;
      } catch (error: any) {
        reply.code(500).send({ error: error.message });
      }
    },
  );

  // POST /smartcontract/drafts - Create a new draft contract
  fastify.post(
    '/drafts',
    {
      schema: {
        tags: ['smartcontract', 'draft'],
        description: 'Create a new draft contract',
        body: Type.Object({
          name: Type.String(),
          content: Type.String(),
          type: Type.Optional(ContractTypeSchema),
          description: Type.Optional(Type.String()),
          tags: Type.Array(Type.String()),
          networkId: Type.Optional(Type.String()),
          config: ContractConfigSchema,
        }),
        response: {
          200: Type.Object({
            id: Type.String(),
            name: Type.String(),
            content: Type.String(),
            type: Type.Optional(ContractTypeSchema),
            description: Type.Optional(Type.String()),
            tags: Type.Array(Type.String()),
            networkId: Type.Optional(Type.String()),
            createdAt: Type.String(),
            updatedAt: Type.String(),
            config: ContractConfigSchema,
          }),
          500: Type.Object({
            error: Type.String(),
          }),
        },
      },
    },
    async (request, reply) => {
      try {
        const draftData = request.body as {
          name: string;
          content: string;
          type?: ContractType;
          description?: string;
          tags: string[];
          networkId?: string;
          config: ContractConfig;
        };
        const newDraft = await draftContractService.create(draftData);
        return newDraft;
      } catch (error: any) {
        reply.code(500).send({ error: error.message });
      }
    },
  );

  // GET /smartcontract/drafts/:draftId - Get a specific draft
  fastify.get(
    '/drafts/:draftId',
    {
      schema: {
        tags: ['smartcontract', 'draft'],
        description: 'Get a specific draft contract by ID',
        params: Type.Object({
          draftId: Type.String(),
        }),
        response: {
          200: Type.Object({
            id: Type.String(),
            name: Type.String(),
            content: Type.String(),
            type: Type.Optional(ContractTypeSchema),
            description: Type.Optional(Type.String()),
            tags: Type.Array(Type.String()),
            networkId: Type.Optional(Type.String()),
            createdAt: Type.String({ format: 'date-time' }),
            updatedAt: Type.String({ format: 'date-time' }),
            config: Type.Optional(ContractConfigSchema),
          }),
          404: Type.Object({ error: Type.String() }),
          500: Type.Object({
            error: Type.String(),
          }),
        },
      },
    },
    async (request, reply) => {
      try {
        const { draftId } = request.params as { draftId: string };
        const draft = await draftContractService.findById(draftId);
        if (!draft) {
          return reply.code(404).send({ error: 'Draft not found' });
        }
        return draft;
      } catch (error: any) {
        reply.code(500).send({ error: error.message });
      }
    },
  );

  // PUT /smartcontract/drafts/:draftId - Update a draft
  fastify.put(
    '/drafts/:draftId',
    {
      schema: {
        tags: ['smartcontract', 'draft'],
        description: 'Update a draft contract by ID',
        params: Type.Object({
          draftId: Type.String(),
        }),
        body: Type.Partial(
          Type.Object({
            name: Type.String(),
            content: Type.String(),
            type: Type.Optional(ContractTypeSchema),
            description: Type.Optional(Type.String()),
            tags: Type.Array(Type.String()),
            networkId: Type.Optional(Type.String()),
            config: ContractConfigSchema,
          }),
        ),
        response: {
          200: Type.Object({
            id: Type.String(),
            name: Type.String(),
            content: Type.String(),
            type: Type.Optional(ContractTypeSchema),
            description: Type.Optional(Type.String()),
            tags: Type.Array(Type.String()),
            networkId: Type.Optional(Type.String()),
            createdAt: Type.String(),
            updatedAt: Type.String(),
            config: ContractConfigSchema,
          }),
          404: Type.Object({ error: Type.String() }),
          500: Type.Object({ error: Type.String() }),
        },
      },
    },
    async (request, reply) => {
      try {
        const { draftId } = request.params as { draftId: string };
        const updateData = request.body as Partial<
          PrismaDraftContract & { config?: ContractConfig }
        >;
        const updatedDraft = await draftContractService.update(draftId, updateData);
        return updatedDraft;
      } catch (error: any) {
        if ((error as any).code === 'P2025') {
          return reply.code(404).send({ error: 'Draft not found for update.' });
        }
        reply.code(500).send({ error: error.message });
      }
    },
  );

  // DELETE /smartcontract/drafts/:draftId - Delete a draft
  fastify.delete(
    '/drafts/:draftId',
    {
      schema: {
        tags: ['smartcontract', 'draft'],
        description: 'Delete a draft contract by ID',
        params: Type.Object({
          draftId: Type.String(),
        }),
        response: {
          200: Type.Object({ message: Type.String() }),
          404: Type.Object({ error: Type.String() }),
          500: Type.Object({ error: Type.String() }),
        },
      },
    },
    async (request, reply) => {
      try {
        const { draftId } = request.params as { draftId: string };
        await draftContractService.delete(draftId);
        return { message: 'Draft deleted successfully' };
      } catch (error: any) {
        if ((error as any).code === 'P2025') {
          return reply.code(404).send({ error: 'Draft not found for deletion.' });
        }
        reply.code(500).send({ error: error.message });
      }
    },
  );
};

export default routes;
