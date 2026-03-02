import type { CheckResult } from '../runner.js';

export default async function check(): Promise<CheckResult> {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return { service: 'Sentry', status: 'skipped', message: 'SENTRY_DSN not set' };
  // Parse DSN: https://<key>@<host>/<project_id>
  const match = dsn.match(/^https:\/\/[^@]+@([^/]+)\//);
  if (!match) return { service: 'Sentry', status: 'failed', message: 'Invalid SENTRY_DSN format' };
  const host = match[1];
  try {
    const res = await fetch(`https://${host}/api/0/`, {
      headers: { Authorization: `DSN ${dsn}` },
    });
    if (res.status === 200 || res.status === 401) {
      return { service: 'Sentry', status: 'passed', message: 'Sentry API reachable' };
    }
    return { service: 'Sentry', status: 'failed', message: `HTTP ${res.status}` };
  } catch (err) {
    return { service: 'Sentry', status: 'failed', message: (err as Error).message };
  }
}
