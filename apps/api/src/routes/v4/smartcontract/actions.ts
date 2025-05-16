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

  // Route to verify a deployed contract
  fastify.post(
    '/:networkId/verify',
    {
      schema: {
        tags: ['smartcontract'],
        description: 'Verify a deployed smart contract on the network',
        params: Type.Object({
          networkId: Type.String({
            description: 'The ID of the network where the contract is deployed',
          }),
        }),
        body: Type.Object({
          address: Type.String({ description: 'The address of the deployed contract' }),
          contractName: Type.String({ description: 'The name of the contract to verify' }),
        }),
        response: {
          200: Type.Object({
            result: Type.String({ description: 'The verification result' }),
          }),
          500: Type.Object({
            error: Type.String({ description: 'Error message if the verification fails' }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { networkId } = request.params as { networkId: string };
      const { address, contractName } = request.body as {
        address: string;
        contractName: string;
      };

      try {
        const result = await contractService.verifyContract(networkId, address, contractName);
        return { result };
      } catch (error: any) {
        reply.code(500).send({ error: error.message });
      }
    },
  );

  // Route to get contract ABI
  fastify.get(
    '/:networkId/abi/:address',
    {
      schema: {
        tags: ['smartcontract'],
        description: 'Get the ABI of a deployed smart contract',
        params: Type.Object({
          networkId: Type.String({
            description: 'The ID of the network where the contract is deployed',
          }),
          address: Type.String({ description: 'The address of the deployed contract' }),
        }),
        response: {
          200: Type.Object({
            result: Type.String({ description: 'The contract ABI in JSON format' }),
          }),
          500: Type.Object({
            error: Type.String({ description: 'Error message if retrieving the ABI fails' }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { networkId, address } = request.params as { networkId: string; address: string };

      try {
        const result = await contractService.getContractABI(networkId, address);
        return { result };
      } catch (error: any) {
        reply.code(500).send({ error: error.message });
      }
    },
  );

  // New routes for Deployed Contracts

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
