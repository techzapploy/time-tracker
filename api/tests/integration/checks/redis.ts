import Redis from 'ioredis';
import type { CheckResult } from '../types.js';

export default async function checkRedis(): Promise<CheckResult> {
  const service = 'redis';
  const start = Date.now();

  const redisHost = process.env.REDIS_HOST;
  if (!redisHost) {
    return {
      service,
      status: 'skipped',
      message: 'REDIS_HOST env var not set',
      duration_ms: Date.now() - start,
    };
  }

  const redisPort = parseInt(process.env.REDIS_PORT ?? '6379', 10);
  const redisPassword = process.env.REDIS_PASSWORD;

  let client: Redis | undefined;
  try {
    client = new Redis({
      host: redisHost,
      port: redisPort,
      password: redisPassword,
      lazyConnect: true,
    });

    await client.connect();
    const response = await client.ping();
    await client.quit();

    if (response !== 'PONG') {
      return {
        service,
        status: 'fail',
        message: `Expected PONG but got: ${response}`,
        duration_ms: Date.now() - start,
      };
    }

    return {
      service,
      status: 'pass',
      message: 'Successfully connected and received PONG',
      duration_ms: Date.now() - start,
    };
  } catch (error) {
    if (client) {
      try { await client.quit(); } catch {}
    }
    const message = error instanceof Error ? error.message : String(error);
    return {
      service,
      status: 'fail',
      message,
      duration_ms: Date.now() - start,
    };
  }
}
