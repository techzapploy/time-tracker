import type { CheckResult } from '../types.js';

export async function checkGitHub(): Promise<CheckResult> {
  const name = 'GitHub';
  const start = Date.now();

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return { name, status: 'skipped', message: 'GITHUB_TOKEN not set', durationMs: 0 };
  }

  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        Accept: 'application/vnd.github+json',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return {
        name,
        status: 'fail',
        message: `HTTP ${response.status}: ${response.statusText}`,
        durationMs: Date.now() - start,
      };
    }

    const data = await response.json() as { login?: string; id?: number };
    return {
      name,
      status: 'pass',
      message: `Authenticated as ${data.login ?? 'unknown'} (id: ${data.id ?? 'unknown'})`,
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
