import type { CheckResult } from '../types.js';

export async function checkDiscord(): Promise<CheckResult> {
  const start = Date.now();
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    return {
      service: 'discord',
      status: 'skipped',
      message: 'DISCORD_WEBHOOK_URL not set',
      duration_ms: Date.now() - start,
    };
  }

  try {
    const res = await fetch(webhookUrl, { method: 'GET' });
    if (res.status >= 200 && res.status < 300) {
      return {
        service: 'discord',
        status: 'pass',
        message: `GET webhook returned ${res.status}`,
        duration_ms: Date.now() - start,
      };
    }
    return {
      service: 'discord',
      status: 'fail',
      message: `GET webhook returned ${res.status}`,
      duration_ms: Date.now() - start,
    };
  } catch (err) {
    return {
      service: 'discord',
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      duration_ms: Date.now() - start,
    };
  }
}
