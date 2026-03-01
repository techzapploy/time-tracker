import type { ServiceCheckResult } from './types.js';
import { fetchWithTimeout, sanitizeError } from './types.js';

export async function checkLinear(): Promise<ServiceCheckResult> {
  const timestamp = new Date().toISOString();
  const apiKey = process.env.LINEAR_API_KEY;

  if (!apiKey) {
    return { service: 'Linear', status: 'skip', message: 'LINEAR_API_KEY not configured', timestamp };
  }

  try {
    const response = await fetchWithTimeout('https://api.linear.app/graphql', {
      method: 'POST',
      headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '{ viewer { id } }' }),
    });
    if (response.ok) {
      return { service: 'Linear', status: 'pass', message: 'API accessible', timestamp };
    }
    return { service: 'Linear', status: 'fail', message: `API returned ${response.status}`, timestamp };
  } catch (error) {
    return { service: 'Linear', status: 'fail', message: sanitizeError(error), timestamp };
  }
}
