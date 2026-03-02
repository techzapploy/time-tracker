interface CheckResult {
  name: string;
  status: 'ok' | 'failed' | 'skipped';
  message: string;
  durationMs?: number;
}

export async function checkSentry(): Promise<CheckResult> {
  const name = 'Sentry';
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    return { name, status: 'skipped', message: 'SENTRY_DSN not set' };
  }

  let host: string;
  try {
    const url = new URL(dsn);
    host = url.host;
  } catch {
    return { name, status: 'failed', message: 'Invalid SENTRY_DSN URL' };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(`https://${host}/api/0/`, {
      signal: controller.signal,
    });

    // 200 = OK, 401 = reachable but auth required (both acceptable)
    if (res.status !== 200 && res.status !== 401) {
      return { name, status: 'failed', message: `HTTP ${res.status}` };
    }

    return { name, status: 'ok', message: 'Connected successfully' };
  } catch (err) {
    return { name, status: 'failed', message: String(err) };
  } finally {
    clearTimeout(timeout);
  }
}
