export const nodeSchema = {
  createNodes: {
    tags: ['Nodes'],
    body: {
      type: 'object',
      properties: {
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
    // response: {
    //   200: {
    //     type: 'object',
    //     properties: {
    //       success: { type: 'boolean' },
    //       network: {
    //         type: 'object',
    //         properties: {
    //           id: { type: 'string' },
    //           name: { type: 'string' },
    //           nodes: { type: 'array', items: { type: 'object' } }, // Adjust based on your `network` structure
    //         },
    //       },
    //     },
    //   },
    //   500: {
    //     type: 'object',
    //     properties: {
    //       success: { type: 'boolean' },
    //       error: { type: 'string' },
    //     },
    //   },
    // },
  },

  generateDockerCompose: {
    tags: ['Nodes'],
    body: {
      type: 'object',
      properties: {
        networId: { type: 'string' },
      },
      required: ['networId'],
    },
  },

  startNetwork: {
    tags: ['Nodes'],
    body: {
      type: 'object',
      properties: {
        networId: { type: 'string' },
      },
      required: ['networId'],
    },
  },
};
