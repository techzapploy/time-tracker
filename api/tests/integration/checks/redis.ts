import Redis from 'ioredis';
import type { CheckResult } from '../types.js';

export async function checkRedis(): Promise<CheckResult> {
  const start = Date.now();
  const name = 'redis';

  const host = process.env.SERVICE_REDIS_HOST;
  const port = process.env.SERVICE_REDIS_PORT;
  const redisUrl = process.env.REDIS_URL;

  if (!host && !redisUrl) {
    return {
      name,
      status: 'skip',
      message: 'SERVICE_REDIS_HOST and REDIS_URL are not set',
      durationMs: Date.now() - start,
    };
  }

  let client: Redis | null = null;
  try {
    if (redisUrl) {
      client = new Redis(redisUrl, { connectTimeout: 4000, lazyConnect: true });
    } else {
      client = new Redis({
        host: host as string,
        port: port ? parseInt(port, 10) : 6379,
        connectTimeout: 4000,
        lazyConnect: true,
      });
    }

    await client.connect();
    await client.ping();

    return {
      name,
      status: 'ok',
      message: 'Redis connection successful',
      durationMs: Date.now() - start,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      name,
      status: 'fail',
      message: `Redis connection failed: ${message}`,
      durationMs: Date.now() - start,
    };
  } finally {
    if (client !== null) {
      client.disconnect();
    }
  }
}
