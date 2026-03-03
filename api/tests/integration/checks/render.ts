import type { CheckResult } from './types.js';

export async function checkRender(): Promise<CheckResult> {
  const start = Date.now();
  const service = 'render';
  const apiKey = process.env['RENDER_API_KEY'];

  if (!apiKey) {
    return {
      service,
      status: 'skip',
      message: 'RENDER_API_KEY not set',
      duration: Date.now() - start,
    };
  }

  try {
    const response = await fetch('https://api.render.com/v1/services', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return {
        service,
        status: 'fail',
        message: `Render API returned HTTP ${response.status}`,
        duration: Date.now() - start,
      };
    }

    return {
      service,
      status: 'pass',
      message: `Render API reachable and authenticated (HTTP ${response.status})`,
      duration: Date.now() - start,
    };
  } catch (err) {
    return {
      service,
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      duration: Date.now() - start,
    };
  }
}
