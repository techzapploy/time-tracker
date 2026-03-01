import postgres from 'postgres';
import type { ServiceCheckResult } from './types.js';
import { sanitizeError } from './types.js';

export async function checkPostgres(): Promise<ServiceCheckResult> {
  const timestamp = new Date().toISOString();
  const host = process.env.SERVICE_POSTGRES_HOST || process.env.POSTGRES_HOST;
  const port = process.env.SERVICE_POSTGRES_PORT || process.env.POSTGRES_PORT || '5432';
  const user = process.env.POSTGRES_USER || 'postgres';
  const password = process.env.POSTGRES_PASSWORD || 'postgres';
  const database = process.env.POSTGRES_DB || 'postgres';

  // Build connection URL from components if DATABASE_URL not available
  const databaseUrl = process.env.DATABASE_URL ||
    (host ? `postgresql://${user}:${password}@${host}:${port}/${database}` : null);

  if (!databaseUrl && !host) {
    return { service: 'PostgreSQL', status: 'skip', message: 'No database configuration provided', timestamp };
  }

  let sql: ReturnType<typeof postgres> | null = null;
  try {
    sql = postgres(databaseUrl || `postgresql://${user}:${password}@${host}:${port}/${database}`, {
      max: 1,
      connect_timeout: 10,
    });
    await sql`SELECT 1`;
    return { service: 'PostgreSQL', status: 'pass', message: 'Connection successful', timestamp };
  } catch (error) {
    return { service: 'PostgreSQL', status: 'fail', message: sanitizeError(error), timestamp };
  } finally {
    if (sql) await sql.end();
  }
}
