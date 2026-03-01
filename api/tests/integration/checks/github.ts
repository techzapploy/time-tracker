import type { CheckResult } from '../types.js';

export async function checkGitHub(): Promise<CheckResult> {
  const timestamp = new Date().toISOString();
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return { service: 'GitHub', status: 'skip', message: 'GITHUB_TOKEN not set', timestamp };
  }

  try {
    const res = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'integration-check/1.0' },
    });
    if (res.ok) {
      return { service: 'GitHub', status: 'pass', message: 'Token valid', timestamp };
    }
    return { service: 'GitHub', status: 'fail', message: `HTTP ${res.status} from GitHub API`, timestamp };
  } catch (err) {
    return { service: 'GitHub', status: 'fail', message: err instanceof Error ? err.message : String(err), timestamp };
  }
}
