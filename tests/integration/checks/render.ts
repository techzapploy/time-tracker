import { sanitize } from '../utils/sanitize.ts';
import type { ServiceResult } from '../utils/report.ts';

export async function checkRender(): Promise<ServiceResult> {
  const apiKey = process.env.RENDER_API_KEY;
  if (!apiKey) return { name: 'Render', status: 'SKIPPED', details: 'RENDER_API_KEY not set' };

  const start = Date.now();
  try {
    const res = await fetch('https://api.render.com/v1/owners?limit=1', {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(10000),
    });
    return {
      name: 'Render',
      status: res.ok ? 'UP' : 'DOWN',
      latency: Date.now() - start,
      details: `HTTP ${res.status}`,
    };
  } catch (err) {
    return { name: 'Render', status: 'DOWN', error: sanitize(String(err)) };
  }
}
