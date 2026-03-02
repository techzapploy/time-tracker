/**
 * Sentry Integration Check
 *
 * Verifies the Sentry auth token is valid by calling the Sentry REST API.
 * Skips gracefully if SENTRY_AUTH_TOKEN (or SENTRY_TOKEN) is not set.
 */

import type { CheckResult } from '../runner.js';

export async function checkSentry(): Promise<CheckResult> {
  const name = 'Sentry';

  const authToken =
    process.env.SENTRY_AUTH_TOKEN ||
    process.env.SENTRY_TOKEN;

  if (!authToken) {
    return {
      name,
      status: 'skipped',
      message: 'SENTRY_AUTH_TOKEN not set - skipping Sentry check',
      durationMs: 0,
    };
  }

  try {
    const response = await fetch('https://sentry.io/api/0/auth/', {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(4000),
    });

    if (response.ok) {
      const data = (await response.json()) as {
        user?: { name?: string; email?: string };
        isSuperuser?: boolean;
      };
      return {
        name,
        status: 'passed',
        message: `Authenticated as "${data.user?.name || data.user?.email || 'unknown'}"`,
        durationMs: 0,
      };
    } else {
      const errorText = await response.text();
      return {
        name,
        status: 'failed',
        message: `Sentry API returned ${response.status}`,
        durationMs: 0,
        error: errorText,
      };
    }
  } catch (err) {
    return {
      name,
      status: 'failed',
      message: 'Failed to reach Sentry API',
      durationMs: 0,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
