import postgres from 'postgres';

export interface CheckResult {
  name: string;
  status: 'ok' | 'failed' | 'skipped';
  message: string;
  durationMs: number;
}

export async function check(): Promise<CheckResult> {
  const name = 'PostgreSQL';
  const databaseUrl = process.env['DATABASE_URL'];

  if (!databaseUrl || databaseUrl.trim() === '') {
    return { name, status: 'skipped', message: 'DATABASE_URL not set', durationMs: 0 };
  }

  const start = Date.now();
  const sql = postgres(databaseUrl, { max: 1 });

  try {
    await sql`SELECT 1`;
    return { name, status: 'ok', message: 'Connection successful', durationMs: Date.now() - start };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { name, status: 'failed', message, durationMs: Date.now() - start };
  } finally {
    await sql.end();
  }
}
