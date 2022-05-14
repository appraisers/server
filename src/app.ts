import path from 'path';
import fastify, { FastifyInstance } from 'fastify';
import 'reflect-metadata';
import fastifyJWT from 'fastify-jwt';
import fastifyFormbody from '@fastify/formbody';
import fastifyCors from 'fastify-cors';
import multer from 'fastify-multer';
import * as fastifyTypeormPlugin from 'fastify-typeorm-plugin';
import fastifyStatic from '@fastify/static';

import config from './config';

import authRoutes from './modules/Auth/auth.routes';
import reviewRoutes from './modules/Review/review.routes';
import userRoutes from './modules/User/user.routes';
import questionRoutes from './modules/Question/question.routes';
import appraiseRoutes from './modules/Appraise/appraise.routes';

let app: FastifyInstance = fastify({
  pluginTimeout: 20000, // resolve problem "Error: ERR_AVVIO_PLUGIN_TIMEOUT: plugin did not start in time ..."
});

export default function build(): FastifyInstance {
  app.register(fastifyCors);
  app.register(fastifyFormbody, {
    bodyLimit: 104857600,
  });
  app.register(fastifyTypeormPlugin as any, config.MAIN_DB);
  app.register(fastifyJWT, {
    secret: config.JWT_SECRET,
  });
  app.register(fastifyStatic, {
    root: path.join(__dirname, 'public'),
    list: true,
    prefix: '/public/', // optional: default '/'
  });
  app.register(multer.contentParser);

  app.ready((err) => {
    if (err instanceof Error) throw err;
  });

  app.addSchema({
    $id: 'commonErrorSchema',
    type: 'object',
    required: ['message', 'statusCode'],
    properties: {
      statusCode: { type: 'number' },
      error: { type: ['string'] },
      message: { type: 'string' },
    },
  });

  // ROUTER FILES
  app.register(authRoutes, { prefix: '/api/auth' });
  app.register(reviewRoutes, { prefix: '/api/review' });
  app.register(userRoutes, { prefix: '/api/user' });
  app.register(questionRoutes, { prefix: '/api/question' });
  app.register(appraiseRoutes, { prefix: '/api/appraise' });

  app.get('/', async () => {
    return {
      work: true,
    };
  });

  // ERROR HANDLER
  app.setErrorHandler((error, request, reply: any) => {
    try {
      if (error instanceof Error) {
        const errObj = JSON.parse(error.message);
        return reply.status(400).send(errObj);
      }
      console.log("Error handler", error);
    } catch (err) {
      reply
        .status(500)
        .send({ statusCode: 500, message: error.message || 'Unknown error' });
    }
  });
  return app;
}
