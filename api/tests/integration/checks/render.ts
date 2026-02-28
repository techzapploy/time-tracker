import type { CheckResult } from '../types.js';

export async function checkRender(): Promise<CheckResult> {
  const start = Date.now();
  const service = 'render';

  const apiKey = process.env['RENDER_API_KEY'];
  if (!apiKey) {
    return {
      service,
      status: 'skipped',
      message: 'RENDER_API_KEY not set',
      duration_ms: Date.now() - start,
    };
  }

  try {
    const response = await fetch('https://api.render.com/v1/owners?limit=1', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(10000),
    });

    if (response.status >= 200 && response.status < 300) {
      return {
        service,
        status: 'pass',
        message: `Render API reachable (HTTP ${response.status})`,
        duration_ms: Date.now() - start,
      };
    } else {
      return {
        service,
        status: 'fail',
        message: `HTTP ${response.status}`,
        duration_ms: Date.now() - start,
      };
    }
  } catch (err) {
    return {
      service,
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      duration_ms: Date.now() - start,
    };
  }
}
