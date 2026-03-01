import postgres from 'postgres';
import type { CheckResult } from '../types';

export async function checkPostgres(): Promise<CheckResult> {
  const start = Date.now();

  if (!process.env.DATABASE_URL) {
    return {
      name: 'postgres',
      status: 'skip',
      message: 'DATABASE_URL is not set',
      durationMs: Date.now() - start,
    };
  }

  let sql: ReturnType<typeof postgres> | null = null;

  try {
    sql = postgres(process.env.DATABASE_URL, {
      max: 1,
      connect_timeout: 10,
    });

    const result = await sql`SELECT 1 AS ok`;

    if (result[0].ok === 1) {
      return {
        name: 'postgres',
        status: 'pass',
        message: 'Connected and query succeeded',
        durationMs: Date.now() - start,
      };
    }

    return {
      name: 'postgres',
      status: 'fail',
      message: `Unexpected result: ${JSON.stringify(result[0])}`,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    return {
      name: 'postgres',
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
    };
  } finally {
    if (sql) {
      await sql.end();
    }
  }
}
