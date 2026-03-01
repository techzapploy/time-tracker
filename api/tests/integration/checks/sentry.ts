import { type ServiceCheckResult, sanitizeError, fetchWithTimeout } from './types.js';

export async function checkSentry(): Promise<ServiceCheckResult> {
  const timestamp = new Date().toISOString();
  const service = 'sentry';

  const sentryDsn = process.env['SENTRY_DSN'];

  if (!sentryDsn) {
    return {
      service,
      status: 'skip',
      message: 'Skipped: SENTRY_DSN is unset',
      timestamp,
    };
  }

  // Validate DSN URL format
  let parsedDsn: URL;
  try {
    parsedDsn = new URL(sentryDsn);
  } catch {
    return {
      service,
      status: 'fail',
      message: 'Sentry DSN is not a valid URL',
      timestamp,
    };
  }

  const validProtocols = ['http:', 'https:'];
  if (!validProtocols.includes(parsedDsn.protocol)) {
    return {
      service,
      status: 'fail',
      message: `Sentry DSN has invalid protocol: ${parsedDsn.protocol}`,
      timestamp,
    };
  }

  // Check Sentry status page
  try {
    const response = await fetchWithTimeout('https://status.sentry.io/api/v2/status.json', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (response.ok) {
      const data = (await response.json()) as { status?: { indicator?: string; description?: string } };
      const indicator = data.status?.indicator ?? 'unknown';
      const description = data.status?.description ?? 'unknown';

      return {
        service,
        status: 'pass',
        message: `Sentry DSN valid, status page accessible. Service status: ${indicator} - ${description}`,
        timestamp,
      };
    }

    return {
      service,
      status: 'fail',
      message: `Sentry status page returned HTTP ${response.status}`,
      timestamp,
    };
  } catch (error) {
    return {
      service,
      status: 'fail',
      message: `Sentry status check failed: ${sanitizeError(error)}`,
      timestamp,
    };
  }
}
