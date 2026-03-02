import type { CheckResult } from '../types.js';

export async function checkLinear(): Promise<CheckResult> {
  const start = Date.now();
  const apiKey = process.env.LINEAR_API_KEY;

  if (!apiKey) {
    return {
      name: 'linear',
      status: 'skip',
      message: 'LINEAR_API_KEY not set',
      durationMs: Date.now() - start,
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
        name: 'linear',
        status: 'fail',
        message: `HTTP ${response.status}: ${response.statusText}`,
        durationMs: Date.now() - start,
      };
    }

    const data = (await response.json()) as { errors?: unknown[] };

    if (data.errors && data.errors.length > 0) {
      return {
        name: 'linear',
        status: 'fail',
        message: 'GraphQL errors returned from Linear API',
        durationMs: Date.now() - start,
      };
    }

    return {
      name: 'linear',
      status: 'pass',
      message: 'Linear API reachable and token valid',
      durationMs: Date.now() - start,
    };
  } catch (err) {
    return {
      name: 'linear',
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
    };
  }
}
