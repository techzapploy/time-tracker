import type { CheckResult } from '../types.js';

export async function checkRedis(): Promise<CheckResult> {
  const start = Date.now();
  const host = process.env.REDIS_HOST;

  if (!host) {
    return {
      service: 'redis',
      status: 'skipped',
      message: 'REDIS_HOST not set',
      duration_ms: Date.now() - start,
    };
  }

  try {
    const { default: Redis } = await import('ioredis');
    const port = parseInt(process.env.REDIS_PORT ?? '6379', 10);
    const password = process.env.REDIS_PASSWORD;
    const client = new Redis({ host, port, password, lazyConnect: true });
    await client.connect();
    const pong = await client.ping();
    await client.disconnect();
    if (pong !== 'PONG') {
      throw new Error(`Unexpected PING response: ${pong}`);
    }
    return {
      service: 'redis',
      status: 'pass',
      message: 'PING returned PONG',
      duration_ms: Date.now() - start,
    };
  } catch (err) {
    return {
      service: 'redis',
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      duration_ms: Date.now() - start,
    };
  }
}
