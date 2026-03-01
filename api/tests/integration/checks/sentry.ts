import { ServiceCheckResult, sanitizeError, fetchWithTimeout } from './types.js';

export async function checkSentry(): Promise<ServiceCheckResult> {
  const timestamp = new Date().toISOString();
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    return { service: 'Sentry', status: 'skip', message: 'SENTRY_DSN not set', timestamp };
  }

  try {
    new URL(dsn); // Throws if invalid
  } catch {
    return { service: 'Sentry', status: 'fail', message: 'SENTRY_DSN is not a valid URL', timestamp };
  }

  try {
    const res = await fetchWithTimeout('https://status.sentry.io/api/v2/status.json', { method: 'GET' });
    if (res.ok) {
      return { service: 'Sentry', status: 'pass', message: 'DSN valid and Sentry status page reachable', timestamp };
    }
    return { service: 'Sentry', status: 'fail', message: `Sentry status page returned HTTP ${res.status}`, timestamp };
  } catch (error) {
    return { service: 'Sentry', status: 'fail', message: sanitizeError(error), timestamp };
  }
}
