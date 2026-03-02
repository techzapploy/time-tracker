import type { CheckResult } from '../types.js';

export async function checkSentry(): Promise<CheckResult> {
  const token = process.env['SENTRY_AUTH_TOKEN'];
  const org = process.env['SENTRY_ORG'];
  if (!token || !org) {
    return { service: 'sentry', status: 'skipped', durationMs: 0 };
  }

  const start = Date.now();
  try {
    const response = await fetch(`https://sentry.io/api/0/organizations/${org}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(4000),
    });
    if (response.status === 200) {
      return { service: 'sentry', status: 'ok', durationMs: Date.now() - start };
    }
    return {
      service: 'sentry',
      status: 'failed',
      message: `HTTP ${response.status}`,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { service: 'sentry', status: 'failed', message, durationMs: Date.now() - start };
  }
}
