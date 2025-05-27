import { get } from 'lodash';

export const getLoggedUserDataSchema = {
  tags: ['users'],
  response: {
    200: {
      description: 'Successful response',
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
      },
    },
    '4xx': {
      type: 'object',
      properties: {
        status: { type: 'number' },
        code: { type: 'string' },
        message: { type: 'string' },
      },
    },
    500: {
      description: 'Error response',
      type: 'object',
      properties: {
        status: { type: 'number', default: 500 },
        code: { type: 'string' },
        message: { type: 'string' },
      },
    },
  },
};

export const UserSchema = {
  updateUserStatus: {
    tags: ['Admin'],
    params: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
      },
      required: ['userId'],
    },
    body: {
      type: 'object',
      properties: {
        code: { type: 'string' },
      },
      required: ['code'],
    },
    response: {
      200: {
        description: 'Successful response',
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string' },
        },
      },
      '4xx': {
        type: 'object',
        properties: {
          status: { type: 'number' },
          code: { type: 'string' },
          message: { type: 'string' },
        },
      },
      500: {
        description: 'Error response',
        type: 'object',
        properties: {
          status: { type: 'number', default: 500 },
          code: { type: 'string' },
          message: { type: 'string' },
        },
      },
    },
  },

  deactivateUser: {
    tag: ['Admin'],
    params: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
      },
      required: ['userId'], // Ensure userId is always provided
    },
  },

  getAllUsers: {
    tags: ['Admin'],
    querystring: {
      type: 'object',
      properties: {
        isActive: { type: 'boolean', nullable: true }, // Optional status filter - null means all users
        page: {
          type: 'integer',
          minimum: 1,
          description: 'Page number, must be a positive integer',
        }, // Page number
        limit: {
          type: 'integer',
          minimum: 1,
          description: 'Page size, must be a positive integer',
        }, // Page size
        date: { type: 'string', format: 'date', nullable: true },
        search: { type: 'string', nullable: true }, // Optional search filter
      },
      required: [], // No required properties, since they are optional
      additionalProperties: false, // Disallow other properties not defined in the schema
    },
  },
};
