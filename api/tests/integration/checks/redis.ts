/**
 * Redis Integration Check
 *
 * Connects to Redis using REDIS_URL or SERVICE_REDIS_HOST/PORT env vars.
 * Skips gracefully if no connection parameters are available.
 */

import type { CheckResult } from '../runner.js';

export async function checkRedis(): Promise<CheckResult> {
  const name = 'Redis';

  const redisUrl = process.env.REDIS_URL || null;
  const redisHost =
    process.env.SERVICE_REDIS_HOST ||
    process.env.REDIS_HOST ||
    null;
  const redisPort = parseInt(
    process.env.SERVICE_REDIS_PORT || process.env.REDIS_PORT || '6379',
    10,
  );

  if (!redisUrl && !redisHost) {
    return {
      name,
      status: 'skipped',
      message: 'No Redis connection parameters found (REDIS_URL or SERVICE_REDIS_HOST)',
      durationMs: 0,
    };
  }

  let client: import('ioredis').Redis | null = null;

  try {
    const { default: Redis } = await import('ioredis');

    const connectOptions = redisUrl
      ? { lazyConnect: true, enableOfflineQueue: false, connectTimeout: 4000 }
      : {
          host: redisHost!,
          port: redisPort,
          password: process.env.REDIS_PASSWORD || undefined,
          lazyConnect: true,
          enableOfflineQueue: false,
          connectTimeout: 4000,
        };

    client = redisUrl
      ? new Redis(redisUrl, connectOptions)
      : new Redis(connectOptions);

    await client.connect();

    const pong = await client.ping();
    const info = await client.info('server');
    const versionMatch = info.match(/redis_version:([^\r\n]+)/);
    const version = versionMatch ? versionMatch[1].trim() : 'unknown';

    await client.quit();

    return {
      name,
      status: 'passed',
      message: `Connected to Redis ${version} - PING: ${pong}`,
      durationMs: 0,
    };
  } catch (err) {
    if (client) {
      try {
        client.disconnect();
      } catch {
        // ignore cleanup errors
      }
    }
    return {
      name,
      status: 'failed',
      message: 'Failed to connect to Redis',
      durationMs: 0,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
