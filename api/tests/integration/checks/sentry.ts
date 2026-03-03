interface CheckResult {
  service: string;
  status: 'pass' | 'fail' | 'skip';
  message: string;
  durationMs?: number;
}

export default async function checkSentry(): Promise<CheckResult> {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    return {
      service: 'sentry',
      status: 'skip',
      message: 'SENTRY_DSN is not set',
    };
  }

  const start = Date.now();
  try {
    // Parse the DSN to extract the Sentry host and construct the API URL
    const dsnUrl = new URL(dsn);
    const sentryHost = dsnUrl.hostname;
    const apiUrl = `https://${sentryHost}/api/0/`;

    const response = await fetch(apiUrl, {
      headers: {
        Accept: 'application/json',
      },
    });

    // Sentry returns 401 for unauthenticated requests to the API, which still confirms reachability
    if (response.ok || response.status === 401 || response.status === 403) {
      return {
        service: 'sentry',
        status: 'pass',
        message: `Sentry API reachable at ${sentryHost} (HTTP ${response.status})`,
        durationMs: Date.now() - start,
      };
    }

    return {
      service: 'sentry',
      status: 'fail',
      message: `Sentry API returned HTTP ${response.status}`,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    return {
      service: 'sentry',
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
    };
  }
}
