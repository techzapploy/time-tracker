import type { CheckResult } from '../types.js';

export async function checkGithub(): Promise<CheckResult> {
  const start = Date.now();
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return {
      name: 'github',
      status: 'skip',
      message: 'GITHUB_TOKEN not set',
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
    });

    if (!response.ok) {
      return {
        name: 'github',
        status: 'fail',
        message: `HTTP ${response.status}: ${response.statusText}`,
        durationMs: Date.now() - start,
      };
    }

    return {
      name: 'github',
      status: 'pass',
      message: 'GitHub API reachable and token valid',
      durationMs: Date.now() - start,
    };
  } catch (err) {
    return {
      name: 'github',
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
    };
  }
}
