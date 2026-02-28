import Redis from 'ioredis';
import type { CheckResult } from './database.js';

export async function checkRedis(): Promise<CheckResult> {
  const start = Date.now();
  const host = process.env.REDIS_HOST;

  if (!host) {
    return { name: 'Redis', status: 'fail', message: 'REDIS_HOST env var is not set', durationMs: Date.now() - start };
  }

  const port = parseInt(process.env.REDIS_PORT ?? '6379', 10);
  const password = process.env.REDIS_PASSWORD;

  let client: Redis | undefined;
  try {
    client = new Redis({ host, port, password, connectTimeout: 10000, lazyConnect: true });
    await client.connect();
    const pong = await client.ping();
    if (pong === 'PONG') {
      return { name: 'Redis', status: 'pass', message: 'PING → PONG', durationMs: Date.now() - start };
    }
    return { name: 'Redis', status: 'fail', message: `Unexpected PING response: ${pong}`, durationMs: Date.now() - start };
  } catch (err) {
    return { name: 'Redis', status: 'fail', message: err instanceof Error ? err.message : String(err), durationMs: Date.now() - start };
  } finally {
    if (client) client.disconnect();
  }
}
