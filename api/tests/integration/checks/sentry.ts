import type { CheckResult } from './database.js';

export async function checkSentry(): Promise<CheckResult> {
  const name = 'Sentry';
  const start = Date.now();

  const token = process.env['SENTRY_AUTH_TOKEN'];
  if (!token) {
    return {
      name,
      status: 'skipped',
      message: 'SENTRY_AUTH_TOKEN env var is not set',
      durationMs: Date.now() - start,
    };
  }

  try {
    const response = await fetch('https://sentry.io/api/0/', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(10000),
    });

    // 200 means authenticated, 401 means endpoint reachable but token invalid
    if (response.status === 200 || response.status === 401) {
      return {
        name,
        status: 'pass',
        message: `Sentry API reachable (HTTP ${response.status})`,
        durationMs: Date.now() - start,
      };
    }

    return {
      name,
      status: 'fail',
      message: `Unexpected HTTP status: ${response.status}`,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    return {
      name,
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
    };
  }
}
