import type { CheckResult } from '../types.js';

export async function checkGitHub(): Promise<CheckResult> {
  const start = Date.now();
  const service = 'GitHub';

  const token = process.env['GITHUB_TOKEN'];

  if (!token) {
    return {
      service,
      status: 'skip',
      message: 'GITHUB_TOKEN is not set',
      durationMs: Date.now() - start,
    };
  }

  try {
    const response = await fetch('https://api.github.com/user', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'integration-test',
      },
    });

    if (response.ok) {
      return {
        service,
        status: 'pass',
        message: `API reachable (HTTP ${response.status})`,
        durationMs: Date.now() - start,
      };
    }

    return {
      service,
      status: 'fail',
      message: `API returned HTTP ${response.status}`,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      service,
      status: 'fail',
      message: `Request failed: ${message}`,
      durationMs: Date.now() - start,
    };
  }
}
