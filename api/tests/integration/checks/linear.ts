import type { CheckResult } from '../types.js';

export async function checkLinear(): Promise<CheckResult> {
  const service = 'Linear';
  const start = Date.now();
  const apiKey = process.env['LINEAR_API_KEY'];
  if (!apiKey) {
    return { service, status: 'fail', message: 'Environment variable LINEAR_API_KEY is not set', durationMs: Date.now() - start };
  }
  try {
    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: apiKey },
      body: JSON.stringify({ query: '{ viewer { id } }' }),
      signal: AbortSignal.timeout(10000),
    });
    const data = await response.json() as { data?: { viewer?: { id: string } } };
    if (data?.data?.viewer) {
      return { service, status: 'pass', message: 'GraphQL viewer query succeeded', durationMs: Date.now() - start };
    }
    return { service, status: 'fail', message: 'Response missing data.viewer', durationMs: Date.now() - start };
  } catch (err) {
    return { service, status: 'fail', message: err instanceof Error ? err.message : String(err), durationMs: Date.now() - start };
  }
}
