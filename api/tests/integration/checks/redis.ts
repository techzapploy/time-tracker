import Redis from 'ioredis';
import type { CheckResult } from '../types.js';

export async function checkRedis(): Promise<CheckResult> {
  const timestamp = new Date().toISOString();
  const host = process.env.REDIS_HOST;

  if (!host) {
    return { service: 'Redis', status: 'skip', message: 'REDIS_HOST not set', timestamp };
  }

  const port = parseInt(process.env.REDIS_PORT ?? '6379', 10);
  const password = process.env.REDIS_PASSWORD;

  const client = new Redis({ host, port, password, lazyConnect: true, connectTimeout: 8000 });
  try {
    await client.connect();
    const result = await client.ping();
    if (result === 'PONG') {
      return { service: 'Redis', status: 'pass', message: 'PING successful', timestamp };
    }
    return { service: 'Redis', status: 'fail', message: `Unexpected PING response: ${result}`, timestamp };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { service: 'Redis', status: 'fail', message: msg, timestamp };
  } finally {
    client.disconnect();
  }
}
