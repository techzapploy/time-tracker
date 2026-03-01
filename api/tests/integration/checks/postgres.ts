import postgres from 'postgres';
import type { CheckResult } from '../types.js';

export async function checkPostgres(): Promise<CheckResult> {
  const timestamp = new Date().toISOString();
  const url = process.env.DATABASE_URL;

  if (!url) {
    return { service: 'PostgreSQL', status: 'skip', message: 'DATABASE_URL not set', timestamp };
  }

  const sql = postgres(url, { max: 1, connect_timeout: 8 });
  try {
    await sql`SELECT 1`;
    return { service: 'PostgreSQL', status: 'pass', message: 'Connection successful', timestamp };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // Sanitize: remove any credential-like substrings from the URL
    const sanitized = msg.replace(/\/\/[^@]*@/, '//***@');
    return { service: 'PostgreSQL', status: 'fail', message: sanitized, timestamp };
  } finally {
    await sql.end();
  }
}
