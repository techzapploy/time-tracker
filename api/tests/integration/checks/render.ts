import type { CheckResult } from '../types.js';

export async function checkRender(): Promise<CheckResult> {
  const apiKey = process.env['RENDER_API_KEY'];
  if (!apiKey) {
    return { service: 'render', status: 'skipped', durationMs: 0 };
  }

  const start = Date.now();
  try {
    const response = await fetch('https://api.render.com/v1/services?limit=1', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(4000),
    });
    if (response.status === 200) {
      return { service: 'render', status: 'ok', durationMs: Date.now() - start };
    }
    return {
      service: 'render',
      status: 'failed',
      message: `HTTP ${response.status}`,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { service: 'render', status: 'failed', message, durationMs: Date.now() - start };
  }
}
