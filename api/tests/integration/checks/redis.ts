import Redis from 'ioredis';
import type { CheckResult } from '../types.js';

export async function checkRedis(): Promise<CheckResult> {
  const service = 'Redis';
  const start = Date.now();
  const url = process.env['REDIS_URL'];
  const host = process.env['REDIS_HOST'];
  const port = process.env['REDIS_PORT'];
  const password = process.env['REDIS_PASSWORD'];

  if (!url && !host) {
    return { service, status: 'fail', message: 'Environment variable REDIS_URL or REDIS_HOST is not set', durationMs: Date.now() - start };
  }

  let client: Redis | undefined;
  try {
    if (url) {
      client = new Redis(url, { connectTimeout: 10000, lazyConnect: true });
    } else {
      client = new Redis({
        host: host!,
        port: port ? parseInt(port, 10) : 6379,
        password: password || undefined,
        connectTimeout: 10000,
        lazyConnect: true,
      });
    }
    await client.connect();
    const response = await client.ping();
    if (response === 'PONG') {
      return { service, status: 'pass', message: 'PING returned PONG', durationMs: Date.now() - start };
    }
    return { service, status: 'fail', message: `PING returned unexpected: ${response}`, durationMs: Date.now() - start };
  } catch (err) {
    return { service, status: 'fail', message: err instanceof Error ? err.message : String(err), durationMs: Date.now() - start };
  } finally {
    client?.disconnect();
  }
}
