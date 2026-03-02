import type { CheckResult } from '../types.js';

export async function checkGitHub(): Promise<CheckResult> {
  const token = process.env['GITHUB_TOKEN'];
  if (!token) {
    return { service: 'github', status: 'skipped', durationMs: 0 };
  }

  const start = Date.now();
  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'integration-test',
      },
      signal: AbortSignal.timeout(4000),
    });
    if (response.status === 200) {
      return { service: 'github', status: 'ok', durationMs: Date.now() - start };
    }
    return {
      service: 'github',
      status: 'failed',
      message: `HTTP ${response.status}`,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { service: 'github', status: 'failed', message, durationMs: Date.now() - start };
  }
}
