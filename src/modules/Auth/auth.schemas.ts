const commonResponse = {
  statusCode: { type: 'number' },
  error: { type: ['string'] },
  message: { type: 'string' },
};

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
        rememberMe: { type: 'boolean' }
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

export const registerSchema = {
  schema: {
    description: 'Register user',
    summary: 'Route for registering user',
    body: {
      type: 'object',
      required: ['email', 'password', 'firstName', 'lastName'],
      properties: {
        email: { type: 'string' },
        password: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        phone: { type: 'string' }
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

export const checkAuthSchema = {
  description: 'Check that user is Authenticated',
  summary: 'Check that user is Authenticated',
  schema: {
    response: {
      200: {
        type: 'object',
        required: ['message', 'statusCode'],
        properties: {
          ...commonResponse,
          user: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              email: { type: 'string' },
              phone: { type: 'string' },
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              image: { type: 'string' },
              role: { type: 'string' },
              thumb: { type: 'string' },
              language: { type: 'string' },
              emailConfirmed: { type: 'boolean' },
              phoneConfirmed: { type: 'boolean' },
              isActive: { type: 'boolean' },
              sellerApprovedAt: { type: 'string' },
              isSellerApproved: { type: 'boolean' },
              isSellerCompleted: { type: 'boolean' },
              isSellerInfoFilled: { type: 'boolean' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
              deletedAt: { type: 'string' },
              url: { type: 'string' },
            },
          },
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