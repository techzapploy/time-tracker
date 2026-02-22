import postgres from 'postgres';
import { sanitize } from '../utils/sanitize.ts';
import type { ServiceResult } from '../utils/report.ts';

export async function checkDatabase(): Promise<ServiceResult> {
  const url = process.env.DATABASE_URL;
  if (!url) return { name: 'PostgreSQL', status: 'SKIPPED', details: 'DATABASE_URL not set' };

  const sql = postgres(url, { max: 1, connect_timeout: 10 });
  const start = Date.now();
  try {
    await sql`SELECT 1`;
    return { name: 'PostgreSQL', status: 'UP', latency: Date.now() - start };
  } catch (err) {
    return { name: 'PostgreSQL', status: 'DOWN', error: sanitize(String(err)) };
  } finally {
    await sql.end({ timeout: 5 });
  }
}
