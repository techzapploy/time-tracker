import postgres from 'postgres';
import { ServiceCheckResult, sanitizeError } from './types.js';

export async function checkPostgres(): Promise<ServiceCheckResult> {
  const timestamp = new Date().toISOString();
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return { service: 'PostgreSQL', status: 'skip', message: 'DATABASE_URL not set', timestamp };
  }

  let sql: ReturnType<typeof postgres> | undefined;
  try {
    sql = postgres(databaseUrl, { max: 1 });
    await sql`SELECT 1`;
    return { service: 'PostgreSQL', status: 'pass', message: 'Connection successful', timestamp };
  } catch (error) {
    return { service: 'PostgreSQL', status: 'fail', message: sanitizeError(error), timestamp };
  } finally {
    if (sql) await sql.end().catch(() => {});
  }
}
