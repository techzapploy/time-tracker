import postgres from 'postgres';

export type CheckResult = {
  service: string;
  status: 'pass' | 'fail' | 'skip';
  message: string;
  durationMs: number;
};

export async function check(): Promise<CheckResult> {
  const start = Date.now();
  const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/clockify';
  const sql = postgres(databaseUrl, { max: 1, connect_timeout: 9 });
  try {
    await sql`SELECT 1`;
    await sql.end();
    return { service: 'PostgreSQL', status: 'pass', message: 'Connected successfully', durationMs: Date.now() - start };
  } catch (err) {
    await sql.end({ timeout: 1 }).catch(() => undefined);
    const message = err instanceof Error ? err.message : String(err);
    return { service: 'PostgreSQL', status: 'fail', message, durationMs: Date.now() - start };
  }
}
