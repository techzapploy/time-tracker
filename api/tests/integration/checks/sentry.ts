import type { CheckResult } from '../types.js';

const name = 'Sentry';

interface SentryDsnParts {
  publicKey: string;
  host: string;
  projectId: string;
}

function parseSentryDsn(dsn: string): SentryDsnParts | null {
  try {
    const url = new URL(dsn);
    const publicKey = url.username;
    const host = url.hostname;
    const projectId = url.pathname.replace(/^\//, '');

    if (!publicKey || !host || !projectId) {
      return null;
    }

    return { publicKey, host, projectId };
  } catch {
    return null;
  }
}

export default async function checkSentry(): Promise<CheckResult> {
  const start = Date.now();
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    return { name, status: 'skip', reason: 'SENTRY_DSN not set', duration_ms: Date.now() - start };
  }

  const parts = parseSentryDsn(dsn);

  if (!parts) {
    return {
      name,
      status: 'fail',
      reason: 'Invalid SENTRY_DSN format. Expected: https://<key>@<host>/<project-id>',
      duration_ms: Date.now() - start,
    };
  }

  return {
    name,
    status: 'pass',
    reason: `DSN format is valid. Host: ${parts.host}, Project: ${parts.projectId}`,
    duration_ms: Date.now() - start,
  };
}
