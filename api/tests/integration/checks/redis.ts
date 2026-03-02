import Redis from 'ioredis';
import type { CheckResult } from '../types.js';

export async function check(): Promise<CheckResult> {
  const timestamp = new Date().toISOString();
  const service = 'Redis';

  if (!process.env.REDIS_HOST) {
    return { service, status: 'skip', message: 'REDIS_HOST not set', timestamp };
  }

  const client = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
    password: process.env.REDIS_PASSWORD,
    connectTimeout: 4000,
    lazyConnect: true,
  });

  try {
    await client.connect();
    await client.ping();
    return { service, status: 'pass', message: 'Connection successful', timestamp };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { service, status: 'fail', message, timestamp };
  } finally {
    await client.quit();
  }
}
