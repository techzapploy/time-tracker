import type { CheckResult } from '../types.js';

export async function checkSentry(): Promise<CheckResult> {
  const start = Date.now();
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    return {
      service: 'sentry',
      status: 'skipped',
      message: 'SENTRY_DSN not set',
      duration_ms: Date.now() - start,
    };
  }

  try {
    const url = new URL(dsn);
    if (!url.hostname.includes('sentry.io')) {
      return {
        service: 'sentry',
        status: 'fail',
        message: `DSN hostname does not contain sentry.io: ${url.hostname}`,
        duration_ms: Date.now() - start,
      };
    }
    const res = await fetch(`https://${url.hostname}/api/`, { method: 'GET' });
    if (res.status < 500) {
      return {
        service: 'sentry',
        status: 'pass',
        message: `GET /api/ returned ${res.status}`,
        duration_ms: Date.now() - start,
      };
    }
    return {
      service: 'sentry',
      status: 'fail',
      message: `GET /api/ returned ${res.status}`,
      duration_ms: Date.now() - start,
    };
  } catch (err) {
    return {
      service: 'sentry',
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      duration_ms: Date.now() - start,
    };
  }
}
