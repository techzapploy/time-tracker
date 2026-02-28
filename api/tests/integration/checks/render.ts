import type { CheckResult } from '../types.js';

export async function checkRender(): Promise<CheckResult> {
  const name = 'Render';
  const start = Date.now();

  const apiKey = process.env.RENDER_API_KEY;
  if (!apiKey) {
    return { name, status: 'skipped', message: 'RENDER_API_KEY not set', durationMs: 0 };
  }

  try {
    const response = await fetch('https://api.render.com/v1/services', {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return {
        name,
        status: 'fail',
        message: `HTTP ${response.status}: ${response.statusText}`,
        durationMs: Date.now() - start,
      };
    }

    const data = await response.json() as unknown[];
    return {
      name,
      status: 'pass',
      message: `Connected to Render API, ${data.length} service(s) found`,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    return {
      name,
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
    };
  }
}
