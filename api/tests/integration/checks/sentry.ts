import type { CheckResult } from '../types.js';

export async function checkSentry(): Promise<CheckResult> {
  const start = Date.now();
  const dsn = process.env['SENTRY_DSN'];
  if (!dsn) {
    return {
      name: 'sentry',
      status: 'skip',
      reason: 'SENTRY_DSN not set',
      duration_ms: Date.now() - start,
    };
  }
  try {
    const url = new URL(dsn);
    const publicKey = url.username;
    const host = url.hostname;
    const projectId = url.pathname.replace(/^\//, '');
    if (!publicKey || !host || !projectId) {
      return {
        name: 'sentry',
        status: 'fail',
        reason: 'Invalid SENTRY_DSN: missing publicKey, host, or projectId',
        duration_ms: Date.now() - start,
      };
    }
    return {
      name: 'sentry',
      status: 'pass',
      reason: `${host}/${projectId}`,
      duration_ms: Date.now() - start,
    };
  } catch (err) {
    return {
      name: 'sentry',
      status: 'fail',
      reason: err instanceof Error ? err.message : String(err),
      duration_ms: Date.now() - start,
    };
  }
}
