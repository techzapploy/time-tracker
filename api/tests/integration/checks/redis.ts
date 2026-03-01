import Redis from 'ioredis';
import { type ServiceCheckResult, sanitizeError } from './types.js';

export async function checkRedis(): Promise<ServiceCheckResult> {
  const timestamp = new Date().toISOString();
  const service = 'redis';

  const redisHost = process.env['REDIS_HOST'];

  if (!redisHost) {
    return {
      service,
      status: 'skip',
      message: 'Skipped: REDIS_HOST is unset',
      timestamp,
    };
  }

  let client: Redis | undefined;

  try {
    const port = parseInt(process.env['REDIS_PORT'] ?? '6379', 10);
    const password = process.env['REDIS_PASSWORD'];

    client = new Redis({
      host: redisHost,
      port,
      password,
      lazyConnect: true,
      connectTimeout: 10000,
    });

    await client.connect();
    const result = await client.ping();

    if (result !== 'PONG') {
      return {
        service,
        status: 'fail',
        message: `Redis PING returned unexpected response: ${result}`,
        timestamp,
      };
    }

    return {
      service,
      status: 'pass',
      message: 'Redis connection successful (PING returned PONG)',
      timestamp,
    };
  } catch (error) {
    return {
      service,
      status: 'fail',
      message: `Redis connection failed: ${sanitizeError(error)}`,
      timestamp,
    };
  } finally {
    if (client) {
      client.disconnect();
    }
  }
}
