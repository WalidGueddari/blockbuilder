import { start } from 'repl';

export const blockchainSchema = {
  setupNetwork: {
    tags: ['blockchain'],
    body: {
      type: 'object',
      properties: {
        // vmId: { type: 'string' },
        initNetPayload: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            userId: { type: 'string' },
            nodeCount: { type: 'number' },
          },
          required: ['name', 'userId', 'nodeCount'],
        },
      },
      required: ['initNetPayload'],
    },
  },

  startNetwork: {
    tags: ['blockchain'],
    body: {
      type: 'object',
      properties: {
        payload: {
          type: 'object',
          properties: {
            networkId: { type: 'string' },
            nodeCount: { type: 'number' },
            vmId: { type: 'string' },
          },
          required: ['networkId', 'nodeCount', 'vmId'],
        },
      },
      required: ['payload'],
    },
  },
};
