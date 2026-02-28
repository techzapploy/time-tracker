import type { CheckResult } from '../types.js';

export async function checkLinear(): Promise<CheckResult> {
  const start = Date.now();
  const service = 'linear';

  const apiKey = process.env['LINEAR_API_KEY'];
  if (!apiKey) {
    return {
      service,
      status: 'skipped',
      message: 'LINEAR_API_KEY not set',
      duration_ms: Date.now() - start,
    };
  }

  try {
    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey,
      },
      body: JSON.stringify({ query: '{ viewer { id } }' }),
      signal: AbortSignal.timeout(10000),
    });

    const json = await response.json() as { data?: { viewer?: { id?: string } } };

    if (json?.data?.viewer?.id) {
      return {
        service,
        status: 'pass',
        message: `Authenticated as viewer id: ${json.data.viewer.id}`,
        duration_ms: Date.now() - start,
      };
    } else {
      return {
        service,
        status: 'fail',
        message: 'viewer.id not found in response',
        duration_ms: Date.now() - start,
      };
    }
  } catch (err) {
    return {
      service,
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      duration_ms: Date.now() - start,
    };
  }
}
