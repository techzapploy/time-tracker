import type { CheckResult } from './types.js';

export async function checkDiscord(): Promise<CheckResult> {
  const start = Date.now();
  const service = 'discord';
  const webhookUrl = process.env['DISCORD_WEBHOOK_URL'];

  if (!webhookUrl) {
    return {
      service,
      status: 'skip',
      message: 'DISCORD_WEBHOOK_URL not set',
      duration: Date.now() - start,
    };
  }

  try {
    const response = await fetch(webhookUrl, { method: 'GET' });
    return {
      service,
      status: 'pass',
      message: `Webhook URL reachable (HTTP ${response.status})`,
      duration: Date.now() - start,
    };
  } catch (err) {
    return {
      service,
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      duration: Date.now() - start,
    };
  }
}
