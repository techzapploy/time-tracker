import type { CheckResult } from './database.js';

export async function checkLinear(): Promise<CheckResult> {
  const start = Date.now();
  const name = 'Linear';

  const apiKey = process.env['LINEAR_API_KEY'];
  if (!apiKey) {
    return { name, status: 'skipped', message: 'LINEAR_API_KEY is not set', durationMs: Date.now() - start };
  }

  try {
    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: '{ viewer { id } }' }),
      signal: AbortSignal.timeout(10000),
    });
    if (response.status !== 200) {
      return { name, status: 'fail', message: `HTTP ${response.status}`, durationMs: Date.now() - start };
    }
    const body = (await response.json()) as { data?: { viewer?: { id?: string } } };
    if (!body.data?.viewer?.id) {
      return { name, status: 'fail', message: 'Response missing data.viewer.id', durationMs: Date.now() - start };
    }
    return { name, status: 'pass', message: `HTTP ${response.status}, viewer.id present`, durationMs: Date.now() - start };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { name, status: 'fail', message: `Request failed: ${message}`, durationMs: Date.now() - start };
  }
}
