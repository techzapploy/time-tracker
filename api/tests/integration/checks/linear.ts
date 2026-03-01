import type { CheckResult } from '../types.js';

export async function checkLinear(): Promise<CheckResult> {
  const timestamp = new Date().toISOString();
  const apiKey = process.env.LINEAR_API_KEY;

  if (!apiKey) {
    return { service: 'Linear', status: 'skip', message: 'LINEAR_API_KEY not set', timestamp };
  }

  try {
    const res = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '{ viewer { id } }' }),
    });
    if (!res.ok) {
      return { service: 'Linear', status: 'fail', message: `HTTP ${res.status} from Linear API`, timestamp };
    }
    const data = await res.json() as { errors?: unknown[] };
    if (data.errors && data.errors.length > 0) {
      return { service: 'Linear', status: 'fail', message: 'GraphQL errors returned', timestamp };
    }
    return { service: 'Linear', status: 'pass', message: 'GraphQL query successful', timestamp };
  } catch (err) {
    return { service: 'Linear', status: 'fail', message: err instanceof Error ? err.message : String(err), timestamp };
  }
}
