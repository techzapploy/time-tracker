import type { CheckResult } from '../types.js';

export default async function checkSentry(): Promise<CheckResult> {
  const service = 'sentry';
  const start = Date.now();

  const sentryDsn = process.env.SENTRY_DSN;
  if (!sentryDsn) {
    return {
      service,
      status: 'skipped',
      message: 'SENTRY_DSN env var not set',
      duration_ms: Date.now() - start,
    };
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(sentryDsn);
  } catch {
    return {
      service,
      status: 'fail',
      message: 'SENTRY_DSN is not a valid URL',
      duration_ms: Date.now() - start,
    };
  }

  const hostname = parsedUrl.hostname;
  if (!hostname.includes('sentry.io')) {
    return {
      service,
      status: 'skipped',
      message: `DSN hostname "${hostname}" does not contain sentry.io`,
      duration_ms: Date.now() - start,
    };
  }

  try {
    const response = await fetch(`https://${hostname}/api/`);

    if (response.status >= 500) {
      return {
        service,
        status: 'fail',
        message: `Sentry API returned HTTP ${response.status} (server error)`,
        duration_ms: Date.now() - start,
      };
    }

    return {
      service,
      status: 'pass',
      message: `Sentry API reachable (HTTP ${response.status})`,
      duration_ms: Date.now() - start,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      service,
      status: 'fail',
      message,
      duration_ms: Date.now() - start,
    };
  }
}
