import type { CheckResult } from '../types.js';

export async function checkLinear(): Promise<CheckResult> {
  const apiKey = process.env['LINEAR_API_KEY'];
  if (!apiKey) {
    return { service: 'linear', status: 'skipped', durationMs: 0 };
  }

  const start = Date.now();
  try {
    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: apiKey,
      },
      body: JSON.stringify({ query: '{ viewer { id } }' }),
      signal: AbortSignal.timeout(4000),
    });
    const data = await response.json() as { data?: { viewer?: { id: string } } };
    if (data.data?.viewer) {
      return { service: 'linear', status: 'ok', durationMs: Date.now() - start };
    }
    return {
      service: 'linear',
      status: 'failed',
      message: 'Unexpected response structure',
      durationMs: Date.now() - start,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { service: 'linear', status: 'failed', message, durationMs: Date.now() - start };
  }
}
