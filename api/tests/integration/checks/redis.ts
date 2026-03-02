import Redis from 'ioredis';
import type { CheckResult } from '../types.js';

export async function checkRedis(): Promise<CheckResult> {
  const url = process.env['REDIS_URL'];
  const host = process.env['REDIS_HOST'];

  if (!url && !host) {
    return { service: 'redis', status: 'skipped', durationMs: 0 };
  }

  const start = Date.now();
  let client: Redis | undefined;
  try {
    const connectionString = url ?? `redis://${host}:6379`;
    client = new Redis(connectionString, {
      lazyConnect: true,
      connectTimeout: 4000,
      retryStrategy: () => null,
    });
    await client.connect();
    await client.ping();
    await client.disconnect();
    return { service: 'redis', status: 'ok', durationMs: Date.now() - start };
  } catch (err) {
    if (client) {
      try { client.disconnect(); } catch { /* ignore */ }
    }
    const message = err instanceof Error ? err.message : String(err);
    return { service: 'redis', status: 'failed', message, durationMs: Date.now() - start };
  }
}
