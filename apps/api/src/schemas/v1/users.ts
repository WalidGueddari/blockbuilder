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
        isActive: { type: 'boolean' },
        page: { type: 'integer', minimum: 1, default: 1 }, // Page number
        limit: { type: 'integer', minimum: 1, default: 10 }, // Page size
        date: { type: 'string', format: 'date', nullable: true },
        search: { type: 'string' }, // Optional search filter
      },
      // required: ['status'], // Ensure status is always provided
    },
  },
};
