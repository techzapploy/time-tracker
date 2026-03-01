import type { CheckResult } from '../types.js';

export async function checkGithub(): Promise<CheckResult> {
  const service = 'GitHub';
  const start = Date.now();

  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return {
      service,
      status: 'skip',
      duration: Date.now() - start,
      message: 'GITHUB_TOKEN not set',
    };
  }

  try {
    const response = await fetch('https://api.github.com/user', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'clockify-integration-check/1.0',
      },
      signal: AbortSignal.timeout(10000),
    });

    const duration = Date.now() - start;

    if (response.status === 200) {
      const data = (await response.json()) as { login?: string };
      const login = data.login ?? 'unknown';
      return {
        service,
        status: 'pass',
        duration,
        message: `Authenticated as ${login}`,
      };
    }

    return {
      service,
      status: 'fail',
      duration,
      message: `Unexpected response: HTTP ${response.status}`,
    };
  } catch (err) {
    const duration = Date.now() - start;
    const message =
      err instanceof Error ? err.message : 'Unknown error checking GitHub API';
    return {
      service,
      status: 'fail',
      duration,
      message,
    };
  }
}
