import type { ServiceCheckResult } from './types.js';
import { fetchWithTimeout, sanitizeError } from './types.js';

export async function checkSentry(): Promise<ServiceCheckResult> {
  const timestamp = new Date().toISOString();
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    return { service: 'Sentry', status: 'skip', message: 'SENTRY_DSN not configured', timestamp };
  }

  try {
    new URL(dsn); // Validate DSN format
    const response = await fetchWithTimeout('https://status.sentry.io/api/v2/status.json');
    if (response.ok) {
      return { service: 'Sentry', status: 'pass', message: 'Sentry status page accessible', timestamp };
    }
    return { service: 'Sentry', status: 'fail', message: `Status page returned ${response.status}`, timestamp };
  } catch (error) {
    return { service: 'Sentry', status: 'fail', message: sanitizeError(error), timestamp };
  }
}
