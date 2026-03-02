import postgres from 'postgres';
import type { CheckResult } from '../runner.js';

export default async function check(): Promise<CheckResult> {
  const url = process.env.DATABASE_URL;
  if (!url) return { service: 'PostgreSQL', status: 'skipped', message: 'DATABASE_URL not set' };
  const sql = postgres(url);
  try {
    await sql`SELECT 1`;
    return { service: 'PostgreSQL', status: 'passed', message: 'Connected successfully' };
  } catch (err) {
    return { service: 'PostgreSQL', status: 'failed', message: (err as Error).message };
  } finally {
    await sql.end();
  }
}
