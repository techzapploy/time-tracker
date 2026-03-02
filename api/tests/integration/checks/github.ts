import type { CheckResult } from '../types.js';

export async function checkGithub(): Promise<CheckResult> {
  const start = Date.now();
  const token = process.env['GITHUB_TOKEN'];
  if (!token) {
    return {
      name: 'github',
      status: 'skip',
      reason: 'GITHUB_TOKEN not set',
      duration_ms: Date.now() - start,
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
    if (response.status === 200) {
      const data = (await response.json()) as { login?: string };
      return {
        name: 'github',
        status: 'pass',
        reason: data.login,
        duration_ms: Date.now() - start,
      };
    }
    return {
      name: 'github',
      status: 'fail',
      reason: `HTTP ${response.status}`,
      duration_ms: Date.now() - start,
    };
  } catch (err) {
    return {
      name: 'github',
      status: 'fail',
      reason: err instanceof Error ? err.message : String(err),
      duration_ms: Date.now() - start,
    };
  }
}
