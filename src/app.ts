import path from 'path';
import fastify, { FastifyInstance } from 'fastify';
import 'reflect-metadata';
import fastifyJWT from 'fastify-jwt';
import fastifySwagger from 'fastify-swagger';
import fastifyFormbody from 'fastify-formbody';
import fastifyCors from 'fastify-cors';
import multer from 'fastify-multer';
import * as fastifyTypeormPlugin from 'fastify-typeorm-plugin';
import fastifyStatic from 'fastify-static';

import config from './config';

import authRoutes from './modules/Auth/auth.routes';
import reviewRoutes from './modules/Review/review.routes';
import userRoutes from './modules/User/user.routes';
import questionRoutes from './modules/Question/question.routes';

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
  app.register(fastifySwagger, {
    routePrefix: '/documentation',
    swagger: {
      info: {
        title: 'Test swagger',
        description: 'testing the fastify swagger api',
        version: '0.1.0',
      },
      externalDocs: {
        url: 'https://swagger.io',
        description: 'Find more info here',
      },
      host: 'localhost',
      schemes: ['http', 'https'],
      consumes: ['application/json'],
      produces: ['application/json'],
      tags: [
        { name: 'auth', description: 'Auth related end-points' },
        { name: 'user', description: 'User related end-points' },
      ],
      securityDefinitions: {
        Authorization: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header',
        },
      },
    },
    exposeRoute: true,
  });

  app.ready((err) => {
    if (err instanceof Error) throw err;
    app.swagger();
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
