import postgres from 'postgres';
import type { CheckResult } from '../types.js';

export async function checkPostgres(): Promise<CheckResult> {
  const start = Date.now();
  const service = 'PostgreSQL';

  const connectionString = process.env['DATABASE_URL'];
  const host = process.env['SERVICE_POSTGRES_HOST'];
  const port = process.env['SERVICE_POSTGRES_PORT'];

  if (!connectionString && !host) {
    return {
      service,
      status: 'skip',
      message: 'DATABASE_URL and SERVICE_POSTGRES_HOST are not set',
      durationMs: Date.now() - start,
    };
  }

  let sql: ReturnType<typeof postgres> | undefined;

  try {
    if (connectionString) {
      sql = postgres(connectionString, { max: 1, idle_timeout: 5, connect_timeout: 5 });
    } else {
      sql = postgres({
        host: host!,
        port: port ? parseInt(port, 10) : 5432,
        max: 1,
        idle_timeout: 5,
        connect_timeout: 5,
      });
    }

    await sql`SELECT 1`;

    return {
      service,
      status: 'pass',
      message: 'Connected and ran SELECT 1 successfully',
      durationMs: Date.now() - start,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      service,
      status: 'fail',
      message: `Connection failed: ${message}`,
      durationMs: Date.now() - start,
    };
  } finally {
    if (sql) {
      await sql.end({ timeout: 2 });
    }
  }
}
