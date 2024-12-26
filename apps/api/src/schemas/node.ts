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
};
