import Redis from 'ioredis';

export interface CheckResult {
  service: string;
  passed: boolean;
  error?: string;
}

export async function checkRedis(): Promise<CheckResult> {
  const host = process.env.REDIS_HOST;
  const port = parseInt(process.env.REDIS_PORT || '6379', 10);
  const password = process.env.REDIS_PASSWORD || undefined;

  if (!host) {
    return { service: 'redis', passed: false, error: 'REDIS_HOST env var not set' };
  }

  const client = new Redis({ host, port, password, connectTimeout: 10000, lazyConnect: true });
  try {
    await client.connect();
    const response = await client.ping();
    if (response !== 'PONG') {
      return { service: 'redis', passed: false, error: `Unexpected PING response: ${response}` };
    }
    return { service: 'redis', passed: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { service: 'redis', passed: false, error: message };
  } finally {
    client.quit().catch(() => {});
  }
}
