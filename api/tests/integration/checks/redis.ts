import Redis from 'ioredis';
import { ServiceCheckResult, sanitizeError } from './types.js';

export async function checkRedis(): Promise<ServiceCheckResult> {
  const timestamp = new Date().toISOString();
  const host = process.env.REDIS_HOST;

  if (!host) {
    return { service: 'Redis', status: 'skip', message: 'REDIS_HOST not set', timestamp };
  }

  const port = parseInt(process.env.REDIS_PORT || '6379', 10);
  const password = process.env.REDIS_PASSWORD;

  const client = new Redis({ host, port, password, lazyConnect: true, connectTimeout: 10000 });
  try {
    await client.connect();
    const result = await client.ping();
    if (result === 'PONG') {
      return { service: 'Redis', status: 'pass', message: 'Connection successful', timestamp };
    }
    return { service: 'Redis', status: 'fail', message: `Unexpected PING response: ${result}`, timestamp };
  } catch (error) {
    return { service: 'Redis', status: 'fail', message: sanitizeError(error), timestamp };
  } finally {
    await client.quit().catch(() => {});
  }
}
