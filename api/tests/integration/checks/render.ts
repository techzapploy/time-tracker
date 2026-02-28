import type { CheckResult } from './database.js';

export async function checkRender(): Promise<CheckResult> {
  const start = Date.now();
  const key = process.env.RENDER_API_KEY;

  if (!key) {
    return { name: 'Render', status: 'skipped', message: 'RENDER_API_KEY not set', durationMs: Date.now() - start };
  }

  try {
    const res = await fetch('https://api.render.com/v1/services?limit=1', {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(10000),
    });
    if (res.status === 200) {
      return { name: 'Render', status: 'pass', message: `HTTP ${res.status}`, durationMs: Date.now() - start };
    }
    return { name: 'Render', status: 'fail', message: `HTTP ${res.status}`, durationMs: Date.now() - start };
  } catch (err) {
    return { name: 'Render', status: 'fail', message: err instanceof Error ? err.message : String(err), durationMs: Date.now() - start };
  }
}
