import { commonResponse } from '../../common/common.schemas';

export const loginSchema = {
  schema: {
    description: 'Login user',
    summary: 'Route for logging in user',
    body: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string' },
        password: { type: 'string' },
        rememberMe: { type: 'boolean' },
      },
    },
    response: {
      200: {
        type: 'object',
        required: ['authToken', 'refreshToken', 'statusCode', 'message'],
        properties: {
          ...commonResponse,
          authToken: { type: 'string' },
          refreshToken: { type: 'string' },
        },
      },
      400: {
        type: 'object',
        required: ['statusCode', 'message'],
        properties: {
          ...commonResponse,
        },
      },
      '4xx': { $ref: 'commonErrorSchema#' },
      '5xx': { $ref: 'commonErrorSchema#' },
    },
  },
};

export const registrationSchema = {
  schema: {
    description: 'Registration user',
    summary: 'Route for registration in user',
    body: {
      type: 'object',
      required: ['email', 'password', 'fullname', 'workplace'],
      properties: {
        email: { type: 'string' },
        fullname: { type: 'string' },
        workplace: { type: 'string' },
        password: { type: 'string' },
      },
    },
    response: {
      200: {
        type: 'object',
        required: ['statusCode', 'message'],
        properties: {
          ...commonResponse,
          user: {
            type: 'object',
            properties: {
              email: { type: 'string' },
              fullname: { type: 'string' },
              workplace: { type: 'string' },
              password: { type: 'string' },
            },
          },
        },
      },
      400: {
        type: 'object',
        required: ['statusCode', 'message'],
        properties: {
          ...commonResponse,
        },
      },
      '4xx': { $ref: 'commonErrorSchema#' },
      '5xx': { $ref: 'commonErrorSchema#' },
    },
  },
};

export const confirmSchema = {
  schema: {
    description: 'Confirm user',
    summary: 'Route for confirm user by email or phone',
    response: {
      200: {
        type: 'object',
        required: ['statusCode', 'message'],
        properties: {
          ...commonResponse,
        },
      },
      '4xx': { $ref: 'commonErrorSchema#' },
      '5xx': { $ref: 'commonErrorSchema#' },
    },
  },
};

export const forgotPasswordSchema = {
  schema: {
    description: 'Forgot password user',
    summary: 'Route for send on email Forgot password token',
    body: {
      type: 'object',
      required: ['email'],
      properties: {
        email: { type: 'string' },
      },
    },
    response: {
      200: {
        type: 'object',
        required: ['statusCode', 'message'],
        properties: {
          ...commonResponse,
        },
      },
      '4xx': { $ref: 'commonErrorSchema#' },
      '5xx': { $ref: 'commonErrorSchema#' },
    },
  },
};

export const refreshTokensSchema = {
  description: 'Update access and refresh tokens',
  summary: 'Route for refreshing a tokens',
  schema: {
    body: {
      type: 'object',
      required: ['refreshToken'],
      properties: {
        refreshToken: { type: 'string' },
      },
    },
    response: {
      200: {
        type: 'object',
        required: ['authToken', 'refreshToken', 'statusCode', 'message'],
        properties: {
          ...commonResponse,
          authToken: { type: 'string' },
          refreshToken: { type: 'string' },
        },
      },
      '4xx': { $ref: 'commonErrorSchema#' },
      '5xx': { $ref: 'commonErrorSchema#' },
    },
  },
};

export const resetPasswordSchema = {
  description: 'Reset Password tokens',
  summary: 'change user password by forgot token',
  schema: {
    body: {
      type: 'object',
      required: ['token', 'password'],
      properties: {
        token: { type: 'string' },
        password: { type: 'string' },
      },
    },
    response: {
      200: {
        type: 'object',
        required: ['statusCode', 'message'],
        properties: {
          ...commonResponse,
        },
      },
      '4xx': { $ref: 'commonErrorSchema#' },
      '5xx': { $ref: 'commonErrorSchema#' },
    },
  },
};
