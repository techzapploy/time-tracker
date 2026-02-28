import type { CheckResult } from './database.js';

export async function checkSentry(): Promise<CheckResult> {
  const start = Date.now();
  const token = process.env.SENTRY_AUTH_TOKEN;

  if (!token) {
    return { name: 'Sentry', status: 'skipped', message: 'SENTRY_AUTH_TOKEN not set', durationMs: Date.now() - start };
  }

  try {
    const res = await fetch('https://sentry.io/api/0/', {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10000),
    });
    if (res.status === 200 || res.status === 401) {
      return { name: 'Sentry', status: 'pass', message: `HTTP ${res.status} (endpoint reachable)`, durationMs: Date.now() - start };
    }
    return { name: 'Sentry', status: 'fail', message: `HTTP ${res.status}`, durationMs: Date.now() - start };
  } catch (err) {
    return { name: 'Sentry', status: 'fail', message: err instanceof Error ? err.message : String(err), durationMs: Date.now() - start };
  }
}
