import type { CheckResult } from '../types.js';

export async function checkSentry(): Promise<CheckResult> {
  const start = Date.now();
  const service = 'sentry';

  const dsn = process.env['SENTRY_DSN'];
  if (!dsn) {
    return {
      service,
      status: 'skipped',
      message: 'SENTRY_DSN not set',
      duration_ms: Date.now() - start,
    };
  }

  try {
    const parsed = new URL(dsn);

    if (!parsed.hostname.includes('sentry.io')) {
      return {
        service,
        status: 'fail',
        message: `DSN hostname '${parsed.hostname}' does not include 'sentry.io'`,
        duration_ms: Date.now() - start,
      };
    }

    const response = await fetch(`https://${parsed.hostname}/api/`, {
      method: 'GET',
      signal: AbortSignal.timeout(10000),
    });

    if (response.status < 500) {
      return {
        service,
        status: 'pass',
        message: `Sentry API reachable (HTTP ${response.status})`,
        duration_ms: Date.now() - start,
      };
    } else {
      return {
        service,
        status: 'fail',
        message: `HTTP ${response.status}`,
        duration_ms: Date.now() - start,
      };
    }
  } catch (err) {
    return {
      service,
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      duration_ms: Date.now() - start,
    };
  }
}
