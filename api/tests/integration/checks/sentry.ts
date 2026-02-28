import type { CheckResult } from '../types.js';

export async function checkSentry(): Promise<CheckResult> {
  const service = 'Sentry';
  const start = Date.now();
  const dsn = process.env['SENTRY_DSN'];
  if (!dsn) {
    return { service, status: 'fail', message: 'Environment variable SENTRY_DSN is not set', durationMs: Date.now() - start };
  }
  const pattern = /^https:\/\/.+@.+\/.+$/;
  if (pattern.test(dsn)) {
    return { service, status: 'pass', message: 'SENTRY_DSN format is valid', durationMs: Date.now() - start };
  }
  return { service, status: 'fail', message: 'SENTRY_DSN does not match expected format', durationMs: Date.now() - start };
}
