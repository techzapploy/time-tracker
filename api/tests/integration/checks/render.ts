import type { CheckResult } from './database.js';

export async function checkRender(): Promise<CheckResult> {
  const name = 'Render';
  const start = Date.now();

  const apiKey = process.env['RENDER_API_KEY'];
  if (!apiKey) {
    return {
      name,
      status: 'skipped',
      message: 'RENDER_API_KEY env var is not set',
      durationMs: Date.now() - start,
    };
  }

  try {
    const response = await fetch('https://api.render.com/v1/services?limit=1', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(10000),
    });

    if (response.status === 200) {
      return {
        name,
        status: 'pass',
        message: 'Render API reachable and key valid',
        durationMs: Date.now() - start,
      };
    }

    return {
      name,
      status: 'fail',
      message: `Unexpected HTTP status: ${response.status}`,
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
