import type { CheckResult } from '../types.js';

const name = 'Render';

export default async function checkRender(): Promise<CheckResult> {
  const start = Date.now();
  const apiKey = process.env.RENDER_API_KEY;

  if (!apiKey) {
    return { name, status: 'skip', reason: 'RENDER_API_KEY not set', duration_ms: Date.now() - start };
  }

  try {
    const response = await fetch('https://api.render.com/v1/services', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
    });

    const duration_ms = Date.now() - start;

    if (response.ok) {
      return {
        name,
        status: 'pass',
        reason: 'API key authenticated successfully',
        duration_ms,
      };
    } else if (response.status === 401) {
      return {
        name,
        status: 'fail',
        reason: 'Invalid API key (401 Unauthorized)',
        duration_ms,
      };
    } else {
      const body = await response.text();
      return {
        name,
        status: 'fail',
        reason: `HTTP ${response.status}: ${body}`,
        duration_ms,
      };
    }
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    return {
      name,
      status: 'fail',
      reason: `Request failed: ${reason}`,
      duration_ms: Date.now() - start,
    };
  }
}
