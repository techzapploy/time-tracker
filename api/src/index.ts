import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import redis from '@fastify/redis';
import { config } from './utils/config.js';
import { logger } from './utils/logger.js';

const fastify = Fastify({
  logger: logger,
});

// Register plugins
await fastify.register(cors, {
  origin: config.corsOrigin,
  credentials: true,
});

await fastify.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
});

await fastify.register(jwt, {
  secret: config.jwtSecret,
});

await fastify.register(redis, {
  host: config.redisHost,
  port: config.redisPort,
  password: config.redisPassword,
});

// Health check route
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// API routes will be registered here
// await fastify.register(authRoutes, { prefix: '/api/auth' });
// await fastify.register(projectRoutes, { prefix: '/api/projects' });
// await fastify.register(timeEntryRoutes, { prefix: '/api/time-entries' });

// Start server
const start = async () => {
  try {
    await fastify.listen({
      port: config.port,
      host: config.host,
    });
    fastify.log.info(`Server listening on ${config.host}:${config.port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
