import Redis from 'ioredis';
import type { CheckResult } from '../runner.js';

export default async function check(): Promise<CheckResult> {
  const host = process.env.REDIS_HOST;
  if (!host) return { service: 'Redis', status: 'skipped', message: 'REDIS_HOST not set' };
  const port = parseInt(process.env.REDIS_PORT || '6379', 10);
  const password = process.env.REDIS_PASSWORD;
  const redis = new Redis({ host, port, password, lazyConnect: true });
  try {
    await redis.connect();
    const pong = await redis.ping();
    if (pong === 'PONG') {
      return { service: 'Redis', status: 'passed', message: 'PING/PONG successful' };
    }
    return { service: 'Redis', status: 'failed', message: `Unexpected ping response: ${pong}` };
  } catch (err) {
    return { service: 'Redis', status: 'failed', message: (err as Error).message };
  } finally {
    redis.disconnect();
  }
}
