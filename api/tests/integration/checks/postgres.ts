import postgres from 'postgres';
import type { CheckResult } from '../types.js';

export async function checkPostgres(): Promise<CheckResult> {
  const service = 'PostgreSQL';
  const databaseUrl = process.env['DATABASE_URL'];

  if (!databaseUrl) {
    return {
      service,
      passed: false,
      message: 'DATABASE_URL environment variable is not set',
    };
  }

  let sql: ReturnType<typeof postgres> | null = null;

  try {
    sql = postgres(databaseUrl, { connect_timeout: 10 });
    await sql`SELECT 1`;
    return {
      service,
      passed: true,
      message: 'Successfully connected to PostgreSQL and executed SELECT 1',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      service,
      passed: false,
      message: `PostgreSQL connection failed: ${message}`,
    };
  } finally {
    if (sql) {
      await sql.end();
    }
  }
}
