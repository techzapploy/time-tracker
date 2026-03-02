import type { CheckResult } from '../types.js';

export async function checkGitHub(): Promise<CheckResult> {
  const start = Date.now();
  const name = 'github';

  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return {
      name,
      status: 'skip',
      message: 'GITHUB_TOKEN is not set',
      durationMs: Date.now() - start,
    };
  }

  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      signal: AbortSignal.timeout(4000),
    });

    if (response.ok) {
      return {
        name,
        status: 'ok',
        message: `GitHub API reachable (HTTP ${response.status})`,
        durationMs: Date.now() - start,
      };
    }

    return {
      name,
      status: 'fail',
      message: `GitHub API returned HTTP ${response.status}`,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      name,
      status: 'fail',
      message: `GitHub API check failed: ${message}`,
      durationMs: Date.now() - start,
    };
  }
}
