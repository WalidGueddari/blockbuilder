export const ServerShcema = {
  createServer: {
    tags: ['Server'],
    body: {
      type: 'object',
      properties: {
        payload: {
          type: 'object',
          properties: {
            resourceGroup: { type: 'string' },
            userId: { type: 'string' },
            vmName: { type: 'string' },
            // adminUsername: { type: 'string' },
            sshKeyName: { type: 'string' },
            // sshEmail: { type: 'string', format: 'email' },
            // sshKeyDir: { type: 'string' },
          },
          required: ['userId', 'resourceGroup', 'vmName', 'sshKeyName'],
        },
      },
      required: ['payload'],
    },
  },

  setupDockerAndNginx: {
    tags: ['Server'],
    body: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        networkId: { type: 'string' },
      },
      required: ['id', 'networkId'],
    },
  },
};
