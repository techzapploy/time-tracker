import type { CheckResult } from '../types.js';

export async function checkRedis(): Promise<CheckResult> {
  const start = Date.now();
  const service = 'redis';

  const redisHost = process.env['REDIS_HOST'];
  if (!redisHost) {
    return {
      service,
      status: 'skipped',
      message: 'REDIS_HOST not set',
      duration_ms: Date.now() - start,
    };
  }

  try {
    const { default: Redis } = await import('ioredis');
    const redis = new Redis({
      host: redisHost,
      port: process.env['REDIS_PORT'] ? parseInt(process.env['REDIS_PORT'], 10) : 6379,
      password: process.env['REDIS_PASSWORD'],
      connectTimeout: 10000,
      lazyConnect: false,
    });
    await redis.ping();
    redis.disconnect();
    return {
      service,
      status: 'pass',
      message: 'Connected and PING succeeded',
      duration_ms: Date.now() - start,
    };
  } catch (err) {
    return {
      service,
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      duration_ms: Date.now() - start,
    };
  }
}
