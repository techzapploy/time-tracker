import type { CheckResult } from './types.js';

export async function checkSentry(): Promise<CheckResult> {
  const start = Date.now();
  const service = 'sentry';
  const dsn = process.env['SENTRY_DSN'];

  if (!dsn) {
    return {
      service,
      status: 'skip',
      message: 'SENTRY_DSN not set',
      duration: Date.now() - start,
    };
  }

  try {
    const url = new URL(dsn);
    const host = url.host;
    const protocol = url.protocol.replace(':', '');
    const baseUrl = `${protocol === 'https' || protocol === 'http' ? protocol : 'https'}://${host}`;

    const response = await fetch(baseUrl, { method: 'HEAD' });
    return {
      service,
      status: 'pass',
      message: `Sentry host ${host} reachable (HTTP ${response.status})`,
      duration: Date.now() - start,
    };
  } catch (err) {
    return {
      service,
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      duration: Date.now() - start,
    };
  }
}
