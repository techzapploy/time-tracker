import type { ServiceCheckResult } from './types.js';
import { fetchWithTimeout, sanitizeError } from './types.js';

export async function checkGitHub(): Promise<ServiceCheckResult> {
  const timestamp = new Date().toISOString();
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return { service: 'GitHub', status: 'skip', message: 'GITHUB_TOKEN not configured', timestamp };
  }

  try {
    const response = await fetchWithTimeout('https://api.github.com/repos/techzapploy/time-tracker', {
      headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'time-tracker-integration-test' },
    });
    if (response.ok) {
      return { service: 'GitHub', status: 'pass', message: 'API accessible', timestamp };
    }
    return { service: 'GitHub', status: 'fail', message: `API returned ${response.status}`, timestamp };
  } catch (error) {
    return { service: 'GitHub', status: 'fail', message: sanitizeError(error), timestamp };
  }
}
