import Redis from 'ioredis';
import type { CheckResult } from '../types.js';

export async function checkRedis(): Promise<CheckResult> {
  const service = 'Redis';
  const start = Date.now();

  const host = process.env.SERVICE_REDIS_HOST ?? 'redis';
  const port = parseInt(process.env.SERVICE_REDIS_PORT ?? '6379', 10);

  const connectionUrl = process.env.REDIS_URL ?? null;

  let client: Redis | null = null;

  try {
    if (connectionUrl !== null) {
      client = new Redis(connectionUrl, {
        connectTimeout: 10000,
        lazyConnect: true,
      });
    } else {
      client = new Redis({
        host,
        port,
        connectTimeout: 10000,
        lazyConnect: true,
      });
    }

    await client.connect();
    const pong = await client.ping();

    const duration = Date.now() - start;

    if (pong !== 'PONG') {
      return {
        service,
        status: 'fail',
        duration,
        message: `Unexpected PING response: ${pong}`,
      };
    }

    return {
      service,
      status: 'pass',
      duration,
      message: `Connected to ${connectionUrl !== null ? connectionUrl : `${host}:${port}`}`,
    };
  } catch (err) {
    const duration = Date.now() - start;
    const message =
      err instanceof Error ? err.message : 'Unknown error connecting to Redis';
    return {
      service,
      status: 'fail',
      duration,
      message,
    };
  } finally {
    if (client !== null) {
      client.disconnect();
    }
  }
}
