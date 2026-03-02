import type { CheckResult } from '../types.js';

export async function check(): Promise<CheckResult> {
  const timestamp = new Date().toISOString();
  const service = 'Render';

  const apiKey = process.env.RENDER_API_KEY;
  if (!apiKey) {
    return { service, status: 'skip', message: 'RENDER_API_KEY not set', timestamp };
  }

  try {
    const res = await fetch('https://api.render.com/v1/services?limit=1', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (res.status >= 500) {
      return { service, status: 'fail', message: `Server error: HTTP ${res.status}`, timestamp };
    }

    // 200 or 401 confirms reachability
    return { service, status: 'pass', message: `HTTP ${res.status}`, timestamp };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error';
    return { service, status: 'fail', message, timestamp };
  }
}
