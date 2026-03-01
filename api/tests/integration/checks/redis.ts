import Redis from 'ioredis';
import type { CheckResult } from '../types';

export async function checkRedis(): Promise<CheckResult> {
  const start = Date.now();

  if (!process.env.REDIS_HOST) {
    return {
      name: 'redis',
      status: 'skip',
      message: 'REDIS_HOST is not set',
      durationMs: Date.now() - start,
    };
  }

  const host = process.env.REDIS_HOST;
  const port = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379;
  const password = process.env.REDIS_PASSWORD || undefined;

  let client: Redis | null = null;

  try {
    client = new Redis({
      host,
      port,
      password,
      connectTimeout: 10000,
      maxRetriesPerRequest: 1,
    });

    const response = await client.ping();

    if (response === 'PONG') {
      return {
        name: 'redis',
        status: 'pass',
        message: 'Connected and PING returned PONG',
        durationMs: Date.now() - start,
      };
    }

    return {
      name: 'redis',
      status: 'fail',
      message: `Unexpected PING response: ${response}`,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    return {
      name: 'redis',
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
    };
  } finally {
    if (client) {
      await client.quit();
    }
  }
}
