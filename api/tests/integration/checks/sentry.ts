import type { CheckResult } from '../types.js';

export async function checkSentry(): Promise<CheckResult> {
  const timestamp = new Date().toISOString();
  const authToken = process.env.SENTRY_AUTH_TOKEN;
  const dsn = process.env.SENTRY_DSN;

  if (!authToken && !dsn) {
    return { service: 'Sentry', status: 'skip', message: 'SENTRY_AUTH_TOKEN and SENTRY_DSN not set', timestamp };
  }

  try {
    if (authToken) {
      const res = await fetch('https://sentry.io/api/0/projects/', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        return { service: 'Sentry', status: 'pass', message: 'Auth token valid', timestamp };
      }
      return { service: 'Sentry', status: 'fail', message: `HTTP ${res.status} from Sentry API`, timestamp };
    }

    // Only DSN is set — validate format
    const url = new URL(dsn!);
    if (!url.hostname) {
      return { service: 'Sentry', status: 'fail', message: 'Invalid SENTRY_DSN format', timestamp };
    }
    return { service: 'Sentry', status: 'skip', message: 'SENTRY_DSN format valid (no auth token to verify API)', timestamp };
  } catch (err) {
    return { service: 'Sentry', status: 'fail', message: err instanceof Error ? err.message : String(err), timestamp };
  }
}
