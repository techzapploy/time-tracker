import type { CheckResult } from '../types.js';

export async function checkLinear(): Promise<CheckResult> {
  const start = Date.now();
  const service = 'Linear';

  const apiKey = process.env['LINEAR_API_KEY'];

  if (!apiKey) {
    return {
      service,
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
    });

    const json = (await response.json()) as { data?: { viewer?: { id?: string } }; errors?: unknown[] };

    if (json.data?.viewer) {
      return {
        service,
        status: 'pass',
        message: `Authenticated as viewer id: ${json.data.viewer.id}`,
        durationMs: Date.now() - start,
      };
    }

    return {
      service,
      status: 'fail',
      message: `Unexpected response: ${JSON.stringify(json).slice(0, 200)}`,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      service,
      status: 'fail',
      message: `Request failed: ${message}`,
      durationMs: Date.now() - start,
    };
  }
}
