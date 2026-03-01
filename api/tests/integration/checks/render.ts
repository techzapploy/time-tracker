import type { CheckResult } from '../types';

export async function checkRender(): Promise<CheckResult> {
  const start = Date.now();

  if (!process.env.RENDER_API_KEY) {
    return {
      name: 'render',
      status: 'skip',
      message: 'RENDER_API_KEY is not set',
      durationMs: Date.now() - start,
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch('https://api.render.com/v1/services', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.RENDER_API_KEY}`,
      },
      signal: controller.signal,
    });

    if (response.status === 200 || response.status === 401) {
      return {
        name: 'render',
        status: 'pass',
        message: `Render API reachable (HTTP ${response.status})`,
        durationMs: Date.now() - start,
      };
    }

    return {
      name: 'render',
      status: 'fail',
      message: `Unexpected status code: ${response.status}`,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    return {
      name: 'render',
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
    };
  } finally {
    clearTimeout(timeout);
  }
}
