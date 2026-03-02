import type { CheckResult } from '../types.js';

export async function checkLinear(): Promise<CheckResult> {
  const start = Date.now();
  const name = 'linear';

  const apiKey = process.env.LINEAR_API_KEY;

  if (!apiKey) {
    return {
      name,
      status: 'skip',
      message: 'LINEAR_API_KEY is not set',
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
      signal: AbortSignal.timeout(4000),
    });

    if (response.ok) {
      return {
        name,
        status: 'ok',
        message: `Linear API reachable (HTTP ${response.status})`,
        durationMs: Date.now() - start,
      };
    }

    return {
      name,
      status: 'fail',
      message: `Linear API returned HTTP ${response.status}`,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      name,
      status: 'fail',
      message: `Linear API check failed: ${message}`,
      durationMs: Date.now() - start,
    };
  }
}
