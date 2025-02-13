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

  createServer: {
    tags: ['Container'],
    body: {
      type: 'object',
      properties: {
        createServerPayload: {
          type: 'object',
          properties: {
            resourceGroup: { type: 'string' },
            vmName: { type: 'string' },
            adminUsername: { type: 'string' },
            sshKeyName: { type: 'string' },
            userEmail: { type: 'string', format: 'email' },
          },
          required: ['resourceGroup', 'vmName', 'adminUsername', 'sshKeyName', 'userEmail'],
        },
      },
      required: ['createServerPayload'],
    },
  },
};
