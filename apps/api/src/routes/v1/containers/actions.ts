import { FastifyPluginAsync } from 'fastify';

import { config } from '../../../config.js';
import { ContainerSchema } from '../../../schemas/container.js';
import { ServerShcema } from '../../../schemas/server.js';
import { ContainerService } from '../../../services/containers.js';
import { NewtorkSevice } from '../../../services/network.js';
import { ServerService } from '../../../services/server.js';
import { InitNetworkPayload } from '../../../types/network.js';
import { CreateAzureVMParams } from '../../../types/server.js';

const routes: FastifyPluginAsync = async (fastify, opts) => {
  const { prisma } = fastify;
  const containerService = new ContainerService({ prisma });
  const networkService = new NewtorkSevice({ prisma });
  const serverService = new ServerService({ prisma });

  const { bootnodeIndex } = config;

  fastify.post<{
    Body: { initNetPayload: InitNetworkPayload; payload: CreateAzureVMParams };
  }>(
    '/build-network',
    {
      schema: ContainerSchema.createNetwork,
    },
    async (request, reply) => {
      try {
        /***** Extracting payload from request body *****/
        const { initNetPayload, payload } = request.body;
        console.log('/***** Received initNetPayload and payload from request.body *****/');

        /***** Creating Azure VM Server *****/
        const VM = await serverService.createAzureVMServer(payload);
        console.log('/***** Azure VM created with id: ' + VM.id + ' *****/');

        /***** Setting up Docker and Nginx on the VM *****/
        const setupVm = await serverService.setupDockerAndNginx(VM.id);
        console.log('/***** Docker and Nginx setup completed for VM id: ' + VM.id + ' *****/');

        // const VM = { id: 'cm794olhd0001vvsvnajxaiv5' };
        // const initNetwork = { id: 'cm794q4vp0003vvsv4hsl8fck', nodeCount: 3 };

        /***** Initializing network *****/
        const initNetwork = await networkService.initNetwork(initNetPayload, VM.id);
        if (!initNetwork) {
          console.log('/***** Network initialization failed for VM id: ' + VM.id + ' *****/');
          throw new Error('Network initialization failed');
        }
        console.log(
          '/***** Network initialized with id: ' +
            initNetwork.id +
            ' and node count: ' +
            initNetwork.nodeCount +
            ' *****/',
        );

        /***** Setting up container network *****/
        await containerService.SetUpNetwork(initNetwork.nodeCount, initNetwork.id);
        console.log(
          '/***** Container network set up for network id: ' +
            initNetwork.id +
            ', node count: ' +
            initNetwork.nodeCount +
            ', and VM id: ' +
            VM.id +
            ' *****/',
        );

        /***** Generating Docker Compose file for boot node *****/
        const dockerComposeBootNode = await containerService.generateDockerComposeFile(
          true,
          initNetwork.id,
        );
        console.log(
          '/***** Docker Compose file generated for boot node for network id: ' +
            initNetwork.id +
            ' *****/',
        );

        /***** Creating Enode URL for boot node *****/
        const bootEnodeUrl = await containerService.createEnodeUrl(initNetwork.id, bootnodeIndex);
        console.log('/***** Enode URL created for boot node: ' + bootEnodeUrl + ' *****/');

        /***** Generating Docker Compose file for additional nodes *****/
        const dockerComposeNode = await containerService.generateDockerComposeFile(
          false,
          initNetwork.id,
          bootEnodeUrl,
          initNetwork.nodeCount,
        );
        console.log(
          '/***** Docker Compose file generated for nodes for network id: ' +
            initNetwork.id +
            ' *****/',
        );

        const transferDirectory = await serverService.transferDirectoryByName(
          VM.id,
          initNetwork.id,
        );
        console.log(
          '/***** Directory transferred to VM with id: ' + VM.id + ' *****/',
          transferDirectory,
        );

        /***** Running network nodes *****/
        await containerService.killBesuNode();
        await containerService.runNode(initNetwork.id, initNetwork.nodeCount, VM.id);
        console.log('/***** Network nodes started for network id: ' + initNetwork.id + ' *****/');

        const Outputs = {
          vm: VM,
          setupVm,
          Network: initNetwork,
          EnodeURL: bootEnodeUrl,
          transferDirectory,
          bootNodeOutput: dockerComposeBootNode,
          nodesOutput: dockerComposeNode,
        };

        console.log('/***** Build network process completed successfully *****/');
        return reply.send({ success: true, Outputs });
      } catch (error: any) {
        console.error('/***** Full error:', error, '*****/');
        return reply.status(500).send({
          success: false,
          error: `Unexpected error: ${error.message}\nFull error: ${error}`,
        });
      }
    },
  );

  fastify.get<{ Params: { container: string; vmId: string } }>(
    '/ws/get_logs/:container/:vmId',
    { websocket: true },
    async (connection, req) => {
      console.log('>>> WebSocket route handler invoked!');
      try {
        const { container, vmId } = req.params;
        // Here, you need to know which VM to target.
        // This example assumes you have a vmId available; adjust as needed.

        // Use the log retrieval method from your container service.
        const { stream, ssh } = await containerService.getRemoteLogs(container, vmId);

        // Forward data from the remote stream to the WebSocket client.
        stream.on('data', (data: Buffer) => {
          const logMessage = data.toString().trim();
          console.log(`>>> Sending log to client: ${logMessage}`);
          connection.socket.send(JSON.stringify({ success: true, log: logMessage }));
        });

        // If there is stderr data, forward that as well.
        if (stream.stderr) {
          stream.stderr.on('data', (data) => {
            const errorMessage = data.toString().trim();
            console.error(`>>> Remote stderr [${container}]: ${errorMessage}`);
            connection.socket.send(JSON.stringify({ success: false, error: errorMessage }));
          });
        }

        // When the stream closes, notify the client and dispose of the SSH connection.
        stream.on('close', (code: number) => {
          console.log(`>>> Remote docker logs stream exited with code ${code}`);
          connection.socket.send(
            JSON.stringify({ success: false, message: 'Log streaming ended.' }),
          );
          connection.socket.close();
          ssh.dispose();
        });

        // Clean up SSH when the client disconnects.
        connection.socket.on('close', () => {
          console.log('>>> WebSocket connection closed by client');
          ssh.dispose();
        });
        connection.socket.on('error', (err) => {
          console.error('>>> WebSocket error:', err);
          ssh.dispose();
        });
      } catch (error) {
        console.error('>>> Error:', error);
        let errorMessage = 'An unknown error occurred';
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        connection.socket.send(JSON.stringify({ success: false, error: errorMessage }));
        connection.socket.close();
      }
    },
  );

  fastify.get<{ Params: { container: string } }>(
    '/ws/get_logs/:container',
    {
      websocket: true,
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
