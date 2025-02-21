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
