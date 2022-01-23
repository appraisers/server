import { commonResponse } from '../../common/common.schemas';

export const checkReviewSchema = {
  description: 'Check is user has reviews',
  summary: 'Check is user has reviews',
  schema: {
    response: {
      200: {
        type: 'object',
        required: ['message', 'statusCode'],
        properties: {
          ...commonResponse,
          reviews: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              description: { type: 'string' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
              deletedAt: { type: 'string' },
            },
          },
        },
      },
      '4xx': { $ref: 'commonErrorSchema#' },
      '5xx': { $ref: 'commonErrorSchema#' },
    },
  },
};
