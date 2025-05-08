import type { WebSocket } from 'ws';

export const jobSubscribers = new Map<string, Set<WebSocket>>();

export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  FAILED = 'FAILED',
}

export const azureAdminUsername = 'azureuser';
