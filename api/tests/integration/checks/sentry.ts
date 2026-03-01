import type { CheckResult } from '../types.js';

// Sentry DSN format: https://<key>@<org>.ingest.sentry.io/<project-id>
const DSN_REGEX =
  /^https?:\/\/[a-f0-9]+@[a-z0-9.-]+\.ingest\.sentry\.io\/\d+$/i;

export async function checkSentry(): Promise<CheckResult> {
  const service = 'Sentry';
  const start = Date.now();

  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    return {
      service,
      status: 'skip',
      duration: Date.now() - start,
      message: 'SENTRY_DSN not set',
    };
  }

  // Validate DSN format
  if (!DSN_REGEX.test(dsn)) {
    return {
      service,
      status: 'fail',
      duration: Date.now() - start,
      message: 'SENTRY_DSN format is invalid',
    };
  }

  try {
    // Extract the host from the DSN to verify connectivity
    const url = new URL(dsn);
    const sentryHost = `${url.protocol}//${url.host}`;

    const response = await fetch(`${sentryHost}/api/0/`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });

    const duration = Date.now() - start;

    // Sentry API returns 200 or 401 for unauthenticated requests — both indicate the service is reachable
    if (response.status === 200 || response.status === 401) {
      return {
        service,
        status: 'pass',
        duration,
        message: `Sentry host reachable at ${sentryHost} (HTTP ${response.status})`,
      };
    }

    return {
      service,
      status: 'fail',
      duration,
      message: `Unexpected response: HTTP ${response.status}`,
    };
  } catch (err) {
    const duration = Date.now() - start;
    const message =
      err instanceof Error ? err.message : 'Unknown error checking Sentry';
    return {
      service,
      status: 'fail',
      duration,
      message,
    };
  }
}
