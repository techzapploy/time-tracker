import { sanitize } from '../utils/sanitize.ts';
import type { ServiceResult } from '../utils/report.ts';

export async function checkGitHub(): Promise<ServiceResult> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return { name: 'GitHub', status: 'SKIPPED', details: 'GITHUB_TOKEN not set' };

  const start = Date.now();
  try {
    const res = await fetch('https://api.github.com/rate_limit', {
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'clockify-integration-test',
      },
      signal: AbortSignal.timeout(10000),
    });
    return {
      name: 'GitHub',
      status: res.ok ? 'UP' : 'DOWN',
      latency: Date.now() - start,
      details: `HTTP ${res.status}`,
    };
  } catch (err) {
    return { name: 'GitHub', status: 'DOWN', error: sanitize(String(err)) };
  }
}
