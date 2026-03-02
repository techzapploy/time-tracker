import Redis from 'ioredis';
import type { CheckResult } from '../types.js';

export async function checkRedis(): Promise<CheckResult> {
  const start = Date.now();
  const host = process.env.SERVICE_REDIS_HOST ?? 'redis';
  const port = process.env.SERVICE_REDIS_PORT ?? '6379';

  if (!host) {
    return {
      name: 'redis',
      status: 'skip',
      message: 'SERVICE_REDIS_HOST not set',
      durationMs: Date.now() - start,
    };
  }

  const client = new Redis(`redis://${host}:${port}`, {
    connectTimeout: 5000,
    lazyConnect: true,
    enableReadyCheck: true,
  });

  try {
    await client.connect();
    await client.ping();
    await client.quit();
    return {
      name: 'redis',
      status: 'pass',
      message: 'Connected and pinged successfully',
      durationMs: Date.now() - start,
    };
  } catch (err) {
    client.disconnect();
    return {
      name: 'redis',
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
    };
  }
}
