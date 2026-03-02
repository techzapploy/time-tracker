import Redis from 'ioredis';
import type { CheckResult } from '../types.js';

export async function checkRedis(): Promise<CheckResult> {
  const start = Date.now();
  let client: Redis | undefined;
  try {
    if (process.env['REDIS_URL']) {
      client = new Redis(process.env['REDIS_URL'], { lazyConnect: true });
    } else {
      const host = process.env['SERVICE_REDIS_HOST'] ?? 'redis';
      const port = parseInt(process.env['SERVICE_REDIS_PORT'] ?? '6379', 10);
      client = new Redis({ host, port, lazyConnect: true });
    }
    await client.connect();
    const response = await client.ping();
    if (response !== 'PONG') {
      return {
        name: 'redis',
        status: 'fail',
        reason: `Expected PONG, got ${response}`,
        duration_ms: Date.now() - start,
      };
    }
    return {
      name: 'redis',
      status: 'pass',
      duration_ms: Date.now() - start,
    };
  } catch (err) {
    return {
      name: 'redis',
      status: 'fail',
      reason: err instanceof Error ? err.message : String(err),
      duration_ms: Date.now() - start,
    };
  } finally {
    await client?.disconnect();
  }
}
