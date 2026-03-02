export interface CheckResult {
  name: string;
  status: 'ok' | 'failed' | 'skipped';
  message: string;
  durationMs?: number;
}

export async function checkSentry(): Promise<CheckResult> {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    return {
      name: 'Sentry',
      status: 'skipped',
      message: 'SENTRY_DSN not set, skipping',
    };
  }

  const start = Date.now();

  try {
    // Parse the DSN to extract the host and project info
    const url = new URL(dsn);
    const sentryHost = url.hostname;

    const response = await fetch(`https://${sentryHost}/api/0/`, {
      signal: AbortSignal.timeout(10000),
    });

    const durationMs = Date.now() - start;

    // Sentry API root returns 200 or 401 (auth required) — both mean reachable
    if (response.ok || response.status === 401) {
      return {
        name: 'Sentry',
        status: 'ok',
        message: `Sentry API reachable at ${sentryHost} (HTTP ${response.status})`,
        durationMs,
      };
    } else {
      return {
        name: 'Sentry',
        status: 'failed',
        message: `Sentry API returned HTTP ${response.status}`,
        durationMs,
      };
    }
  } catch (err) {
    const durationMs = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    return {
      name: 'Sentry',
      status: 'failed',
      message: `Request failed: ${message}`,
      durationMs,
    };
  }
}
