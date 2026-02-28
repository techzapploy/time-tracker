import Redis from 'ioredis';
import type { CheckResult } from '../types.js';

export async function checkRedis(): Promise<CheckResult> {
  const service = 'Redis';
  const redisUrl = process.env['REDIS_URL'];
  const redisHost = process.env['REDIS_HOST'];
  const redisPort = process.env['REDIS_PORT'];
  const redisPassword = process.env['REDIS_PASSWORD'];

  let client: Redis | null = null;

  try {
    if (redisUrl) {
      client = new Redis(redisUrl, {
        connectTimeout: 10000,
        lazyConnect: true,
      });
    } else {
      const host = redisHost ?? 'localhost';
      const port = redisPort ? parseInt(redisPort, 10) : 6379;

      client = new Redis({
        host,
        port,
        connectTimeout: 10000,
        lazyConnect: true,
        ...(redisPassword ? { password: redisPassword } : {}),
      });
    }

    await client.connect();
    const pong = await client.ping();

    if (pong === 'PONG') {
      return {
        service,
        passed: true,
        message: 'Successfully connected to Redis and received PONG',
      };
    } else {
      return {
        service,
        passed: false,
        message: `Redis PING returned unexpected response: ${pong}`,
      };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      service,
      passed: false,
      message: `Redis connection failed: ${message}`,
    };
  } finally {
    if (client) {
      client.disconnect();
    }
  }
}
