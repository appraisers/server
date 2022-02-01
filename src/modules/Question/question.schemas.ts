import { commonResponse } from '../../common/common.schemas';


export const registrationSchema = {
  schema: {
    description: 'Registration question',
    summary: 'Route for registration in question',
    body: {
      type: 'object',
      required: ['description', 'category', 'height'],
      properties: {
        description: { type: 'string' },
        category: { type: 'string' },
        height: { type: 'num' },
      },
    },
    response: {
      200: {
        type: 'object',
        required: ['statusCode', 'message'],
        properties: {
          ...commonResponse,
          question: {
            type: 'object',
            properties: {
              description: { type: 'string' },
              category: { type: 'string' },
              height: { type: 'num' },
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
