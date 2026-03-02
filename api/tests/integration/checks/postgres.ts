import type { CheckResult } from '../types.js';
import postgres from 'postgres';

const name = 'PostgreSQL';

export default async function checkPostgres(): Promise<CheckResult> {
  const start = Date.now();

  const host = process.env.SERVICE_POSTGRES_HOST || 'postgres';
  const port = process.env.SERVICE_POSTGRES_PORT || '5432';
  const url =
    process.env.DATABASE_URL ||
    `postgresql://postgres:test@${host}:${port}/postgres`;

  let sql: ReturnType<typeof postgres> | null = null;

  try {
    sql = postgres(url, {
      connect_timeout: 9,
      max: 1,
    });

    await sql`SELECT 1`;

    return {
      name,
      status: 'pass',
      reason: `Connected successfully to ${host}:${port}`,
      duration_ms: Date.now() - start,
    };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    return {
      name,
      status: 'fail',
      reason: `Connection failed: ${reason}`,
      duration_ms: Date.now() - start,
    };
  } finally {
    if (sql) {
      await sql.end({ timeout: 2 }).catch(() => {});
    }
  }
}
