export const NodeSchema = {
  getNodesByNetworkId: {
    tags: ['Nodes'],
    params: {
      type: 'object',
      properties: {
        networkId: { type: 'string' },
      },
    },
  },
};
