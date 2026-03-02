import postgres from 'postgres';

export type CheckResult = {
  service: string;
  status: 'pass' | 'fail' | 'skip' | 'timeout';
  durationMs: number;
  error: string | null;
};

export async function check(): Promise<CheckResult> {
  const start = Date.now();

  if (!process.env.DATABASE_URL) {
    return { service: 'postgres', status: 'skip', durationMs: 0, error: null };
  }

  let sql: ReturnType<typeof postgres> | null = null;
  try {
    sql = postgres(process.env.DATABASE_URL, { max: 1 });
    await sql`SELECT 1`;
    return { service: 'postgres', status: 'pass', durationMs: Date.now() - start, error: null };
  } catch (err) {
    return {
      service: 'postgres',
      status: 'fail',
      durationMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    if (sql) {
      await sql.end();
    }
  }
}
