import Redis from 'ioredis';

interface CheckResult {
  service: string;
  status: 'pass' | 'fail' | 'skip';
  message: string;
  durationMs?: number;
}

export default async function checkRedis(): Promise<CheckResult> {
  const start = Date.now();
  const host = process.env.SERVICE_REDIS_HOST || 'redis';
  const port = parseInt(process.env.SERVICE_REDIS_PORT || '6379', 10);

  const redis = new Redis({ host, port, connectTimeout: 5000, lazyConnect: true });
  try {
    await redis.connect();
    const response = await redis.ping();
    if (response !== 'PONG') {
      return {
        service: 'redis',
        status: 'fail',
        message: `Unexpected PING response: ${response}`,
        durationMs: Date.now() - start,
      };
    }
    return {
      service: 'redis',
      status: 'pass',
      message: 'Connected and PING returned PONG',
      durationMs: Date.now() - start,
    };
  } catch (err) {
    return {
      service: 'redis',
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
    };
  } finally {
    redis.disconnect();
  }
}
