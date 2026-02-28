import type { CheckResult } from '../types.js';

export async function checkSentry(): Promise<CheckResult> {
  const name = 'Sentry';
  const start = Date.now();

  const authToken = process.env.SENTRY_AUTH_TOKEN;
  if (!authToken) {
    return { name, status: 'skipped', message: 'SENTRY_AUTH_TOKEN not set', durationMs: 0 };
  }

  try {
    const response = await fetch('https://sentry.io/api/0/', {
      headers: { Authorization: `Bearer ${authToken}` },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return {
        name,
        status: 'fail',
        message: `HTTP ${response.status}: ${response.statusText}`,
        durationMs: Date.now() - start,
      };
    }

    const org = process.env.SENTRY_ORG;
    const orgNote = org ? ` (org: ${org})` : '';
    return {
      name,
      status: 'pass',
      message: `Sentry API reachable${orgNote}`,
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
