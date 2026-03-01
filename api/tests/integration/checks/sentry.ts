import type { CheckResult } from '../types.js';

export async function checkSentry(): Promise<CheckResult> {
  const start = Date.now();
  const service = 'Sentry';

  const dsn = process.env['SENTRY_DSN'];

  if (!dsn) {
    return {
      service,
      status: 'skip',
      message: 'SENTRY_DSN is not set',
      durationMs: Date.now() - start,
    };
  }

  let host: string;
  try {
    const url = new URL(dsn);
    host = url.hostname;
  } catch {
    return {
      service,
      status: 'fail',
      message: `Invalid SENTRY_DSN format: could not parse URL`,
      durationMs: Date.now() - start,
    };
  }

  try {
    const response = await fetch(`https://${host}/api/0/`, { method: 'GET' });

    // Any HTTP reply means the service is reachable (even 401 Unauthorized)
    return {
      service,
      status: 'pass',
      message: `Sentry host reachable (HTTP ${response.status})`,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      service,
      status: 'fail',
      message: `Network error reaching ${host}: ${message}`,
      durationMs: Date.now() - start,
    };
  }
}
