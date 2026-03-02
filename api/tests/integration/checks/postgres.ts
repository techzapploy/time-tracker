/**
 * PostgreSQL Integration Check
 *
 * Connects to PostgreSQL using DATABASE_URL or SERVICE_POSTGRES_HOST/PORT env vars.
 * Skips gracefully if no connection parameters are available.
 */

import type { CheckResult } from '../runner.js';

export async function checkPostgres(): Promise<CheckResult> {
  const name = 'PostgreSQL';

  // Build connection URL from environment
  const databaseUrl =
    process.env.DATABASE_URL ||
    (() => {
      const host = process.env.SERVICE_POSTGRES_HOST || process.env.POSTGRES_HOST;
      const port = process.env.SERVICE_POSTGRES_PORT || process.env.POSTGRES_PORT || '5432';
      const user = process.env.POSTGRES_USER || 'postgres';
      const password = process.env.POSTGRES_PASSWORD || 'postgres';
      const db = process.env.POSTGRES_DB || 'postgres';
      if (!host) return null;
      return `postgresql://${user}:${password}@${host}:${port}/${db}`;
    })();

  if (!databaseUrl) {
    return {
      name,
      status: 'skipped',
      message: 'No PostgreSQL connection parameters found (DATABASE_URL or SERVICE_POSTGRES_HOST)',
      durationMs: 0,
    };
  }

  try {
    // Dynamically import postgres to avoid top-level connection
    const { default: postgres } = await import('postgres');
    const sql = postgres(databaseUrl, {
      connect_timeout: 4,
      idle_timeout: 1,
      max: 1,
    });

    // Run a simple connectivity check
    const result = await sql`SELECT version(), current_database(), now() as server_time`;
    const row = result[0];

    await sql.end();

    return {
      name,
      status: 'passed',
      message: `Connected to database "${row.current_database}" - ${row.version.split(' ').slice(0, 2).join(' ')}`,
      durationMs: 0,
    };
  } catch (err) {
    return {
      name,
      status: 'failed',
      message: 'Failed to connect to PostgreSQL',
      durationMs: 0,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
