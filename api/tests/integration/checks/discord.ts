import type { CheckResult } from '../types.js';

export async function checkDiscord(): Promise<CheckResult> {
  const name = 'Discord';
  const start = Date.now();

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    return { name, status: 'skipped', message: 'DISCORD_WEBHOOK_URL not set', durationMs: 0 };
  }

  try {
    const response = await fetch(webhookUrl, {
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

    const data = await response.json() as { id?: string; name?: string };
    return {
      name,
      status: 'pass',
      message: `Webhook reachable: id=${data.id ?? 'unknown'}, name=${data.name ?? 'unknown'}`,
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
