import postgres from 'postgres';

export interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'skipped';
  message: string;
  durationMs: number;
}

export async function checkDatabase(): Promise<CheckResult> {
  const name = 'PostgreSQL';
  const start = Date.now();

  if (!process.env['DATABASE_URL']) {
    return {
      name,
      status: 'fail',
      message: 'DATABASE_URL env var is not set',
      durationMs: Date.now() - start,
    };
  }

  const sql = postgres(process.env['DATABASE_URL']);
  try {
    await sql`SELECT 1`;
    return {
      name,
      status: 'pass',
      message: 'Connected and queried successfully',
      durationMs: Date.now() - start,
    };
  } catch (err) {
    return {
      name,
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
    };
  } finally {
    await sql.end();
  }
}
