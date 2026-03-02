import type { CheckResult } from '../types.js';

export async function check(): Promise<CheckResult> {
  const timestamp = new Date().toISOString();
  const service = 'Sentry';

  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    return { service, status: 'skip', message: 'SENTRY_DSN not set', timestamp };
  }

  let origin: string;
  try {
    const parsed = new URL(dsn);
    origin = parsed.origin;
  } catch {
    return { service, status: 'fail', message: 'Invalid SENTRY_DSN URL', timestamp };
  }

  try {
    await fetch(origin, { signal: AbortSignal.timeout(4000) });
    // Any HTTP response confirms connectivity
    return { service, status: 'pass', message: 'Reachable', timestamp };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error';
    return { service, status: 'fail', message, timestamp };
  }
}
