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
import { CommonResponse } from './common/common.interfaces';

import authRoutes from './modules/Auth/auth.routes';
import reviewRoutes from './modules/Review/review.routes';
import userRoutes from './modules/User/user.routes';
import questionRoutes from './modules/Question/question.routes';

import { filesMultipleUpload } from './utils/multer';

let app = fastify({
  pluginTimeout: 20000, // resolve problem "Error: ERR_AVVIO_PLUGIN_TIMEOUT: plugin did not start in time ..."
});

export default function build(): FastifyInstance {
  app.register(fastifyCors, {
    /* put your options here */
  });
  // app.register(fastifyMultipart, {
  //   attachFieldsToBody: true,
  //   limits: {
  //     fieldSize: 1000000, // Max field value size in bytes
  //     fileSize: 5000,      // For multipart forms, the max file size
  //     files: 10,           // Max number of file fields
  //     headerPairs: 2000
  //   }
  // });

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
      definitions: {
        // User: {
        //   type: 'object',
        //   required: ['id', 'email'],
        //   properties: {
        //     id: { type: 'string', format: 'uuid' },
        //     firstName: { type: 'string' },
        //     lastName: { type: 'string' },
        //     email: { type: 'string', format: 'email' },
        //   },
        // },
      },
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

  app.ready((err: any) => {
    if (err) throw err;
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

  // Test Route for Upload functionality Multer || MulterS3
  app.post(
    '/upload_aws',
    {
      preHandler: filesMultipleUpload('listingMedia', 'galleryMedias'),
    },
    async (request: any, reply: any) => {
      reply
        .status(200)
        .send({ statusCode: 200, img: request.files || 'There are no images' });
    }
  );

// ERROR HANDLER
// app.setErrorHandler((error: any, reply: any) => {
//   try {
//     if (error instanceof Error)
//     const errObj = JSON.parse(error.message) as CommonResponse;

//     reply.status(200).send(errObj);
//   } catch (err) {
//     reply
//       .status(500)
//       .send({ statusCode: 500, message: error.message || 'Unknown error' });
//   }
// });
  return app;
}
