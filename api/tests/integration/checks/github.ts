import type { CheckResult } from '../types';

export async function checkGithub(): Promise<CheckResult> {
  const start = Date.now();

  if (!process.env.GITHUB_TOKEN) {
    return {
      name: 'github',
      status: 'skip',
      message: 'GITHUB_TOKEN is not set',
      durationMs: Date.now() - start,
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch('https://api.github.com/user', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        'User-Agent': 'integration-test',
      },
      signal: controller.signal,
    });

    if (response.status === 200) {
      return {
        name: 'github',
        status: 'pass',
        message: 'GitHub API reachable and authenticated (HTTP 200)',
        durationMs: Date.now() - start,
      };
    }

    return {
      name: 'github',
      status: 'fail',
      message: `Unexpected status code: ${response.status}`,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    return {
      name: 'github',
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
    };
  } finally {
    clearTimeout(timeout);
  }
}
