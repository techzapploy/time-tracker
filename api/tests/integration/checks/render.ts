import type { CheckResult } from '../types.js';

export async function checkRender(): Promise<CheckResult> {
  const start = Date.now();
  const apiKey = process.env.RENDER_API_KEY;

  if (!apiKey) {
    return {
      name: 'render',
      status: 'skip',
      message: 'RENDER_API_KEY not set',
      durationMs: Date.now() - start,
    };
  }

  try {
    const response = await fetch('https://api.render.com/v1/owners?limit=1', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return {
        name: 'render',
        status: 'fail',
        message: `HTTP ${response.status}: ${response.statusText}`,
        durationMs: Date.now() - start,
      };
    }

    return {
      name: 'render',
      status: 'pass',
      message: 'Render API reachable and token valid',
      durationMs: Date.now() - start,
    };
  } catch (err) {
    return {
      name: 'render',
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
    };
  }
}
