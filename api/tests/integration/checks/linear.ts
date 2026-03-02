import type { CheckResult } from '../runner.js';

export default async function check(): Promise<CheckResult> {
  const key = process.env.LINEAR_API_KEY;
  if (!key) return { service: 'Linear', status: 'skipped', message: 'LINEAR_API_KEY not set' };
  try {
    const res = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: { Authorization: key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '{ viewer { id name } }' }),
    });
    if (res.status === 200) {
      const body = await res.json() as { data?: { viewer?: { name: string } }; errors?: unknown[] };
      if (body.errors) {
        return { service: 'Linear', status: 'failed', message: JSON.stringify(body.errors) };
      }
      if (body.data?.viewer) {
        return { service: 'Linear', status: 'passed', message: `Authenticated as ${body.data.viewer.name}` };
      }
      return { service: 'Linear', status: 'failed', message: 'Unexpected response shape' };
    }
    return { service: 'Linear', status: 'failed', message: `HTTP ${res.status}` };
  } catch (err) {
    return { service: 'Linear', status: 'failed', message: (err as Error).message };
  }
}
