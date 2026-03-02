import postgres from 'postgres';

export interface CheckResult {
  name: string;
  status: 'ok' | 'failed' | 'skipped';
  message: string;
  durationMs?: number;
}

export async function checkPostgres(): Promise<CheckResult> {
  const host = process.env.SERVICE_POSTGRES_HOST || process.env.POSTGRES_HOST || 'postgres';
  const port = parseInt(process.env.SERVICE_POSTGRES_PORT || process.env.POSTGRES_PORT || '5432', 10);
  const password = process.env.SERVICE_POSTGRES_PASSWORD || process.env.POSTGRES_PASSWORD || process.env.DB_PASSWORD || 'test';
  const user = process.env.POSTGRES_USER || 'postgres';
  // For connectivity check, fall back to 'postgres' system DB if app DB not available
  const database = process.env.POSTGRES_DB || 'postgres';

  // Prefer explicit DATABASE_URL if set
  const databaseUrl =
    process.env.DATABASE_URL ||
    `postgresql://${user}:${password}@${host}:${port}/${database}`;

  const start = Date.now();
  let sql: ReturnType<typeof postgres> | null = null;

  try {
    sql = postgres(databaseUrl, {
      connect_timeout: 10,
      max: 1,
    });

    await sql`SELECT 1 AS health_check`;
    const durationMs = Date.now() - start;

    return {
      name: 'PostgreSQL',
      status: 'ok',
      message: `Connected successfully to ${host}:${port}`,
      durationMs,
    };
  } catch (err) {
    const durationMs = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    return {
      name: 'PostgreSQL',
      status: 'failed',
      message: `Connection failed: ${message}`,
      durationMs,
    };
  } finally {
    if (sql) {
      await sql.end();
    }
  }
}
