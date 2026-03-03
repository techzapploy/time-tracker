import type { CheckResult } from './types.js';

export async function checkPostgres(): Promise<CheckResult> {
  const start = Date.now();
  const service = 'postgres';

  const databaseUrl =
    process.env['DATABASE_URL'] ||
    (() => {
      const host = process.env['SERVICE_POSTGRES_HOST'];
      const port = process.env['SERVICE_POSTGRES_PORT'] || '5432';
      const user = process.env['SERVICE_POSTGRES_USER'] || process.env['POSTGRES_USER'] || 'postgres';
      const password = process.env['SERVICE_POSTGRES_PASSWORD'] || process.env['POSTGRES_PASSWORD'] || 'postgres';
      const db = process.env['SERVICE_POSTGRES_DB'] || process.env['POSTGRES_DB'] || 'postgres';
      if (host) {
        return `postgresql://${user}:${password}@${host}:${port}/${db}`;
      }
      return undefined;
    })();

  if (!databaseUrl) {
    return {
      service,
      status: 'skip',
      message: 'DATABASE_URL not set and SERVICE_POSTGRES_HOST not set',
      duration: Date.now() - start,
    };
  }

  try {
    const { default: postgres } = await import('postgres');
    const sql = postgres(databaseUrl, { max: 1, connect_timeout: 5 });
    try {
      await sql`SELECT 1`;
      return {
        service,
        status: 'pass',
        message: 'Connected and ran SELECT 1 successfully',
        duration: Date.now() - start,
      };
    } finally {
      await sql.end();
    }
  } catch (err) {
    return {
      service,
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      duration: Date.now() - start,
    };
  }
}
