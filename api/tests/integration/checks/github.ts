import type { CheckResult } from './database.js';

export async function checkGitHub(): Promise<CheckResult> {
  const start = Date.now();
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return { name: 'GitHub', status: 'skipped', message: 'GITHUB_TOKEN not set', durationMs: Date.now() - start };
  }

  try {
    const res = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'integration-test' },
      signal: AbortSignal.timeout(10000),
    });
    if (res.status === 200) {
      return { name: 'GitHub', status: 'pass', message: `HTTP ${res.status}`, durationMs: Date.now() - start };
    }
    return { name: 'GitHub', status: 'fail', message: `HTTP ${res.status}`, durationMs: Date.now() - start };
  } catch (err) {
    return { name: 'GitHub', status: 'fail', message: err instanceof Error ? err.message : String(err), durationMs: Date.now() - start };
  }
}
