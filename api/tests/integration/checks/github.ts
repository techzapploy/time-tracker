import type { CheckResult } from './types.js';

export async function checkGithub(): Promise<CheckResult> {
  const start = Date.now();
  const service = 'github';
  const token = process.env['GITHUB_TOKEN'];

  if (!token) {
    return {
      service,
      status: 'skip',
      message: 'GITHUB_TOKEN not set',
      duration: Date.now() - start,
    };
  }

  try {
    const response = await fetch('https://api.github.com/rate_limit', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      },
    });

    if (!response.ok) {
      return {
        service,
        status: 'fail',
        message: `GitHub API returned HTTP ${response.status}`,
        duration: Date.now() - start,
      };
    }

    return {
      service,
      status: 'pass',
      message: `GitHub API reachable (HTTP ${response.status})`,
      duration: Date.now() - start,
    };
  } catch (err) {
    return {
      service,
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      duration: Date.now() - start,
    };
  }
}
