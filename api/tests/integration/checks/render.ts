import type { CheckResult } from '../types.js';

export async function checkRender(): Promise<CheckResult> {
  const start = Date.now();
  const apiKey = process.env.RENDER_API_KEY;

  if (!apiKey) {
    return {
      service: 'render',
      status: 'skipped',
      message: 'RENDER_API_KEY not set',
      duration_ms: Date.now() - start,
    };
  }

  try {
    const res = await fetch('https://api.render.com/v1/owners?limit=1', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
    });
    if (res.status >= 200 && res.status < 300) {
      return {
        service: 'render',
        status: 'pass',
        message: `GET /v1/owners returned ${res.status}`,
        duration_ms: Date.now() - start,
      };
    }
    return {
      service: 'render',
      status: 'fail',
      message: `GET /v1/owners returned ${res.status}`,
      duration_ms: Date.now() - start,
    };
  } catch (err) {
    return {
      service: 'render',
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      duration_ms: Date.now() - start,
    };
  }
}
