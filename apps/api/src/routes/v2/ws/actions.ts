import { FastifyPluginAsync } from 'fastify';

import { ContainerService } from '../../../services/containers.js';

const routes: FastifyPluginAsync = async (fastify, opts) => {
  const { prisma } = fastify;
  const containerService = new ContainerService({ prisma });

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
};
export default routes;
