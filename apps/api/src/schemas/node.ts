export const nodeSchema = {
  createNodes: {
    tags: ['Nodes'],
    body: {
      type: 'object',
      properties: {
        nodesNumber: { type: 'number' },
      },
      required: ['nodesNumber'],
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          output: { type: 'string' },
        },
        required: ['success', 'output'],
      },
      500: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          error: { type: 'string' },
        },
        required: ['success', 'error'],
      },
    },
  },
  createNetwork: {
    tags: ['network'],
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
  },
};
