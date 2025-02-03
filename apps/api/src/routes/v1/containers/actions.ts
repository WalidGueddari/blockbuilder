import { FastifyPluginAsync } from 'fastify';

import { config } from '../../../config.js';
import { ContainerSchema } from '../../../schemas/container.js';
import { ContainerService } from '../../../services/containers.js';
import { NewtorkSevice } from '../../../services/network.js';
import { InitNetworkPayload } from '../../../types/network.js';

const routes: FastifyPluginAsync = async (fastify, opts) => {
  const { prisma } = fastify;
  const containerService = new ContainerService({ prisma });
  const networkService = new NewtorkSevice({ prisma });
  const { bootnodeIndex } = config;

  fastify.post<{ Body: { initNetPayload: InitNetworkPayload } }>(
    '/build-network',
    {
      schema: ContainerSchema.createNetwork,
    },
    async (request, reply) => {
      try {
        const { initNetPayload } = request.body;
        const initNetwork = await networkService.initNetwork(initNetPayload);

        if (!initNetwork) {
          throw new Error('Network initialization failed');
        }

        await containerService.SetUpNetwork(initNetwork.nodeCount, initNetwork.id);
        const dockerComposeBootNode = await containerService.generateDockerComposeFile(
          true,
          initNetwork.id,
        );
        const bootEnodeUrl = await containerService.createEnodeUrl(initNetwork.id, bootnodeIndex);
        const dockerComposeNode = await containerService.generateDockerComposeFile(
          false,
          initNetwork.id,
          bootEnodeUrl,
          initNetwork.nodeCount,
        );

        await containerService.runNode(initNetwork.id, initNetwork.nodeCount);

        const Outputs = {
          Network: initNetwork,
          EnodeURL: bootEnodeUrl,
          bootNodeOutput: dockerComposeBootNode,
          nodesOutput: dockerComposeNode,
          // startNetwork,
        };

        return reply.send({ success: true, Outputs });
      } catch (error: any) {
        console.error('Full error:', error);
        return reply.status(500).send({
          success: false,
          error: `Unexpected error: ${error.message}\nFull error: ${error}`,
        });
      }
    },
  );

  fastify.post<{ Body: { networId: string } }>(
    '/start-network',
    {
      schema: ContainerSchema.startNetwork,
    },
    async (request, reply) => {
      try {
        const { networId } = request.body;
        const network = await networkService.getNetworkById(networId);

        if (!network) {
          throw new Error('Network not found');
        }

        const startNetwork = await containerService.runNode(network.id, network.nodeCount);

        if (!startNetwork) {
          throw new Error('Network start failed');
        }

        return reply.send({ success: true, startNetwork });
      } catch (error: any) {
        console.error('Full error:', error);
        return reply.status(500).send({
          success: false,
          error: `Unexpected error: ${error.message}\nFull error: ${error}`,
        });
      }
    },
  );

  fastify.get<{ Params: { container: string } }>(
    '/ws/get_logs/:container',
    {
      websocket: true, // Tell Fastify to upgrade to WebSocket
      // schema: ContainerSchema.getLogs, // you can leave schema out for WS
    },
    async (connection, req) => {
      // --------------------------------------------
      // 1. Log that the route handler has been invoked
      // --------------------------------------------
      console.log('>>> WebSocket route handler invoked!');
      try {
        const { container } = req.params;

        // Spawn the Docker logs process
        const logProcess = containerService.getLogs(container);

        // Handle stdout data
        logProcess.stdout.on('data', (data) => {
          const logMessage = data.toString();
          console.log(`>>> Sending log to client: ${logMessage.trim()}`);
          connection.socket.send(JSON.stringify({ success: true, log: logMessage.trim() }));
        });

        // Handle stderr data
        logProcess.stderr.on('data', (data) => {
          const errorMessage = data.toString();
          console.error(`>>> Error from Docker logs: ${errorMessage.trim()}`);
          connection.socket.send(JSON.stringify({ success: false, error: errorMessage.trim() }));
        });

        // Handle process close
        logProcess.on('close', (code) => {
          console.log(`>>> Docker logs process exited with code ${code}`);
          connection.socket.send(
            JSON.stringify({ success: false, message: 'Log streaming ended.' }),
          );
          connection.socket.close();
        });

        // Handle WebSocket close from client
        connection.socket.on('close', () => {
          console.log('>>> WebSocket connection closed by client');
          logProcess.kill(); // Terminate the Docker logs process
        });

        // Handle WebSocket errors
        connection.socket.on('error', (err) => {
          console.error('>>> WebSocket error:', err);
          logProcess.kill(); // Terminate the Docker logs process on error
        });
      } catch (error: any) {
        console.error('>>> Error:', error);
        connection.socket.send(JSON.stringify({ success: false, error: error.message }));
        connection.socket.close();
      }
    },
  );
};

export default routes;
