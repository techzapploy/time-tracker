import type { CheckResult } from '../types.js';

export async function check(): Promise<CheckResult> {
  const timestamp = new Date().toISOString();
  const service = 'Discord';

  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) {
    return { service, status: 'skip', message: 'DISCORD_WEBHOOK_URL not set', timestamp };
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'Integration test ping' }),
    });

    if (res.status >= 500) {
      return { service, status: 'fail', message: `Server error: HTTP ${res.status}`, timestamp };
    }

    // 200, 204, or 400 all confirm connectivity
    return { service, status: 'pass', message: `HTTP ${res.status}`, timestamp };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error';
    return { service, status: 'fail', message, timestamp };
  }
}
