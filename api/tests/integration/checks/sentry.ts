import type { CheckResult } from '../types.js';

export async function checkSentry(): Promise<CheckResult> {
  const start = Date.now();
  const name = 'sentry';

  const authToken = process.env.SENTRY_AUTH_TOKEN;

  if (!authToken) {
    return {
      name,
      status: 'skip',
      message: 'SENTRY_AUTH_TOKEN is not set',
      durationMs: Date.now() - start,
    };
  }

  try {
    const response = await fetch('https://sentry.io/api/0/', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      signal: AbortSignal.timeout(4000),
    });

    if (response.ok) {
      return {
        name,
        status: 'ok',
        message: `Sentry API reachable (HTTP ${response.status})`,
        durationMs: Date.now() - start,
      };
    }

    return {
      name,
      status: 'fail',
      message: `Sentry API returned HTTP ${response.status}`,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      name,
      status: 'fail',
      message: `Sentry API check failed: ${message}`,
      durationMs: Date.now() - start,
    };
  }
}
