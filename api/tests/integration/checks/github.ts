import type { CheckResult } from './database.js';

export async function checkGitHub(): Promise<CheckResult> {
  const start = Date.now();
  const name = 'GitHub';

  const token = process.env['GITHUB_TOKEN'];
  if (!token) {
    return { name, status: 'skipped', message: 'GITHUB_TOKEN is not set', durationMs: Date.now() - start };
  }

  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'integration-test',
      },
      signal: AbortSignal.timeout(10000),
    });
    if (response.status === 200) {
      return { name, status: 'pass', message: `HTTP ${response.status}`, durationMs: Date.now() - start };
    }
    return { name, status: 'fail', message: `HTTP ${response.status}`, durationMs: Date.now() - start };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { name, status: 'fail', message: `Request failed: ${message}`, durationMs: Date.now() - start };
  }
}
