import Redis from 'ioredis';
import type { ServiceCheckResult } from './types.js';
import { sanitizeError } from './types.js';

export async function checkRedis(): Promise<ServiceCheckResult> {
  const timestamp = new Date().toISOString();
  const host = process.env.SERVICE_REDIS_HOST || process.env.REDIS_HOST;
  const port = parseInt(process.env.SERVICE_REDIS_PORT || process.env.REDIS_PORT || '6379');

  if (!host) {
    return { service: 'Redis', status: 'skip', message: 'REDIS_HOST not configured', timestamp };
  }

  const redis = new Redis({ host, port, password: process.env.REDIS_PASSWORD, connectTimeout: 10000, lazyConnect: true });
  try {
    await redis.connect();
    await redis.ping();
    return { service: 'Redis', status: 'pass', message: 'Connection successful', timestamp };
  } catch (error) {
    return { service: 'Redis', status: 'fail', message: sanitizeError(error), timestamp };
  } finally {
    redis.disconnect();
  }
}
