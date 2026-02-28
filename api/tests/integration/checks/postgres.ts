import postgres from 'postgres';
import type { CheckResult } from '../types.js';

export async function checkPostgres(): Promise<CheckResult> {
  const service = 'PostgreSQL';
  const start = Date.now();
  const url = process.env['DATABASE_URL'];
  if (!url) {
    return { service, status: 'fail', message: 'Environment variable DATABASE_URL is not set', durationMs: Date.now() - start };
  }
  let sql: ReturnType<typeof postgres> | undefined;
  try {
    sql = postgres(url, { connect_timeout: 10 });
    await sql`SELECT 1`;
    return { service, status: 'pass', message: 'SELECT 1 succeeded', durationMs: Date.now() - start };
  } catch (err) {
    return { service, status: 'fail', message: err instanceof Error ? err.message : String(err), durationMs: Date.now() - start };
  } finally {
    await sql?.end();
  }
}
