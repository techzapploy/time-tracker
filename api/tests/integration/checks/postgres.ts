import type { CheckResult } from '../types.js';

export async function checkPostgres(): Promise<CheckResult> {
  const start = Date.now();
  const service = 'postgres';

  const databaseUrl = process.env['DATABASE_URL'];
  if (!databaseUrl) {
    return {
      service,
      status: 'skipped',
      message: 'DATABASE_URL not set',
      duration_ms: Date.now() - start,
    };
  }

  try {
    const { default: postgres } = await import('postgres');
    const sql = postgres(databaseUrl, { max: 1, connect_timeout: 10 });
    await sql`SELECT 1`;
    await sql.end({ timeout: 5 });
    return {
      service,
      status: 'pass',
      message: 'Connected and executed SELECT 1 successfully',
      duration_ms: Date.now() - start,
    };
  } catch (err) {
    return {
      service,
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      duration_ms: Date.now() - start,
    };
  }
}
