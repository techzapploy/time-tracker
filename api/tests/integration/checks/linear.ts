import type { CheckResult } from '../types.js';

export async function check(): Promise<CheckResult> {
  const timestamp = new Date().toISOString();
  const service = 'Linear';

  const apiKey = process.env.LINEAR_API_KEY;
  if (!apiKey) {
    return { service, status: 'skip', message: 'LINEAR_API_KEY not set', timestamp };
  }

  try {
    const res = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: apiKey,
      },
      body: JSON.stringify({ query: '{ __typename }' }),
    });

    if (res.status === 200) {
      return { service, status: 'pass', message: 'HTTP 200', timestamp };
    }
    return { service, status: 'fail', message: `Unexpected HTTP ${res.status}`, timestamp };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error';
    return { service, status: 'fail', message, timestamp };
  }
}
