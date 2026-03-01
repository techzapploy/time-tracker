import { ServiceCheckResult, sanitizeError, fetchWithTimeout } from './types.js';

export async function checkLinear(): Promise<ServiceCheckResult> {
  const timestamp = new Date().toISOString();
  const apiKey = process.env.LINEAR_API_KEY;

  if (!apiKey) {
    return { service: 'Linear', status: 'skip', message: 'LINEAR_API_KEY not set', timestamp };
  }

  try {
    const res = await fetchWithTimeout('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: apiKey,
      },
      body: JSON.stringify({ query: '{ viewer { id } }' }),
    });

    if (!res.ok) {
      return { service: 'Linear', status: 'fail', message: `Linear API returned HTTP ${res.status}`, timestamp };
    }

    const data = await res.json() as { data?: { viewer?: { id?: string } } };
    if (data?.data?.viewer?.id) {
      return { service: 'Linear', status: 'pass', message: 'Authentication successful', timestamp };
    }
    return { service: 'Linear', status: 'fail', message: 'viewer.id missing in response', timestamp };
  } catch (error) {
    return { service: 'Linear', status: 'fail', message: sanitizeError(error), timestamp };
  }
}
