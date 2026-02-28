import type { CheckResult } from '../types.js';

export async function checkPostgres(): Promise<CheckResult> {
  const name = 'PostgreSQL';
  const start = Date.now();

  if (!process.env.DATABASE_URL) {
    return { name, status: 'skipped', message: 'DATABASE_URL not set', durationMs: 0 };
  }

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Timeout after 10s')), 10000)
  );

  let sql: { end: (opts?: { timeout?: number }) => Promise<void>; [key: string]: unknown } | null = null;

  try {
    const operation = async () => {
      const { default: postgres } = await import('postgres');
      sql = postgres(process.env.DATABASE_URL as string, { max: 1, connect_timeout: 9 });
      await (sql as unknown as (strings: TemplateStringsArray) => Promise<unknown>[])`SELECT 1`;
      return 'Connected and SELECT 1 succeeded';
    };

    const message = await Promise.race([operation(), timeoutPromise]);
    return { name, status: 'pass', message: message as string, durationMs: Date.now() - start };
  } catch (err) {
    return {
      name,
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
    };
  } finally {
    if (sql) {
      try {
        await (sql as { end: (opts?: { timeout?: number }) => Promise<void> }).end({ timeout: 2 });
      } catch {
        // ignore cleanup errors
      }
    }
  }
}
