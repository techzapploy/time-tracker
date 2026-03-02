import type { CheckResult } from '../types.js';
import Redis from 'ioredis';

const name = 'Redis';

export default async function checkRedis(): Promise<CheckResult> {
  const start = Date.now();

  const host = process.env.SERVICE_REDIS_HOST || 'redis';
  const port = parseInt(process.env.SERVICE_REDIS_PORT || '6379', 10);
  const redisUrl = process.env.REDIS_URL;

  let client: Redis | null = null;

  try {
    if (redisUrl) {
      client = new Redis(redisUrl, {
        connectTimeout: 9000,
        lazyConnect: true,
        enableOfflineQueue: false,
      });
    } else {
      client = new Redis({
        host,
        port,
        connectTimeout: 9000,
        lazyConnect: true,
        enableOfflineQueue: false,
      });
    }

    await client.connect();
    const pong = await client.ping();

    if (pong !== 'PONG') {
      return {
        name,
        status: 'fail',
        reason: `Unexpected PING response: ${pong}`,
        duration_ms: Date.now() - start,
      };
    }

    return {
      name,
      status: 'pass',
      reason: `Connected successfully to ${redisUrl || `${host}:${port}`}`,
      duration_ms: Date.now() - start,
    };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    return {
      name,
      status: 'fail',
      reason: `Connection failed: ${reason}`,
      duration_ms: Date.now() - start,
    };
  } finally {
    if (client) {
      client.disconnect();
    }
  }
}
