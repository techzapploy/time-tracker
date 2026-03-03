import postgres from 'postgres';

interface CheckResult {
  service: string;
  status: 'pass' | 'fail' | 'skip';
  message: string;
  durationMs?: number;
}

export default async function checkPostgres(): Promise<CheckResult> {
  const start = Date.now();
  const connectionString =
    process.env.DATABASE_URL ||
    `postgresql://postgres:postgres@${process.env.SERVICE_POSTGRES_HOST || 'postgres'}:${process.env.SERVICE_POSTGRES_PORT || '5432'}/postgres`;

  const sql = postgres(connectionString, { max: 1, connect_timeout: 5 });
  try {
    await sql`SELECT 1`;
    return {
      service: 'postgres',
      status: 'pass',
      message: 'Connected and SELECT 1 succeeded',
      durationMs: Date.now() - start,
    };
  } catch (err) {
    return {
      service: 'postgres',
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
    };
  } finally {
    await sql.end();
  }
}
