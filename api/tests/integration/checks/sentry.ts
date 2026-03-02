import type { CheckResult } from '../types.js';

export async function checkSentry(): Promise<CheckResult> {
  const start = Date.now();
  const authToken = process.env.SENTRY_AUTH_TOKEN;
  const org = process.env.SENTRY_ORG;

  if (!authToken || !org) {
    return {
      name: 'sentry',
      status: 'skip',
      message: 'SENTRY_AUTH_TOKEN or SENTRY_ORG not set',
      durationMs: Date.now() - start,
    };
  }

  try {
    const response = await fetch(`https://sentry.io/api/0/organizations/${org}/`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return {
        name: 'sentry',
        status: 'fail',
        message: `HTTP ${response.status}: ${response.statusText}`,
        durationMs: Date.now() - start,
      };
    }

    return {
      name: 'sentry',
      status: 'pass',
      message: 'Sentry API reachable and token valid',
      durationMs: Date.now() - start,
    };
  } catch (err) {
    return {
      name: 'sentry',
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
    };
  }
}
