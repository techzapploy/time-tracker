import Redis from 'ioredis';
import type { CheckResult } from './database.js';

export async function checkRedis(): Promise<CheckResult> {
  const name = 'Redis';
  const start = Date.now();

  if (!process.env['REDIS_HOST']) {
    return {
      name,
      status: 'fail',
      message: 'REDIS_HOST env var is not set',
      durationMs: Date.now() - start,
    };
  }

  const client = new Redis({
    host: process.env['REDIS_HOST'],
    port: process.env['REDIS_PORT'] ? parseInt(process.env['REDIS_PORT'], 10) : 6379,
    password: process.env['REDIS_PASSWORD'],
    lazyConnect: true,
  });

  try {
    await client.connect();
    await client.ping();
    return {
      name,
      status: 'pass',
      message: 'Connected and pinged successfully',
      durationMs: Date.now() - start,
    };
  } catch (err) {
    return {
      name,
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
    };
  } finally {
    client.disconnect();
  }
}
