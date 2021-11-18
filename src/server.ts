// import fs from 'fs';
import { FastifyInstance } from 'fastify';
import app from './app';

// const httpsOptions = {
//   key: fs.readFileSync('test/fixtures/keys/agent2-key.pem'),
//   cert: fs.readFileSync('test/fixtures/keys/agent2-cert.pem'),
// };
const server: FastifyInstance = app(
  // {
  // pluginTimeout: 20000,
  // logger: true,
  // http2: true,
  // https: httpsOptions
  // level: 'info',
  // prettyPrint: true
  // }
);

server.listen(process.env.PORT || 3001, '0.0.0.0', (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log('process.env.PORT', process.env.PORT)
  console.log(`> Server listening at ${address}`);
});
