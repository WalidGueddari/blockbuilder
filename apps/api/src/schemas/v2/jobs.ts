export const jobSchema = {
  getJobsByUserId: {
    tags: ['Jobs'],
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
  },
};
