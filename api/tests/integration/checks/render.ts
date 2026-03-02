import type { CheckResult } from '../types.js';

export async function checkRender(): Promise<CheckResult> {
  const start = Date.now();
  const apiKey = process.env['RENDER_API_KEY'];
  if (!apiKey) {
    return {
      name: 'render',
      status: 'skip',
      reason: 'RENDER_API_KEY not set',
      duration_ms: Date.now() - start,
    };
  }
  try {
    const response = await fetch('https://api.render.com/v1/services', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (response.status === 200) {
      return {
        name: 'render',
        status: 'pass',
        duration_ms: Date.now() - start,
      };
    }
    if (response.status === 401) {
      return {
        name: 'render',
        status: 'fail',
        reason: 'Unauthorized: invalid API key',
        duration_ms: Date.now() - start,
      };
    }
    return {
      name: 'render',
      status: 'fail',
      reason: `HTTP ${response.status}`,
      duration_ms: Date.now() - start,
    };
  } catch (err) {
    return {
      name: 'render',
      status: 'fail',
      reason: err instanceof Error ? err.message : String(err),
      duration_ms: Date.now() - start,
    };
  }
}
