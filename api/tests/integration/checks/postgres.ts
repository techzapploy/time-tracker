import postgres from 'postgres';

interface CheckResult {
  name: string;
  status: 'ok' | 'failed' | 'skipped';
  message: string;
  durationMs?: number;
}

export async function checkPostgres(): Promise<CheckResult> {
  const name = 'PostgreSQL';

  let connectionString: string;

  if (process.env.DATABASE_URL) {
    connectionString = process.env.DATABASE_URL;
  } else if (process.env.SERVICE_POSTGRES_HOST) {
    const host = process.env.SERVICE_POSTGRES_HOST;
    const port = process.env.SERVICE_POSTGRES_PORT || '5432';
    const password = process.env.SERVICE_POSTGRES_PASSWORD || 'test';
    connectionString = `postgresql://postgres:${password}@${host}:${port}/postgres`;
  } else if (process.env.POSTGRES_HOST) {
    const host = process.env.POSTGRES_HOST;
    const port = process.env.POSTGRES_PORT || '5432';
    const password = process.env.POSTGRES_PASSWORD || process.env.DB_PASSWORD || 'test';
    const user = process.env.POSTGRES_USER || 'postgres';
    connectionString = `postgresql://${user}:${password}@${host}:${port}/postgres`;
  } else {
    connectionString = 'postgresql://postgres:test@postgres:5432/postgres';
  }

  const start = Date.now();
  let sql: ReturnType<typeof postgres> | null = null;

  try {
    sql = postgres(connectionString, {
      connect_timeout: 10,
      max: 1,
    });

    await sql`SELECT 1 AS health_check`;
    const durationMs = Date.now() - start;

    return { name, status: 'ok', message: 'Connected successfully', durationMs };
  } catch (err) {
    return { name, status: 'failed', message: String(err) };
  } finally {
    if (sql) {
      await sql.end({ timeout: 5 }).catch(() => {});
    }
  }
}
