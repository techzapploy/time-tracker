import { sanitize } from '../utils/sanitize.ts';
import type { ServiceResult } from '../utils/report.ts';

export async function checkSentry(): Promise<ServiceResult> {
  const authToken = process.env.SENTRY_AUTH_TOKEN;
  const org = process.env.SENTRY_ORG;
  if (!authToken || !org) {
    return { name: 'Sentry', status: 'SKIPPED', details: 'SENTRY_AUTH_TOKEN or SENTRY_ORG not set' };
  }

  const start = Date.now();
  try {
    const res = await fetch(`https://sentry.io/api/0/organizations/${org}/`, {
      headers: { Authorization: `Bearer ${authToken}` },
      signal: AbortSignal.timeout(10000),
    });
    return {
      name: 'Sentry',
      status: res.ok ? 'UP' : 'DOWN',
      latency: Date.now() - start,
      details: `HTTP ${res.status}`,
    };
  } catch (err) {
    return { name: 'Sentry', status: 'DOWN', error: sanitize(String(err)) };
  }
}
