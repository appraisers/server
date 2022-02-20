import { FastifyInstance } from 'fastify';
import app from './app';

const server: FastifyInstance = app();

server.listen(process.env.PORT || 3001, '0.0.0.0', (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`> Server listening at ${address}`);
});
