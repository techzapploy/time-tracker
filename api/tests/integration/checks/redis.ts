import type { CheckResult } from './types.js';

export async function checkRedis(): Promise<CheckResult> {
  const start = Date.now();
  const service = 'redis';

  const redisUrl =
    process.env['REDIS_URL'] ||
    (() => {
      const host = process.env['SERVICE_REDIS_HOST'];
      const port = process.env['SERVICE_REDIS_PORT'] || '6379';
      if (host) {
        return `redis://${host}:${port}`;
      }
      return undefined;
    })();

  if (!redisUrl) {
    return {
      service,
      status: 'skip',
      message: 'REDIS_URL not set and SERVICE_REDIS_HOST not set',
      duration: Date.now() - start,
    };
  }

  try {
    const { default: Redis } = await import('ioredis');
    const client = new Redis(redisUrl, {
      connectTimeout: 5000,
      lazyConnect: true,
      maxRetriesPerRequest: 0,
      enableReadyCheck: false,
    });
    try {
      await client.connect();
      const pong = await client.ping();
      if (pong !== 'PONG') {
        return {
          service,
          status: 'fail',
          message: `PING returned unexpected response: ${pong}`,
          duration: Date.now() - start,
        };
      }
      return {
        service,
        status: 'pass',
        message: 'Connected and PING returned PONG',
        duration: Date.now() - start,
      };
    } finally {
      client.disconnect();
    }
  } catch (err) {
    return {
      service,
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      duration: Date.now() - start,
    };
  }
}
