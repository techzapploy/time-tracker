import postgres from 'postgres';
import type { CheckResult } from '../types.js';

export async function checkPostgres(): Promise<CheckResult> {
  const start = Date.now();
  const url =
    process.env['DATABASE_URL'] ??
    'postgresql://postgres:test@postgres:5432/postgres';
  const sql = postgres(url, { max: 1 });
  try {
    await sql`SELECT 1`;
    return {
      name: 'postgres',
      status: 'pass',
      duration_ms: Date.now() - start,
    };
  } catch (err) {
    return {
      name: 'postgres',
      status: 'fail',
      reason: err instanceof Error ? err.message : String(err),
      duration_ms: Date.now() - start,
    };
  } finally {
    await sql.end({ timeout: 2 }).catch(() => {});
  }
}
