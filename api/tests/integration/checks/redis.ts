import Redis from 'ioredis';

interface CheckResult {
  name: string;
  status: 'ok' | 'failed' | 'skipped';
  message: string;
  durationMs?: number;
}

export async function checkRedis(): Promise<CheckResult> {
  const name = 'Redis';

  const host = process.env.SERVICE_REDIS_HOST || process.env.REDIS_HOST || 'redis';
  const port = parseInt(process.env.SERVICE_REDIS_PORT || process.env.REDIS_PORT || '6379', 10);
  const password = process.env.REDIS_PASSWORD;

  const start = Date.now();
  const redis = new Redis({
    host,
    port,
    password,
    connectTimeout: 10000,
    lazyConnect: true,
  });

  redis.on('error', () => {});

  try {
    await redis.connect();
    await redis.ping();
    const durationMs = Date.now() - start;
    return { name, status: 'ok', message: 'Connected successfully', durationMs };
  } catch (err) {
    return { name, status: 'failed', message: String(err) };
  } finally {
    await redis.quit().catch(() => {});
  }
}
