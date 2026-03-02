import type { CheckResult } from '../runner.js';

export default async function check(): Promise<CheckResult> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return { service: 'GitHub', status: 'skipped', message: 'GITHUB_TOKEN not set' };
  try {
    const res = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'integration-check' },
    });
    if (res.status === 200) {
      const body = await res.json() as { login: string };
      return { service: 'GitHub', status: 'passed', message: `Authenticated as ${body.login}` };
    }
    return { service: 'GitHub', status: 'failed', message: `HTTP ${res.status}` };
  } catch (err) {
    return { service: 'GitHub', status: 'failed', message: (err as Error).message };
  }
}
