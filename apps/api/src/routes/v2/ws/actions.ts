import { FastifyPluginAsync } from 'fastify';

import { config } from '../../../config.js';
import { ContainerService } from '../../../services/containers.js';
import { JobSevice } from '../../../services/job.js';
import { NodeService } from '../../../services/nodes.js';

const routes: FastifyPluginAsync = async (fastify, opts) => {
  const { prisma } = fastify;
  const containerService = new ContainerService({ prisma });
  const nodeService = new NodeService({ prisma });
  const jobService = new JobSevice({ prisma });

  const POLL_INTERVAL = config.pollingInterval;
  fastify.get<{ Params: { container: string; vmId: string } }>(
    '/get-logs/:container/:vmId',
    { websocket: true },
    async (connection, req) => {
      console.log('>>> WebSocket route handler invoked!');
      try {
        const { container, vmId } = req.params;

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

  fastify.get<{ Params: { id: string } }>(
    '/get-status/:id',
    { websocket: true },
    async (connection, req) => {
      console.log('>>> get-status WebSocket route handler invoked!');
      try {
        const { id } = req.params;

        // Poll the database every 3 seconds to retrieve node status
        const intervalId = setInterval(async () => {
          try {
            const status = await nodeService.getNodeStatus(id);

            connection.socket.send(
              JSON.stringify({
                success: true,
                data: status,
              }),
            );
          } catch (err) {
            console.error('>>> Error fetching node status:', err);
            connection.socket.send(
              JSON.stringify({
                success: false,
                error: `Failed to retrieve node status: ${String(err)}`,
              }),
            );
          }
        }, POLL_INTERVAL);

        // Clean up when client disconnects
        connection.socket.on('close', () => {
          console.log('>>> WebSocket connection closed by client');
          clearInterval(intervalId);
        });

        connection.socket.on('error', (err) => {
          console.error('>>> WebSocket error:', err);
          clearInterval(intervalId);
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

  fastify.get<{ Params: { id: string } }>(
    '/get-status-job/:id',
    { websocket: true },
    async (connection, req) => {
      console.log('>>> get-status WebSocket route handler invoked!');
      try {
        const { id } = req.params;

        // Poll the database every 3 seconds to retrieve node status
        const intervalId = setInterval(async () => {
          try {
            const job = await jobService.getJob(id);

            connection.socket.send(
              JSON.stringify({
                success: true,
                data: {
                  jobId: job.id,
                  status: job.status,
                  networkName: job.Network?.name,
                },
              }),
            );
          } catch (err) {
            console.error('>>> Error fetching job status:', err);
            connection.socket.send(
              JSON.stringify({
                success: false,
                error: `Failed to retrieve job status: ${String(err)}`,
              }),
            );
          }
        }, POLL_INTERVAL);

        // Clean up when client disconnects
        connection.socket.on('close', () => {
          console.log('>>> WebSocket connection closed by client');
          clearInterval(intervalId);
        });

        connection.socket.on('error', (err) => {
          console.error('>>> WebSocket error:', err);
          clearInterval(intervalId);
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
};
export default routes;
