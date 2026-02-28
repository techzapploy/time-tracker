import postgres from 'postgres';
import type { CheckResult } from '../types.js';

export default async function checkPostgres(): Promise<CheckResult> {
  const service = 'postgres';
  const start = Date.now();

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return {
      service,
      status: 'skipped',
      message: 'DATABASE_URL env var not set',
      duration_ms: Date.now() - start,
    };
  }

  let sql: ReturnType<typeof postgres> | undefined;
  try {
    sql = postgres(databaseUrl);
    await sql`SELECT 1`;
    await sql.end();
    return {
      service,
      status: 'pass',
      message: 'Successfully connected and ran SELECT 1',
      duration_ms: Date.now() - start,
    };
  } catch (error) {
    if (sql) {
      try { await sql.end(); } catch {}
    }
    const message = error instanceof Error ? error.message : String(error);
    return {
      service,
      status: 'fail',
      message,
      duration_ms: Date.now() - start,
    };
  }
}
