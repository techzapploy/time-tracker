import type { CheckResult } from '../types.js';

const SENTRY_DSN_PATTERN = /^https:\/\/.+@.+\.ingest\.sentry\.io\/.+$/;

export async function checkSentry(): Promise<CheckResult> {
  const service = 'Sentry';
  const sentryDsn = process.env['SENTRY_DSN'];

  if (!sentryDsn) {
    return {
      service,
      passed: true,
      skipped: true,
      message: 'SENTRY_DSN is not set — skipping Sentry check',
    };
  }

  if (SENTRY_DSN_PATTERN.test(sentryDsn)) {
    return {
      service,
      passed: true,
      message: 'Sentry DSN format is valid',
    };
  } else {
    return {
      service,
      passed: false,
      message: `Sentry DSN format is invalid. Expected format: https://<key>@<org>.ingest.sentry.io/<project-id>`,
    };
  }
}
