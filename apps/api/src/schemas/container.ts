export const ContainerSchema = {
  createNetwork: {
    tags: ['Container'],
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
  },

  generateDockerCompose: {
    tags: ['Container'],
    body: {
      type: 'object',
      properties: {
        networId: { type: 'string' },
      },
      required: ['networId'],
    },
  },

  startNetwork: {
    tags: ['Container'],
    body: {
      type: 'object',
      properties: {
        networId: { type: 'string' },
      },
      required: ['networId'],
    },
  },

  getLogs: {
    tags: ['Container'],
    params: {
      type: 'object',
      properties: {
        networkId: { type: 'string' },
      },
      required: ['networkId'],
    },
  },
};
