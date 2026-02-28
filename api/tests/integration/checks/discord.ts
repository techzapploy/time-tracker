import type { CheckResult } from '../types.js';

export async function checkDiscord(): Promise<CheckResult> {
  const start = Date.now();
  const service = 'discord';

  const webhookUrl = process.env['DISCORD_WEBHOOK_URL'];
  if (!webhookUrl) {
    return {
      service,
      status: 'skipped',
      message: 'DISCORD_WEBHOOK_URL not set',
      duration_ms: Date.now() - start,
    };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(10000),
    });

    if (response.status >= 200 && response.status < 300) {
      return {
        service,
        status: 'pass',
        message: `Webhook reachable (HTTP ${response.status})`,
        duration_ms: Date.now() - start,
      };
    } else {
      return {
        service,
        status: 'fail',
        message: `HTTP ${response.status}`,
        duration_ms: Date.now() - start,
      };
    }
  } catch (err) {
    return {
      service,
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      duration_ms: Date.now() - start,
    };
  }
}
