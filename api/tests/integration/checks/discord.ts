import type { CheckResult } from '../types.js';

export async function checkDiscord(): Promise<CheckResult> {
  const start = Date.now();
  const service = 'Discord';

  const webhookUrl = process.env['DISCORD_WEBHOOK_URL'];

  if (!webhookUrl) {
    return {
      service,
      status: 'skip',
      message: 'DISCORD_WEBHOOK_URL is not set',
      durationMs: Date.now() - start,
    };
  }

  try {
    const response = await fetch(webhookUrl, { method: 'GET' });

    if (response.ok) {
      return {
        service,
        status: 'pass',
        message: `Webhook reachable (HTTP ${response.status})`,
        durationMs: Date.now() - start,
      };
    }

    return {
      service,
      status: 'fail',
      message: `Webhook returned HTTP ${response.status}`,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      service,
      status: 'fail',
      message: `Request failed: ${message}`,
      durationMs: Date.now() - start,
    };
  }
}
