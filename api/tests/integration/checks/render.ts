import type { CheckResult } from '../types.js';

export async function checkRender(): Promise<CheckResult> {
  const service = 'Render';
  const start = Date.now();
  const apiKey = process.env['RENDER_API_KEY'];
  if (!apiKey) {
    return { service, status: 'fail', message: 'Environment variable RENDER_API_KEY is not set', durationMs: Date.now() - start };
  }
  try {
    const response = await fetch('https://api.render.com/v1/services', {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(10000),
    });
    if (response.status === 200 || response.status === 401) {
      return { service, status: 'pass', message: `GET /v1/services returned ${response.status}`, durationMs: Date.now() - start };
    }
    return { service, status: 'fail', message: `Unexpected status: ${response.status}`, durationMs: Date.now() - start };
  } catch (err) {
    return { service, status: 'fail', message: err instanceof Error ? err.message : String(err), durationMs: Date.now() - start };
  }
}
