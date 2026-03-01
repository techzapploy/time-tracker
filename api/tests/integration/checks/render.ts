import type { CheckResult } from '../types.js';

export async function checkRender(): Promise<CheckResult> {
  const service = 'Render';
  const start = Date.now();

  const apiKey = process.env.RENDER_API_KEY;

  if (!apiKey) {
    return {
      service,
      status: 'skip',
      duration: Date.now() - start,
      message: 'RENDER_API_KEY not set',
    };
  }

  try {
    const response = await fetch('https://api.render.com/v1/services', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });

    const duration = Date.now() - start;

    if (response.status === 200) {
      return {
        service,
        status: 'pass',
        duration,
        message: `Connected to Render API (HTTP ${response.status})`,
      };
    }

    return {
      service,
      status: 'fail',
      duration,
      message: `Unexpected response: HTTP ${response.status}`,
    };
  } catch (err) {
    const duration = Date.now() - start;
    const message =
      err instanceof Error ? err.message : 'Unknown error checking Render API';
    return {
      service,
      status: 'fail',
      duration,
      message,
    };
  }
}
