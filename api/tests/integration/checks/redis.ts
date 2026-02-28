import Redis from 'ioredis';
import type { CheckResult } from './database.js';

export async function checkRedis(): Promise<CheckResult> {
  const start = Date.now();
  const name = 'Redis';

  const host = process.env['REDIS_HOST'];
  const port = parseInt(process.env['REDIS_PORT'] ?? '6379', 10);
  const password = process.env['REDIS_PASSWORD'] || undefined;

  if (!host) {
    return { name, status: 'fail', message: 'REDIS_HOST env var is not set', durationMs: Date.now() - start };
  }

  const client = new Redis({ host, port, password, connectTimeout: 10000, commandTimeout: 10000, lazyConnect: true });

  try {
    await client.connect();
    const response = await client.ping();
    if (response !== 'PONG') {
      return { name, status: 'fail', message: `PING returned unexpected response: ${response}`, durationMs: Date.now() - start };
    }
    return { name, status: 'pass', message: 'Connected and PING returned PONG', durationMs: Date.now() - start };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { name, status: 'fail', message: `Connection failed: ${message}`, durationMs: Date.now() - start };
  } finally {
    await client.quit().catch(() => undefined);
  }
}
