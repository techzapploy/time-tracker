import Redis from 'ioredis';
import { sanitize } from '../utils/sanitize.ts';
import type { ServiceResult } from '../utils/report.ts';

export async function checkRedis(): Promise<ServiceResult> {
  const url = process.env.REDIS_URL;
  const host = process.env.REDIS_HOST;
  if (!url && !host) return { name: 'Redis', status: 'SKIPPED', details: 'REDIS_URL or REDIS_HOST not set' };

  const client = url
    ? new Redis(url, { connectTimeout: 10000, lazyConnect: true })
    : new Redis({
        host,
        port: Number(process.env.REDIS_PORT ?? 6379),
        password: process.env.REDIS_PASSWORD || undefined,
        connectTimeout: 10000,
        lazyConnect: true,
      });

  const start = Date.now();
  try {
    await client.connect();
    const result = await client.ping();
    return {
      name: 'Redis',
      status: result === 'PONG' ? 'UP' : 'DOWN',
      latency: Date.now() - start,
    };
  } catch (err) {
    return { name: 'Redis', status: 'DOWN', error: sanitize(String(err)) };
  } finally {
    client.disconnect();
  }
}
