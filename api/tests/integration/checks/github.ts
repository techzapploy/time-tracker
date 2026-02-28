import type { CheckResult } from '../types.js';

export async function checkGitHub(): Promise<CheckResult> {
  const start = Date.now();
  const token = process.env.GITHUB_TOKEN ?? process.env.INTEGRATION_GITHUB_TOKEN;

  if (!token) {
    return {
      service: 'github',
      status: 'skipped',
      message: 'GITHUB_TOKEN not set',
      duration_ms: Date.now() - start,
    };
  }

  try {
    const res = await fetch('https://api.github.com/user', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
    if (res.status !== 200) {
      return {
        service: 'github',
        status: 'fail',
        message: `GET /user returned ${res.status}`,
        duration_ms: Date.now() - start,
      };
    }
    const json = (await res.json()) as { login?: string };
    if (!json?.login) {
      return {
        service: 'github',
        status: 'fail',
        message: 'login field missing in response',
        duration_ms: Date.now() - start,
      };
    }
    return {
      service: 'github',
      status: 'pass',
      message: `Authenticated as ${json.login}`,
      duration_ms: Date.now() - start,
    };
  } catch (err) {
    return {
      service: 'github',
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      duration_ms: Date.now() - start,
    };
  }
}
