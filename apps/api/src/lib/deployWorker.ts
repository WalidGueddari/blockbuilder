// apps/api/src/lib/deployWorker.ts
import { PrismaClient } from '@saas-monorepo/database';
import { Queue, Worker } from 'bullmq';
import { Redis as RedisClient } from 'ioredis';

import { redisConfig } from '../config/redisConfig.js';
import { JobService } from '../services/job.js';

// 1) Create a standalone Redis client for publishing
const redisClient = new RedisClient(redisConfig);

// 2) Reuse a single Prisma client
const prisma = new PrismaClient();

// 3) Pass both prisma & redis into your JobService
const jobService = new JobService({ prisma, redis: redisClient });

const deployWorker = new Worker(
  'deploy-network', // the name of your queue
  async (job) => {
    const { payload, networkId, jobId } = job.data as {
      payload: any;
      networkId: string;
      jobId: string;
    };
    console.log('Deploying network with payload:', payload);
    await jobService.deployNetworkSteps(payload, networkId, jobId);
  },
  {
    connection: redisConfig, // this is for BullMQ’s own queue connection
    concurrency: 2,
    lockDuration: 30 * 60 * 1000, // 30 minutes
  },
);

const deployQueue = new Queue('deploy-network', { connection: redisConfig });

async function listAllDeployJobs() {
  // possible states: 'waiting' | 'active' | 'delayed' | 'completed' | 'failed' | 'paused'
  const jobs = await deployQueue.getJobs(
    ['waiting', 'active', 'delayed', 'completed', 'failed'],
    0,
    -1, // from first to last
    false, // set to true if you need full job data/deepClone
  );

  console.log(`\n📋 [deploy-network] Total jobs: ${jobs.length}`);
  jobs.forEach((j) => {
    console.log(` • [${j.id}] (${j.name}) state=${j.getStateSync?.() ?? 'unknown'}`, {
      progress: j.progress,
      timestamp: new Date(j.timestamp).toISOString(),
    });
  });
  console.log();
}

deployWorker.on('completed', async (job) => {
  console.log(`✅ Job ${job.id} completed successfully.`);
  const listJobs = await listAllDeployJobs();
  console.log(`\n📋 [deploy-network] Total jobs: ${listJobs}`);
});

deployWorker.on('failed', async (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err);
  const listJobs = await listAllDeployJobs();
  console.log(`\n📋 [deploy-network] Total jobs: ${listJobs}`);
});

deployWorker.on('progress', async (job, progress) => {
  console.log(`📈 Job ${job.id} progress:`, progress);
  const listJobs = await listAllDeployJobs();
  console.log(`\n📋 [deploy-network] Total jobs: ${listJobs}`);
});

process.on('SIGUSR1', () => {
  console.log('SIGUSR1 received—listing all deploy-network jobs:');
  listAllDeployJobs().catch(console.error);
});

// optional: clean up the Redis publisher on process exit
process.on('SIGINT', async () => {
  await redisClient.quit();
  process.exit(0);
});

export { deployWorker };
