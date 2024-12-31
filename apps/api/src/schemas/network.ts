export const networkSchema = {
  //schema for creating a network
  createNetwork: {
    tags: ['Network'],
    body: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        nodeCount: { type: 'number' },
        consensus: { type: 'string' },
        userId: { type: 'string' },
      },
      required: ['name', 'nodeCount', 'consensus', 'userId'],
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          network: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              description: { type: 'string' },
              nodeCount: { type: 'number' },
              consensus: { type: 'string' },
              userId: { type: 'string' },
            },
          },
        },
      },
      500: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          error: { type: 'string' },
        },
      },
    },
  },
  // schema for deleting a network
  deleteNetwork: {
    tags: ['Networks'],
    params: {
      type: 'object',
      properties: {
        networkId: { type: 'string' },
      },
      required: ['networkId'],
    },
  },

  // schema for getting user networks
  getUserNetworks: {
    tags: ['Networks'],
    params: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
      },
      required: ['userId'],
    },
  },

  // schema for stopping a network
  stopNetwork: {
    tags: ['Networks'],
    params: {
      type: 'object',
      properties: {
        networkId: { type: 'string' },
      },
      required: ['networkId'],
    },
  },
  decrementNodeCount: {
    tags: ['Networks'],
    params: {
      type: 'object',
      properties: {
        networkId: { type: 'string' },
      },
      required: ['networkId'],
    },
  },
};
