import postgres from 'postgres';

export interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'skipped';
  message: string;
  durationMs: number;
}

export async function checkDatabase(): Promise<CheckResult> {
  const start = Date.now();
  const url = process.env.DATABASE_URL;

  if (!url) {
    return { name: 'PostgreSQL', status: 'fail', message: 'DATABASE_URL env var is not set', durationMs: Date.now() - start };
  }

  let sql: ReturnType<typeof postgres> | undefined;
  try {
    sql = postgres(url, { connect_timeout: 10 });
    await sql`SELECT 1 as ok`;
    return { name: 'PostgreSQL', status: 'pass', message: 'Connected and queried successfully', durationMs: Date.now() - start };
  } catch (err) {
    return { name: 'PostgreSQL', status: 'fail', message: err instanceof Error ? err.message : String(err), durationMs: Date.now() - start };
  } finally {
    if (sql) await sql.end().catch(() => {});
  }
}
