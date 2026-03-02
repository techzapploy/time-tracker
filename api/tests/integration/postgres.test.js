import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import postgres from 'postgres';

const host = process.env.SERVICE_POSTGRES_HOST || process.env.POSTGRES_HOST || 'postgres';
const port = parseInt(process.env.SERVICE_POSTGRES_PORT || process.env.POSTGRES_PORT || '5432', 10);
const database = process.env.POSTGRES_DB || process.env.SERVICE_POSTGRES_DB || 'postgres';
const user = process.env.POSTGRES_USER || process.env.SERVICE_POSTGRES_USER || 'postgres';
const password = process.env.POSTGRES_PASSWORD || process.env.SERVICE_POSTGRES_PASSWORD || 'test';

describe('PostgreSQL connectivity', () => {
  let sql;

  before(() => {
    sql = postgres({
      host,
      port,
      database,
      user,
      password,
      connect_timeout: 10,
      max: 1,
    });
  });

  after(async () => {
    if (sql) {
      await sql.end();
    }
  });

  it('connects to PostgreSQL and runs a simple query', async () => {
    const result = await sql`SELECT 1 AS value`;
    assert.equal(result[0].value, 1, 'Expected SELECT 1 to return 1');
    console.log(`  Connected to PostgreSQL at ${host}:${port}`);
  });

  it('retrieves PostgreSQL version', async () => {
    const result = await sql`SELECT version()`;
    assert.ok(result[0].version, 'Expected version string to be present');
    console.log(`  PostgreSQL version: ${result[0].version.split(' ').slice(0, 2).join(' ')}`);
  });

  it('can create and query a temporary table', async () => {
    await sql`CREATE TEMP TABLE IF NOT EXISTS integration_test (id SERIAL PRIMARY KEY, name TEXT)`;
    await sql`INSERT INTO integration_test (name) VALUES ('hello')`;
    const rows = await sql`SELECT name FROM integration_test`;
    assert.equal(rows[0].name, 'hello', 'Expected to retrieve inserted row');
    console.log('  Temporary table create/insert/select works');
  });
});
