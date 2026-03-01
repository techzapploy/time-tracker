import { ServiceCheckResult, sanitizeError, fetchWithTimeout } from './types.js';

export async function checkGitHub(): Promise<ServiceCheckResult> {
  const timestamp = new Date().toISOString();
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return { service: 'GitHub', status: 'skip', message: 'GITHUB_TOKEN not set', timestamp };
  }

  try {
    const res = await fetchWithTimeout('https://api.github.com/repos/techzapploy/time-tracker', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'time-tracker-integration-test',
      },
    });
    if (res.ok) {
      return { service: 'GitHub', status: 'pass', message: 'Repository accessible', timestamp };
    }
    return { service: 'GitHub', status: 'fail', message: `GitHub API returned HTTP ${res.status}`, timestamp };
  } catch (error) {
    return { service: 'GitHub', status: 'fail', message: sanitizeError(error), timestamp };
  }
}
