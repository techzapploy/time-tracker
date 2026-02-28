import type { CheckResult } from '../types.js';

export async function checkGitHub(): Promise<CheckResult> {
  const service = 'GitHub';
  const start = Date.now();
  const token = process.env['GITHUB_TOKEN'];
  if (!token) {
    return { service, status: 'fail', message: 'Environment variable GITHUB_TOKEN is not set', durationMs: Date.now() - start };
  }
  try {
    const response = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'integration-test' },
      signal: AbortSignal.timeout(10000),
    });
    if (response.status === 200) {
      return { service, status: 'pass', message: 'GET /user returned 200', durationMs: Date.now() - start };
    }
    return { service, status: 'fail', message: `Unexpected status: ${response.status}`, durationMs: Date.now() - start };
  } catch (err) {
    return { service, status: 'fail', message: err instanceof Error ? err.message : String(err), durationMs: Date.now() - start };
  }
}
