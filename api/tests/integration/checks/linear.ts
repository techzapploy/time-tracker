import type { CheckResult } from '../types.js';

export async function checkLinear(): Promise<CheckResult> {
  const start = Date.now();
  const apiKey = process.env['LINEAR_API_KEY'];
  if (!apiKey) {
    return {
      name: 'linear',
      status: 'skip',
      reason: 'LINEAR_API_KEY not set',
      duration_ms: Date.now() - start,
    };
  }
  try {
    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: apiKey,
      },
      body: JSON.stringify({ query: '{ viewer { id name email } }' }),
    });
    const data = (await response.json()) as {
      data?: { viewer?: { name?: string } };
      errors?: unknown[];
    };
    if (data.errors && data.errors.length > 0) {
      return {
        name: 'linear',
        status: 'fail',
        reason: JSON.stringify(data.errors),
        duration_ms: Date.now() - start,
      };
    }
    return {
      name: 'linear',
      status: 'pass',
      reason: data.data?.viewer?.name,
      duration_ms: Date.now() - start,
    };
  } catch (err) {
    return {
      name: 'linear',
      status: 'fail',
      reason: err instanceof Error ? err.message : String(err),
      duration_ms: Date.now() - start,
    };
  }
}
