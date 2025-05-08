// src/services/queueManager.ts
import { Queue } from 'bullmq';

import { redisConfig } from '../config/redisConfig.js';

// A simple registry for all your queues
const queues: Record<string, Queue> = {};

/**
 * Get or create a named queue.
 * Calling this in one place ensures all parts of your app
 * are looking at the same Queue instance.
 */
export function getQueue(name: string): Queue {
  if (!queues[name]) {
    queues[name] = new Queue(name, { connection: redisConfig });
  }
  return queues[name];
}

/**
 * Optionally initialize any default queues at startup:
 */
['default', 'email', 'notifications'].forEach((n) => getQueue(n));

export function listQueueNames(): string[] {
  return Object.keys(queues);
}
