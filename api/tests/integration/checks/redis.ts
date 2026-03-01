import Redis from 'ioredis';

export interface CheckResult {
  name: string;
  status: 'ok' | 'failed' | 'skipped';
  message: string;
  durationMs: number;
}

export async function check(): Promise<CheckResult> {
  const name = 'Redis';
  const host = process.env['REDIS_HOST'];

  if (!host || host.trim() === '') {
    return { name, status: 'skipped', message: 'REDIS_HOST not set', durationMs: 0 };
  }

  const port = parseInt(process.env['REDIS_PORT'] ?? '6379', 10);
  const password = process.env['REDIS_PASSWORD'] || undefined;

  const start = Date.now();
  const client = new Redis({ host, port, password, lazyConnect: true });

  try {
    await client.connect();
    await client.ping();
    return { name, status: 'ok', message: 'Connection successful', durationMs: Date.now() - start };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { name, status: 'failed', message, durationMs: Date.now() - start };
  } finally {
    client.disconnect();
  }
}
