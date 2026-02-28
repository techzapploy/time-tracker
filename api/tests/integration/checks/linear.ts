import type { CheckResult } from './database.js';

export async function checkLinear(): Promise<CheckResult> {
  const start = Date.now();
  const key = process.env.LINEAR_API_KEY;

  if (!key) {
    return { name: 'Linear', status: 'skipped', message: 'LINEAR_API_KEY not set', durationMs: Date.now() - start };
  }

  try {
    const res = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: { Authorization: key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '{ viewer { id } }' }),
      signal: AbortSignal.timeout(10000),
    });
    if (res.status === 200) {
      const body = await res.json() as { data?: { viewer?: { id?: string } } };
      if (body?.data?.viewer?.id) {
        return { name: 'Linear', status: 'pass', message: `Authenticated as viewer ${body.data.viewer.id}`, durationMs: Date.now() - start };
      }
      return { name: 'Linear', status: 'fail', message: 'HTTP 200 but viewer.id missing', durationMs: Date.now() - start };
    }
    return { name: 'Linear', status: 'fail', message: `HTTP ${res.status}`, durationMs: Date.now() - start };
  } catch (err) {
    return { name: 'Linear', status: 'fail', message: err instanceof Error ? err.message : String(err), durationMs: Date.now() - start };
  }
}
