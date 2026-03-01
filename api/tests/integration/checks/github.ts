import { type ServiceCheckResult, sanitizeError, fetchWithTimeout } from './types.js';

export async function checkGitHub(): Promise<ServiceCheckResult> {
  const timestamp = new Date().toISOString();
  const service = 'github';

  const githubToken = process.env['GITHUB_TOKEN'];

  if (!githubToken) {
    return {
      service,
      status: 'skip',
      message: 'Skipped: GITHUB_TOKEN is unset',
      timestamp,
    };
  }

  try {
    const response = await fetchWithTimeout('https://api.github.com/user', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${githubToken}`,
        'User-Agent': 'integration-test-runner/1.0',
        Accept: 'application/vnd.github+json',
      },
    });

    if (response.ok) {
      return {
        service,
        status: 'pass',
        message: `GitHub API accessible (HTTP ${response.status})`,
        timestamp,
      };
    }

    return {
      service,
      status: 'fail',
      message: `GitHub API returned HTTP ${response.status}`,
      timestamp,
    };
  } catch (error) {
    return {
      service,
      status: 'fail',
      message: `GitHub API check failed: ${sanitizeError(error)}`,
      timestamp,
    };
  }
}
