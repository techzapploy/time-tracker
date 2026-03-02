/**
 * Linear Integration Check
 *
 * Verifies the Linear API key is valid by calling the Linear GraphQL API.
 * Skips gracefully if LINEAR_API_KEY is not set.
 */

import type { CheckResult } from '../runner.js';

export async function checkLinear(): Promise<CheckResult> {
  const name = 'Linear';

  const apiKey = process.env.LINEAR_API_KEY || process.env.LINEAR_TOKEN;

  if (!apiKey) {
    return {
      name,
      status: 'skipped',
      message: 'LINEAR_API_KEY not set - skipping Linear check',
      durationMs: 0,
    };
  }

  try {
    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `{ viewer { id name email } }`,
      }),
      signal: AbortSignal.timeout(4000),
    });

    if (response.ok) {
      const data = (await response.json()) as {
        data?: { viewer?: { name: string; email: string } };
        errors?: Array<{ message: string }>;
      };

      if (data.errors && data.errors.length > 0) {
        return {
          name,
          status: 'failed',
          message: 'Linear API returned GraphQL errors',
          durationMs: 0,
          error: data.errors.map((e) => e.message).join('; '),
        };
      }

      const viewer = data.data?.viewer;
      return {
        name,
        status: 'passed',
        message: `Connected as "${viewer?.name}" (${viewer?.email})`,
        durationMs: 0,
      };
    } else {
      const errorText = await response.text();
      return {
        name,
        status: 'failed',
        message: `Linear API returned ${response.status}`,
        durationMs: 0,
        error: errorText,
      };
    }
  } catch (err) {
    return {
      name,
      status: 'failed',
      message: 'Failed to reach Linear API',
      durationMs: 0,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
