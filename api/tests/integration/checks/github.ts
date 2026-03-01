import type { CheckResult } from './database.js';

export async function checkGitHub(): Promise<CheckResult> {
  const name = 'GitHub';
  const start = Date.now();

  const token = process.env['GITHUB_TOKEN'];
  if (!token) {
    return {
      name,
      status: 'skipped',
      message: 'GITHUB_TOKEN env var is not set',
      durationMs: Date.now() - start,
    };
  }

  try {
    const response = await fetch('https://api.github.com/user', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'clockify-clone-integration-tests/1.0',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (response.status === 200) {
      return {
        name,
        status: 'pass',
        message: 'GitHub API reachable and token valid',
        durationMs: Date.now() - start,
      };
    }

    return {
      name,
      status: 'fail',
      message: `Unexpected HTTP status: ${response.status}`,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    return {
      name,
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
    };
  }
}
