import type { CheckResult } from '../types.js';

const name = 'GitHub';

export default async function checkGitHub(): Promise<CheckResult> {
  const start = Date.now();
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return { name, status: 'skip', reason: 'GITHUB_TOKEN not set', duration_ms: Date.now() - start };
  }

  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'TimeTracker Integration Test',
      },
    });

    const duration_ms = Date.now() - start;

    if (response.ok) {
      const data = (await response.json()) as { login?: string };
      return {
        name,
        status: 'pass',
        reason: `Authenticated as ${data.login || 'unknown'}`,
        duration_ms,
      };
    } else {
      const body = await response.text();
      return {
        name,
        status: 'fail',
        reason: `HTTP ${response.status}: ${body}`,
        duration_ms,
      };
    }
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    return {
      name,
      status: 'fail',
      reason: `Request failed: ${reason}`,
      duration_ms: Date.now() - start,
    };
  }
}
