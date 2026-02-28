import type { CheckResult } from '../types.js';

export async function checkPostgres(): Promise<CheckResult> {
  const start = Date.now();
  const url = process.env.DATABASE_URL;

  if (!url) {
    return {
      service: 'postgres',
      status: 'skipped',
      message: 'DATABASE_URL not set',
      duration_ms: Date.now() - start,
    };
  }

  try {
    const { default: postgres } = await import('postgres');
    const sql = postgres(url, { max: 1 });
    await sql`SELECT 1`;
    await sql.end();
    return {
      service: 'postgres',
      status: 'pass',
      message: 'SELECT 1 succeeded',
      duration_ms: Date.now() - start,
    };
  } catch (err) {
    return {
      service: 'postgres',
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      duration_ms: Date.now() - start,
    };
  }
}
