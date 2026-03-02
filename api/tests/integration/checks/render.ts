import type { CheckResult } from '../types.js';

export async function checkRender(): Promise<CheckResult> {
  const start = Date.now();
  const name = 'render';

  const apiKey = process.env.RENDER_API_KEY;

  if (!apiKey) {
    return {
      name,
      status: 'skip',
      message: 'RENDER_API_KEY is not set',
      durationMs: Date.now() - start,
    };
  }

  try {
    const response = await fetch('https://api.render.com/v1/owners?limit=1', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(4000),
    });

    if (response.ok) {
      return {
        name,
        status: 'ok',
        message: `Render API reachable (HTTP ${response.status})`,
        durationMs: Date.now() - start,
      };
    }

    return {
      name,
      status: 'fail',
      message: `Render API returned HTTP ${response.status}`,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      name,
      status: 'fail',
      message: `Render API check failed: ${message}`,
      durationMs: Date.now() - start,
    };
  }
}
