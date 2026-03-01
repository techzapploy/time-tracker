import { Redis } from 'ioredis';

export type CheckResult = {
  service: string;
  status: 'pass' | 'fail' | 'skip';
  message: string;
  durationMs: number;
};

export async function check(): Promise<CheckResult> {
  const start = Date.now();
  const client = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    connectTimeout: 9000,
    lazyConnect: true,
  });
  try {
    await client.connect();
    await client.ping();
    await client.quit();
    return { service: 'Redis', status: 'pass', message: 'PING successful', durationMs: Date.now() - start };
  } catch (err) {
    client.disconnect();
    const message = err instanceof Error ? err.message : String(err);
    return { service: 'Redis', status: 'fail', message, durationMs: Date.now() - start };
  }
}
