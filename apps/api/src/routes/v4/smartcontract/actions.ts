import { Type } from '@sinclair/typebox';
import { FastifyInstance } from 'fastify';

import { ContractService } from '../../../services/contract.js';

export default async function contractRoutes(fastify: FastifyInstance) {
  const contractService = new ContractService(fastify.prisma);

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
        description: 'Deploy a new smart contract to the network',
        params: Type.Object({
          networkId: Type.String({
            description: 'The ID of the network where to deploy the contract',
          }),
        }),
        body: Type.Object({
          contractName: Type.String({ description: 'The name of the contract to deploy' }),
          contractContent: Type.String({ description: 'The Solidity code of the contract' }),
        }),
        response: {
          200: Type.Object({
            result: Type.String({
              description: 'The deployment result including the contract address',
            }),
          }),
          500: Type.Object({
            error: Type.String({ description: 'Error message if the deployment fails' }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { networkId } = request.params as { networkId: string };
      const { contractName, contractContent } = request.body as {
        contractName: string;
        contractContent: string;
      };

      try {
        const result = await contractService.deployContract(
          networkId,
          Buffer.from(contractContent),
          contractName,
        );
        return { result };
      } catch (error: any) {
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
}
