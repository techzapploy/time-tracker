import type { CheckResult } from '../types';

export async function checkLinear(): Promise<CheckResult> {
  const start = Date.now();

  if (!process.env.LINEAR_API_KEY) {
    return {
      name: 'linear',
      status: 'skip',
      message: 'LINEAR_API_KEY is not set',
      durationMs: Date.now() - start,
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.LINEAR_API_KEY}`,
      },
      body: JSON.stringify({ query: '{ viewer { id } }' }),
      signal: controller.signal,
    });

    if (response.status !== 200) {
      return {
        name: 'linear',
        status: 'fail',
        message: `Unexpected status code: ${response.status}`,
        durationMs: Date.now() - start,
      };
    }

    const body = await response.json() as Record<string, unknown>;

    if (body.errors) {
      return {
        name: 'linear',
        status: 'fail',
        message: `GraphQL errors: ${JSON.stringify(body.errors)}`,
        durationMs: Date.now() - start,
      };
    }

    return {
      name: 'linear',
      status: 'pass',
      message: 'Linear API reachable and authenticated',
      durationMs: Date.now() - start,
    };
  } catch (err) {
    return {
      name: 'linear',
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
    };
  } finally {
    clearTimeout(timeout);
  }
}
