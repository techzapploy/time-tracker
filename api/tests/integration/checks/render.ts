import type { CheckResult } from '../types.js';

export async function checkRender(): Promise<CheckResult> {
  const start = Date.now();
  const service = 'Render';

  const apiKey = process.env['RENDER_API_KEY'];

  if (!apiKey) {
    return {
      service,
      status: 'skip',
      message: 'RENDER_API_KEY is not set',
      durationMs: Date.now() - start,
    };
  }

  try {
    const response = await fetch('https://api.render.com/v1/services', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (response.ok) {
      return {
        service,
        status: 'pass',
        message: `API reachable (HTTP ${response.status})`,
        durationMs: Date.now() - start,
      };
    }

    return {
      service,
      status: 'fail',
      message: `API returned HTTP ${response.status}`,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      service,
      status: 'fail',
      message: `Request failed: ${message}`,
      durationMs: Date.now() - start,
    };
  }
}
