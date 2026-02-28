export interface CheckResult {
  service: string;
  passed: boolean;
  error?: string;
}

const SENTRY_DSN_REGEX = /^https:\/\/[^@]+@([^/]+)\/sentry\/\d+$/;

export async function checkSentry(): Promise<CheckResult> {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    return { service: 'sentry', passed: false, error: 'SENTRY_DSN env var not set' };
  }

  const match = dsn.match(SENTRY_DSN_REGEX);
  if (!match) {
    return { service: 'sentry', passed: false, error: 'SENTRY_DSN format invalid (expected https://<key>@<host>/sentry/<project-id>)' };
  }

  const host = match[1];
  try {
    const response = await fetch(`https://${host}/`, {
      signal: AbortSignal.timeout(10000),
    });

    if (response.status < 500) {
      return { service: 'sentry', passed: true };
    }
    return { service: 'sentry', passed: false, error: `Sentry host responded with HTTP ${response.status}` };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { service: 'sentry', passed: false, error: message };
  }
}
