export const NodeSchema = {
  getNodesByNetworkId: {
    tags: ['Nodes'],
    params: {
      type: 'object',
      properties: {
        networkId: { type: 'string' },
      },
      required: ['networkId'],
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          nodes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                status: { type: 'string' },
                networkId: { type: 'string' },
                network: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    blockscoutServerId: { type: 'string' },
                    serverId: { type: 'string' },
                    genesisId: { type: 'string' },
                    allocsId: { type: 'string' },
                  },
                },
              },
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
  getNodeById: {
    tags: ['Nodes'],
    params: {
      type: 'object',
      properties: {
        nodeId: { type: 'string' },
      },
      required: ['nodeId'],
    },
  },
};
