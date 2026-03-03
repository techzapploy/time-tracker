import type { CheckResult } from './types.js';

export async function checkLinear(): Promise<CheckResult> {
  const start = Date.now();
  const service = 'linear';
  const apiKey = process.env['LINEAR_API_KEY'];

  if (!apiKey) {
    return {
      service,
      status: 'skip',
      message: 'LINEAR_API_KEY not set',
      duration: Date.now() - start,
    };
  }

  try {
    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: '{ viewer { id } }' }),
    });

    if (!response.ok) {
      return {
        service,
        status: 'fail',
        message: `Linear API returned HTTP ${response.status}`,
        duration: Date.now() - start,
      };
    }

    const body = (await response.json()) as { errors?: unknown[] };
    if (body.errors && body.errors.length > 0) {
      return {
        service,
        status: 'fail',
        message: `Linear API returned GraphQL errors: ${JSON.stringify(body.errors)}`,
        duration: Date.now() - start,
      };
    }

    return {
      service,
      status: 'pass',
      message: `Linear API reachable and authenticated (HTTP ${response.status})`,
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
