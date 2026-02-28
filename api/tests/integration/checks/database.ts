import postgres from 'postgres';

export interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'skipped';
  message: string;
  durationMs: number;
}

export async function checkDatabase(): Promise<CheckResult> {
  const start = Date.now();
  const name = 'PostgreSQL';

  const url = process.env['DATABASE_URL'];
  if (!url) {
    return { name, status: 'fail', message: 'DATABASE_URL env var is not set', durationMs: Date.now() - start };
  }

  let sql: ReturnType<typeof postgres> | undefined;
  try {
    sql = postgres(url, { connect_timeout: 10, idle_timeout: 10 });
    const result = await sql`SELECT 1 as ok`;
    if (result[0]?.ok !== 1) {
      return { name, status: 'fail', message: 'SELECT 1 returned unexpected result', durationMs: Date.now() - start };
    }
    return { name, status: 'pass', message: 'Connected and SELECT 1 succeeded', durationMs: Date.now() - start };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { name, status: 'fail', message: `Connection failed: ${message}`, durationMs: Date.now() - start };
  } finally {
    if (sql) {
      await sql.end().catch(() => undefined);
    }
  }
}
