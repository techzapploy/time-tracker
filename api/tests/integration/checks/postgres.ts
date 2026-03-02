import postgres from 'postgres';
import type { CheckResult } from '../types.js';

export async function check(): Promise<CheckResult> {
  const timestamp = new Date().toISOString();
  const service = 'PostgreSQL';

  if (!process.env.DATABASE_URL) {
    return { service, status: 'skip', message: 'DATABASE_URL not set', timestamp };
  }

  const sql = postgres(process.env.DATABASE_URL, { max: 1, connect_timeout: 4 });

  try {
    await sql`SELECT 1`;
    return { service, status: 'pass', message: 'Connection successful', timestamp };
  } catch (err) {
    const message = err instanceof Error ? err.message.replace(/postgres:\/\/[^@]+@[^/]+/, '[redacted]') : 'Unknown error';
    return { service, status: 'fail', message, timestamp };
  } finally {
    await sql.end();
  }
}
