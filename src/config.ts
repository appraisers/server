import path from 'path';

const envPath = path.join(__dirname, `../.env.local`);
require('dotenv').config({ debug: process.env.DEBUG, path: envPath });

const config = {
  JWT_SECRET: process.env.JWT_SECRET || 'supersecret',
  MAIN_DB: {
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: 5437 || process.env.POSTGRES_PORT,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: 'postgres' || process.env.POSTGRES_DB,
    synchronize: true,
    logging: false,
    entities: process.env.NODE_ENV === 'production' ? ['build/entities/**/*.js'] : ['src/entities/**/*.ts'],
    migrations: process.env.NODE_ENV === 'production' ? ['build/migrations/**/*.js'] : ['src/migrations/**/*.ts'],
    subscribers: process.env.NODE_ENV === 'production' ? ['build/subscribers/**/*.js'] : ['src/subscribers/**/*.ts'],
    ssl: process.env.NODE_ENV === 'production' ? true : false,
    extra: process.env.NODE_ENV === 'production' ? {
      ssl: {
        rejectUnauthorized: false
      }
    } : {},
    cli: {
      entitiesDir: 'src/entity',
      migrationsDir: 'src/migration',
      subscribersDir: 'src/subscriber',
    },
  },
  EMAIL: {
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_TLS: process.env.SMTP_TLS,
    SMTP_FROM: process.env.SMTP_FROM,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
  },
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  PATH_TO_UPLOADS: process.env.PATH_TO_UPLOADS || '../public/uploads'
};

export default config;
