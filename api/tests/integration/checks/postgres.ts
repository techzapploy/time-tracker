import postgres from 'postgres';
import type { CheckResult } from '../types.js';

export async function checkPostgres(): Promise<CheckResult> {
  const start = Date.now();
  const host = process.env.SERVICE_POSTGRES_HOST ?? 'postgres';
  const port = process.env.SERVICE_POSTGRES_PORT ?? '5432';
  const password = process.env.SERVICE_POSTGRES_PASSWORD ?? 'postgres';

  if (!host) {
    return {
      name: 'postgres',
      status: 'skip',
      message: 'SERVICE_POSTGRES_HOST not set',
      durationMs: Date.now() - start,
    };
  }

  const connectionString = `postgresql://postgres:${password}@${host}:${port}/postgres`;
  const sql = postgres(connectionString, { connect_timeout: 5 });

  try {
    await sql`SELECT 1`;
    await sql.end();
    return {
      name: 'postgres',
      status: 'pass',
      message: 'Connected and queried successfully',
      durationMs: Date.now() - start,
    };
  } catch (err) {
    await sql.end({ timeout: 1 });
    return {
      name: 'postgres',
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
    };
  }
}
