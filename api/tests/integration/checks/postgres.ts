import postgres from 'postgres';
import { type ServiceCheckResult, sanitizeError } from './types.js';

export async function checkPostgres(): Promise<ServiceCheckResult> {
  const timestamp = new Date().toISOString();
  const service = 'postgres';

  const databaseUrl = process.env['DATABASE_URL'];
  const postgresHost = process.env['POSTGRES_HOST'];

  if (!databaseUrl && !postgresHost) {
    return {
      service,
      status: 'skip',
      message: 'Skipped: DATABASE_URL and POSTGRES_HOST are both unset',
      timestamp,
    };
  }

  let sql: ReturnType<typeof postgres> | undefined;

  try {
    const connectionConfig = databaseUrl
      ? databaseUrl
      : {
          host: postgresHost,
          port: parseInt(process.env['POSTGRES_PORT'] ?? '5432', 10),
          database: process.env['POSTGRES_DB'] ?? 'postgres',
          username: process.env['POSTGRES_USER'] ?? 'postgres',
          password: process.env['POSTGRES_PASSWORD'] ?? '',
        };

    sql = postgres(connectionConfig as string, {
      max: 1,
      connect_timeout: 10,
    });

    await sql`SELECT 1`;

    return {
      service,
      status: 'pass',
      message: 'PostgreSQL connection successful (SELECT 1 executed)',
      timestamp,
    };
  } catch (error) {
    return {
      service,
      status: 'fail',
      message: `PostgreSQL connection failed: ${sanitizeError(error)}`,
      timestamp,
    };
  } finally {
    if (sql) {
      await sql.end({ timeout: 5 }).catch(() => {});
    }
  }
}
