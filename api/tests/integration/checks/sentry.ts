export interface CheckResult {
  name: string;
  status: 'ok' | 'failed' | 'skipped';
  message: string;
  durationMs: number;
}

export async function check(): Promise<CheckResult> {
  const name = 'Sentry';
  const dsn = process.env['SENTRY_DSN'];

  if (!dsn || dsn.trim() === '') {
    return { name, status: 'skipped', message: 'SENTRY_DSN not set', durationMs: 0 };
  }

  let parsedDsn: URL;
  try {
    parsedDsn = new URL(dsn);
  } catch {
    return { name, status: 'failed', message: 'SENTRY_DSN is not a valid URL', durationMs: 0 };
  }

  if (parsedDsn.protocol !== 'https:') {
    return { name, status: 'failed', message: 'SENTRY_DSN must use https scheme', durationMs: 0 };
  }

  const publicKey = parsedDsn.username;

  const start = Date.now();

  try {
    const response = await fetch('https://sentry.io/api/0/projects/', {
      headers: {
        Authorization: `DSN ${dsn}`,
        'X-Sentry-Auth': `Sentry sentry_version=7, sentry_key=${publicKey}`,
      },
    });

    if (response.ok) {
      return { name, status: 'ok', message: 'Connection successful', durationMs: Date.now() - start };
    }

    return {
      name,
      status: 'failed',
      message: `HTTP ${response.status}: ${response.statusText}`,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { name, status: 'failed', message, durationMs: Date.now() - start };
  }
}
