import type { CheckResult } from '../types.js';

export async function checkDiscord(): Promise<CheckResult> {
  const service = 'Discord';
  const start = Date.now();

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    return {
      service,
      status: 'skip',
      duration: Date.now() - start,
      message: 'DISCORD_WEBHOOK_URL not set',
    };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(10000),
    });

    const duration = Date.now() - start;

    // Discord returns 200 for GET on a valid webhook URL
    if (response.ok) {
      return {
        service,
        status: 'pass',
        duration,
        message: `Webhook URL is valid (HTTP ${response.status})`,
      };
    }

    return {
      service,
      status: 'fail',
      duration,
      message: `Unexpected response: HTTP ${response.status}`,
    };
  } catch (err) {
    const duration = Date.now() - start;
    const message =
      err instanceof Error ? err.message : 'Unknown error checking Discord webhook';
    return {
      service,
      status: 'fail',
      duration,
      message,
    };
  }
}
