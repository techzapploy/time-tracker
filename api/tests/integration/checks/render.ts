import type { CheckResult } from '../runner.js';

export default async function check(): Promise<CheckResult> {
  const key = process.env.RENDER_API_KEY;
  if (!key) return { service: 'Render', status: 'skipped', message: 'RENDER_API_KEY not set' };
  try {
    const res = await fetch('https://api.render.com/v1/owners?limit=1', {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (res.status === 200) {
      return { service: 'Render', status: 'passed', message: 'API key valid' };
    }
    return { service: 'Render', status: 'failed', message: `HTTP ${res.status}` };
  } catch (err) {
    return { service: 'Render', status: 'failed', message: (err as Error).message };
  }
}
