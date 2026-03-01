import Redis from 'ioredis';
import type { CheckResult } from '../types.js';

export async function checkRedis(): Promise<CheckResult> {
  const start = Date.now();
  const service = 'Redis';

  const redisUrl = process.env['REDIS_URL'];
  const host = process.env['SERVICE_REDIS_HOST'];
  const port = process.env['SERVICE_REDIS_PORT'];

  if (!redisUrl && !host) {
    return {
      service,
      status: 'skip',
      message: 'REDIS_URL and SERVICE_REDIS_HOST are not set',
      durationMs: Date.now() - start,
    };
  }

  let client: Redis | undefined;

  try {
    if (redisUrl) {
      client = new Redis(redisUrl, { lazyConnect: true, connectTimeout: 5000, maxRetriesPerRequest: 0 });
    } else {
      client = new Redis({
        host: host!,
        port: port ? parseInt(port, 10) : 6379,
        lazyConnect: true,
        connectTimeout: 5000,
        maxRetriesPerRequest: 0,
      });
    }

    await client.connect();
    const pong = await client.ping();

    if (pong !== 'PONG') {
      return {
        service,
        status: 'fail',
        message: `Unexpected PING response: ${pong}`,
        durationMs: Date.now() - start,
      };
    }

    return {
      service,
      status: 'pass',
      message: 'Connected and PING returned PONG',
      durationMs: Date.now() - start,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      service,
      status: 'fail',
      message: `Connection failed: ${message}`,
      durationMs: Date.now() - start,
    };
  } finally {
    if (client) {
      client.disconnect();
    }
  }
}
