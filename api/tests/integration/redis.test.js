import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import Redis from 'ioredis';

const host = process.env.SERVICE_REDIS_HOST || process.env.REDIS_HOST || 'redis';
const port = parseInt(process.env.SERVICE_REDIS_PORT || process.env.REDIS_PORT || '6379', 10);
const password = process.env.REDIS_PASSWORD || undefined;

describe('Redis connectivity', () => {
  let client;

  before(async () => {
    client = new Redis({
      host,
      port,
      password,
      connectTimeout: 10000,
      lazyConnect: true,
      maxRetriesPerRequest: 1,
    });

    await client.connect();
  });

  after(async () => {
    if (client) {
      client.disconnect();
    }
  });

  it('connects to Redis and pings', async () => {
    const response = await client.ping();
    assert.equal(response, 'PONG', 'Expected PONG response from Redis PING');
    console.log(`  Connected to Redis at ${host}:${port}`);
  });

  it('can set and get a value', async () => {
    const key = `integration_test_${Date.now()}`;
    await client.set(key, 'test_value', 'EX', 60);
    const value = await client.get(key);
    assert.equal(value, 'test_value', 'Expected to retrieve the set value');
    await client.del(key);
    console.log('  Redis SET/GET/DEL works');
  });

  it('retrieves Redis server info', async () => {
    const info = await client.info('server');
    assert.ok(info.includes('redis_version'), 'Expected redis_version in server info');
    const versionMatch = info.match(/redis_version:(\S+)/);
    if (versionMatch) {
      console.log(`  Redis version: ${versionMatch[1]}`);
    }
  });
});
