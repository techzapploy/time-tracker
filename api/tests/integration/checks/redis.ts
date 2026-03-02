import Redis from 'ioredis';

export type CheckResult = {
  service: string;
  status: 'pass' | 'fail' | 'skip' | 'timeout';
  durationMs: number;
  error: string | null;
};

export async function check(): Promise<CheckResult> {
  const start = Date.now();

  if (!process.env.REDIS_HOST) {
    return { service: 'redis', status: 'skip', durationMs: 0, error: null };
  }

  const client = new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    lazyConnect: true,
  });

  try {
    await client.connect();
    await client.ping();
    return { service: 'redis', status: 'pass', durationMs: Date.now() - start, error: null };
  } catch (err) {
    return {
      service: 'redis',
      status: 'fail',
      durationMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    await client.quit();
  }
}
