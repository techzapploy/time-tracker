import type { CheckResult } from './database.js';

export async function checkRender(): Promise<CheckResult> {
  const start = Date.now();
  const name = 'Render';

  const apiKey = process.env['RENDER_API_KEY'];
  if (!apiKey) {
    return { name, status: 'skipped', message: 'RENDER_API_KEY is not set', durationMs: Date.now() - start };
  }

  try {
    const response = await fetch('https://api.render.com/v1/services?limit=1', {
      headers: { Authorization: `Bearer ${apiKey}` },
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
