import postgres from 'postgres';
import type { CheckResult } from '../types.js';

export async function checkPostgres(): Promise<CheckResult> {
  const start = Date.now();
  const name = 'postgres';

  const host = process.env.SERVICE_POSTGRES_HOST;
  const port = process.env.SERVICE_POSTGRES_PORT;
  const databaseUrl = process.env.DATABASE_URL;

  if (!host && !databaseUrl) {
    return {
      name,
      status: 'skip',
      message: 'SERVICE_POSTGRES_HOST and DATABASE_URL are not set',
      durationMs: Date.now() - start,
    };
  }

  const connectionString =
    databaseUrl ??
    `postgresql://postgres:postgres@${host}:${port ?? '5432'}/postgres`;

  let sql: ReturnType<typeof postgres> | null = null;
  try {
    sql = postgres(connectionString, { max: 1, connect_timeout: 4 });
    await sql`SELECT 1`;
    return {
      name,
      status: 'ok',
      message: 'PostgreSQL connection successful',
      durationMs: Date.now() - start,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      name,
      status: 'fail',
      message: `PostgreSQL connection failed: ${message}`,
      durationMs: Date.now() - start,
    };
  } finally {
    if (sql !== null) {
      await sql.end().catch(() => undefined);
    }
  }
}
