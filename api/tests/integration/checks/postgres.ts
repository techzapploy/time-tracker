import postgres from 'postgres';
import type { CheckResult } from '../types.js';

export async function checkPostgres(): Promise<CheckResult> {
  const url = process.env['DATABASE_URL'];
  if (!url) {
    return { service: 'postgres', status: 'skipped', durationMs: 0 };
  }

  const start = Date.now();
  let sql: ReturnType<typeof postgres> | undefined;
  try {
    sql = postgres(url);
    await sql`SELECT 1`;
    await sql.end();
    return { service: 'postgres', status: 'ok', durationMs: Date.now() - start };
  } catch (err) {
    if (sql) {
      try { await sql.end(); } catch { /* ignore */ }
    }
    const message = err instanceof Error ? err.message : String(err);
    return { service: 'postgres', status: 'failed', message, durationMs: Date.now() - start };
  }
}
