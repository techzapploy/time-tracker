import type { CheckResult } from '../types.js';

export async function checkRedis(): Promise<CheckResult> {
  const name = 'Redis';
  const start = Date.now();

  const redisUrl = process.env.REDIS_URL;
  const redisHost = process.env.REDIS_HOST;

  if (!redisUrl && !redisHost) {
    return { name, status: 'skipped', message: 'REDIS_URL and REDIS_HOST not set', durationMs: 0 };
  }

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Timeout after 10s')), 10000)
  );

  let client: { disconnect: () => void; ping: () => Promise<string> } | null = null;

  try {
    const operation = async () => {
      const { default: Redis } = await import('ioredis');

      if (redisUrl) {
        client = new Redis(redisUrl, { lazyConnect: true }) as unknown as { disconnect: () => void; ping: () => Promise<string> };
      } else {
        client = new Redis({
          host: redisHost,
          port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
          password: process.env.REDIS_PASSWORD || undefined,
          lazyConnect: true,
        }) as unknown as { disconnect: () => void; ping: () => Promise<string> };
      }

      await (client as unknown as { connect: () => Promise<void> }).connect();
      const pong = await client.ping();
      return `PING response: ${pong}`;
    };

    const message = await Promise.race([operation(), timeoutPromise]);
    return { name, status: 'pass', message: message as string, durationMs: Date.now() - start };
  } catch (err) {
    return {
      name,
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
    };
  } finally {
    if (client) {
      try {
        client.disconnect();
      } catch {
        // ignore cleanup errors
      }
    }
  }
}
