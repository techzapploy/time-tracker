import postgres from 'postgres';

export interface CheckResult {
  service: string;
  passed: boolean;
  error?: string;
}

export async function checkPostgres(): Promise<CheckResult> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    return { service: 'postgres', passed: false, error: 'DATABASE_URL env var not set' };
  }

  let sql: ReturnType<typeof postgres> | null = null;
  try {
    sql = postgres(url, { max: 1, connect_timeout: 10 });
    await sql`SELECT 1`;
    return { service: 'postgres', passed: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { service: 'postgres', passed: false, error: message };
  } finally {
    if (sql) {
      await sql.end().catch(() => {});
    }
  }
}
