import type { CheckResult } from '../types.js';

export async function checkLinear(): Promise<CheckResult> {
  const start = Date.now();
  const apiKey = process.env.LINEAR_API_KEY;

  if (!apiKey) {
    return {
      service: 'linear',
      status: 'skipped',
      message: 'LINEAR_API_KEY not set',
      duration_ms: Date.now() - start,
    };
  }

  try {
    const res = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: '{ viewer { id } }' }),
    });
    const json = (await res.json()) as { data?: { viewer?: { id?: string } } };
    if (json?.data?.viewer?.id) {
      return {
        service: 'linear',
        status: 'pass',
        message: `viewer.id present: ${json.data.viewer.id}`,
        duration_ms: Date.now() - start,
      };
    }
    return {
      service: 'linear',
      status: 'fail',
      message: `viewer.id missing in response: ${JSON.stringify(json)}`,
      duration_ms: Date.now() - start,
    };
  } catch (err) {
    return {
      service: 'linear',
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      duration_ms: Date.now() - start,
    };
  }
}
