import type { CheckResult } from '../types.js';

export async function check(): Promise<CheckResult> {
  const timestamp = new Date().toISOString();
  const service = 'GitHub';

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return { service, status: 'skip', message: 'GITHUB_TOKEN not set', timestamp };
  }

  try {
    const res = await fetch('https://api.github.com/rate_limit', {
      headers: {
        Authorization: `token ${token}`,
        'User-Agent': 'integration-test',
      },
    });

    if (res.status === 200) {
      return { service, status: 'pass', message: 'HTTP 200', timestamp };
    }
    return { service, status: 'fail', message: `Unexpected HTTP ${res.status}`, timestamp };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error';
    return { service, status: 'fail', message, timestamp };
  }
}
