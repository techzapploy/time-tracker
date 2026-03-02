import { Redis } from 'ioredis';

export interface CheckResult {
  name: string;
  status: 'ok' | 'failed' | 'skipped';
  message: string;
  durationMs?: number;
}

export async function checkRedis(): Promise<CheckResult> {
  const host = process.env.SERVICE_REDIS_HOST || process.env.REDIS_HOST || 'redis';
  const port = parseInt(process.env.SERVICE_REDIS_PORT || process.env.REDIS_PORT || '6379', 10);
  const password = process.env.REDIS_PASSWORD || undefined;

  const start = Date.now();
  const client = new Redis({
    host,
    port,
    password,
    connectTimeout: 10000,
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    retryStrategy: () => null,
  });

  // Suppress unhandled error events
  client.on('error', () => {/* handled in catch */});

  try {
    await client.connect();
    await client.ping();
    const durationMs = Date.now() - start;

    return {
      name: 'Redis',
      status: 'ok',
      message: `Connected successfully to ${host}:${port}`,
      durationMs,
    };
  } catch (err) {
    const durationMs = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    return {
      name: 'Redis',
      status: 'failed',
      message: `Connection failed: ${message}`,
      durationMs,
    };
  } finally {
    client.disconnect();
  }
}
