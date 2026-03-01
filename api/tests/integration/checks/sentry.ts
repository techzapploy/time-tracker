import type { CheckResult } from '../types';

export async function checkSentry(): Promise<CheckResult> {
  const start = Date.now();

  if (!process.env.SENTRY_DSN) {
    return {
      name: 'sentry',
      status: 'skip',
      message: 'SENTRY_DSN is not set',
      durationMs: Date.now() - start,
    };
  }

  let host: string;

  try {
    const url = new URL(process.env.SENTRY_DSN);
    host = url.host;
  } catch (err) {
    return {
      name: 'sentry',
      status: 'fail',
      message: `Invalid SENTRY_DSN URL: ${err instanceof Error ? err.message : String(err)}`,
      durationMs: Date.now() - start,
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`https://${host}/api/0/`, {
      method: 'GET',
      signal: controller.signal,
    });

    if (response.status === 200 || response.status === 401) {
      return {
        name: 'sentry',
        status: 'pass',
        message: `Sentry server reachable (HTTP ${response.status})`,
        durationMs: Date.now() - start,
      };
    }

    return {
      name: 'sentry',
      status: 'fail',
      message: `Unexpected status code: ${response.status}`,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    return {
      name: 'sentry',
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
    };
  } finally {
    clearTimeout(timeout);
  }
}
