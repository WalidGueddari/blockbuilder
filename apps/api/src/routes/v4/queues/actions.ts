import { FastifyPluginAsync } from 'fastify';

import { getQueue, listQueueNames } from '../../../services/queueManager.js';

const routes: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', async (request, reply) => {
    const data = await Promise.all(
      listQueueNames().map(async (name) => {
        const q = getQueue(name);
        const counts = await q.getJobCounts();
        return { name, counts };
      }),
    );
    return { queues: data };
  });

  // Get detailed info for one queue
  fastify.get('/:name', async (request, reply) => {
    const { name } = request.params as { name: string };
    try {
      const q = getQueue(name);
      const counts = await q.getJobCounts();
      // fetch up to 10 waiting or active jobs as example

      const jobs = await q.getJobs(
        ['waiting', 'active', 'delayed', 'completed', 'failed', 'paused'],
        0,
        9,
      );
      return { name, counts, jobs };
    } catch {
      reply.code(404);
      return { error: 'Queue not found' };
    }
  });

  // Pause (stop) processing
  fastify.post('/:name/stop', async (request, reply) => {
    const { name } = request.params as { name: string };
    const q = getQueue(name);
    await q.pause();
    return { status: 'paused' };
  });

  // Resume processing
  fastify.post('/:name/resume', async (request, reply) => {
    const { name } = request.params as { name: string };
    const q = getQueue(name);
    await q.resume();
    return { status: 'resumed' };
  });

  // Clear all waiting/delayed jobs
  fastify.post('/:name/clear', async (request, reply) => {
    const { name } = request.params as { name: string };
    const q = getQueue(name);
    await q.drain();
    return { status: 'cleared' };
  });

  // Delete (obliterate) the queue and remove it from registry
  fastify.delete('/:name', async (request, reply) => {
    const { name } = request.params as { name: string };
    const q = getQueue(name);
    await q.obliterate({ force: true });
    // Define queues or remove this line if unnecessary
    // delete (queues as any)[name]  // cleanup registry
    return { status: 'deleted' };
  });
};

export default routes;
