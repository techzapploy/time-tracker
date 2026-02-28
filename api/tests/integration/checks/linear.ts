import type { CheckResult } from '../types.js';

export async function checkLinear(): Promise<CheckResult> {
  const service = 'Linear';
  const apiKey = process.env['LINEAR_API_KEY'];

  if (!apiKey) {
    return {
      service,
      passed: true,
      skipped: true,
      message: 'LINEAR_API_KEY is not set — skipping Linear check',
    };
  }

  try {
    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: apiKey,
      },
      body: JSON.stringify({ query: '{ viewer { id } }' }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const body = await response.text();
      return {
        service,
        passed: false,
        message: `Linear API returned status ${response.status}: ${body}`,
      };
    }

    const data = (await response.json()) as { errors?: unknown[] };

    if (data.errors && data.errors.length > 0) {
      return {
        service,
        passed: false,
        message: `Linear API returned GraphQL errors: ${JSON.stringify(data.errors)}`,
      };
    }

    return {
      service,
      passed: true,
      message: 'Linear API GraphQL query succeeded',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      service,
      passed: false,
      message: `Linear API request failed: ${message}`,
    };
  }
}
