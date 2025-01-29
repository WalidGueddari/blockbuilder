export const networkSchema = {
  getNetworksByUserId: {
    tags: ['Network'],
    params: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
      },
      required: ['userId'],
    },
    querystring: {
      type: 'object',
      properties: {
        page: { type: 'string', default: '1' },
        limit: { type: 'string', default: '10' },
      },
    },
    // response: {
    //   200: {
    //     type: 'object',
    //     properties: {
    //       success: { type: 'boolean' },
    //       data: {
    //         type: 'array',
    //         items: {
    //           // Define the structure of your network items here
    //           type: 'object',
    //           properties: {
    //             id: { type: 'string' },
    //             name: { type: 'string' },
    //             create_at: { type: 'string', format: 'date-time' },
    //             // Add other relevant fields
    //           },
    //           required: ['id', 'name', 'create_at'], // Adjust as needed
    //         },
    //       },
    //       pagination: {
    //         type: 'object',
    //         properties: {
    //           page: { type: 'number' },
    //           limit: { type: 'number' },
    //           pages: { type: 'number' },
    //           total: { type: 'number' },
    //           next: { type: ['number', 'null'] },
    //           prev: { type: ['number', 'null'] },
    //         },
    //         required: ['page', 'limit', 'pages', 'total', 'next', 'prev'],
    //       },
    //     },
    //     required: ['success', 'data', 'pagination'],
    //   },
    //   500: {
    //     type: 'object',
    //     properties: {
    //       success: { type: 'boolean' },
    //       error: { type: 'string' },
    //     },
    //     required: ['success', 'error'],
    //   },
    // },
  },
};
