import { FastifyPluginAsync } from 'fastify';

import { config } from '../../../config.js';
import { jobSubscribers } from '../../../constants.js';
import { ContainerService } from '../../../services/containers.js';
// import { JobService } from '../../../services/job.js';
import { NodeService } from '../../../services/nodes.js';

const routes: FastifyPluginAsync = async (fastify, opts) => {
  const { prisma } = fastify;
  const containerService = new ContainerService({ prisma });
  const nodeService = new NodeService({ prisma });
  // const jobService = new JobService({ prisma });

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
          // console.log(`>>> Sending log to client: ${logMessage}`);
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

  fastify.get<{ Params: { id: string } }>('/jobs/:id', { websocket: true }, (connection, req) => {
    const { id: jobId } = req.params;
    const ip = req.ip;

    /* ─── Register the socket ─────────────────────────────────────────── */
    if (!jobSubscribers.has(jobId)) jobSubscribers.set(jobId, new Set());
    const set = jobSubscribers.get(jobId)!;
    set.add(connection.socket);

    console.log(`[WS] +1  job=${jobId} | now=${set.size} | ip=${ip}`);

    /* ─── Send initial payload with full job object ──────────────────── */
    (async () => {
      try {
        // 1. Fetch the job from Prisma
        const job = await fastify.prisma.job.findUnique({
          where: { id: jobId },
        });

        // 2. Build a JSON-friendly view of the subscriber map
        const subsSnapshot = Object.fromEntries(
          [...jobSubscribers.entries()].map(([id, sockets]) => [id, sockets.size]),
        );

        // 3. Ship it to the client
        connection.socket.send(
          JSON.stringify({
            event: 'subscribed',
            job,
            subscribers: set.size,
            allSubscribers: subsSnapshot,
          }),
        );
      } catch (err) {
        console.error('Failed to fetch job on subscribe:', err);
        connection.socket.send(JSON.stringify({ event: 'error', message: 'Job lookup failed' }));
      }
    })();

    /* ─── Clean-up on disconnect ──────────────────────────────────────── */
    connection.socket.once('close', () => {
      set.delete(connection.socket);
      if (set.size === 0) jobSubscribers.delete(jobId);

      console.log(`[WS] −1  job=${jobId} | now=${set.size} | ip=${ip}`);
    });
  });
};
export default routes;
