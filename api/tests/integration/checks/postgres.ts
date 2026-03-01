import postgres from 'postgres';
import type { CheckResult } from '../types.js';

export async function checkPostgres(): Promise<CheckResult> {
  const service = 'PostgreSQL';
  const start = Date.now();

  const host = process.env.SERVICE_POSTGRES_HOST ?? 'postgres';
  const port = parseInt(process.env.SERVICE_POSTGRES_PORT ?? '5432', 10);
  const user = process.env.SERVICE_POSTGRES_USER ?? 'postgres';
  const password = process.env.SERVICE_POSTGRES_PASSWORD ?? 'postgres';
  const database = process.env.SERVICE_POSTGRES_DB ?? 'postgres';

  const connectionString =
    process.env.DATABASE_URL ??
    `postgresql://${user}:${password}@${host}:${port}/${database}`;

  let sql: ReturnType<typeof postgres> | null = null;

  try {
    sql = postgres(connectionString, {
      connect_timeout: 10,
      max: 1,
    });

    await sql`SELECT 1`;

    const duration = Date.now() - start;
    return {
      service,
      status: 'pass',
      duration,
      message: `Connected to ${host}:${port}`,
    };
  } catch (err) {
    const duration = Date.now() - start;
    const message =
      err instanceof Error ? err.message : 'Unknown error connecting to PostgreSQL';
    return {
      service,
      status: 'fail',
      duration,
      message,
    };
  } finally {
    if (sql !== null) {
      await sql.end({ timeout: 5 });
    }
  }
}
