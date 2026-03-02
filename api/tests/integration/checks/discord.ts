import type { CheckResult } from '../types.js';

export async function checkDiscord(): Promise<CheckResult> {
  const url = process.env['DISCORD_WEBHOOK_URL'];
  if (!url) {
    return { service: 'discord', status: 'skipped', durationMs: 0 };
  }

  const start = Date.now();
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (response.ok) {
      return { service: 'discord', status: 'ok', durationMs: Date.now() - start };
    }
    return {
      service: 'discord',
      status: 'failed',
      message: `HTTP ${response.status}`,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { service: 'discord', status: 'failed', message, durationMs: Date.now() - start };
  }
}
