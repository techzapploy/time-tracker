import { sanitize } from '../utils/sanitize.ts';
import type { ServiceResult } from '../utils/report.ts';

export async function checkDiscord(): Promise<ServiceResult> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return { name: 'Discord', status: 'SKIPPED', details: 'DISCORD_WEBHOOK_URL not set' };

  const start = Date.now();
  try {
    const res = await fetch(webhookUrl, { signal: AbortSignal.timeout(10000) });
    return {
      name: 'Discord',
      status: res.ok ? 'UP' : 'DOWN',
      latency: Date.now() - start,
      details: `HTTP ${res.status}`,
    };
  } catch (err) {
    return { name: 'Discord', status: 'DOWN', error: sanitize(String(err)) };
  }
}
