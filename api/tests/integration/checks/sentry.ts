import type { CheckResult } from './database.js';

export async function checkSentry(): Promise<CheckResult> {
  const start = Date.now();
  const name = 'Sentry';

  const token = process.env['SENTRY_AUTH_TOKEN'];
  if (!token) {
    return { name, status: 'skipped', message: 'SENTRY_AUTH_TOKEN is not set', durationMs: Date.now() - start };
  }

  try {
    const response = await fetch('https://sentry.io/api/0/', {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10000),
    });
    // 200 = authenticated, 401 = endpoint reachable (auth required)
    if (response.status === 200 || response.status === 401) {
      return { name, status: 'pass', message: `HTTP ${response.status} (endpoint reachable)`, durationMs: Date.now() - start };
    }
    return { name, status: 'fail', message: `HTTP ${response.status}`, durationMs: Date.now() - start };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { name, status: 'fail', message: `Request failed: ${message}`, durationMs: Date.now() - start };
  }
}
