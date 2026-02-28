import type { CheckResult } from '../types.js';

export default async function checkDiscord(): Promise<CheckResult> {
  const service = 'discord';
  const start = Date.now();

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    return {
      service,
      status: 'skipped',
      message: 'DISCORD_WEBHOOK_URL env var not set',
      duration_ms: Date.now() - start,
    };
  }

  try {
    const response = await fetch(webhookUrl);
    if (!response.ok) {
      return {
        service,
        status: 'fail',
        message: `HTTP ${response.status}: ${response.statusText}`,
        duration_ms: Date.now() - start,
      };
    }

    return {
      service,
      status: 'pass',
      message: `Webhook URL reachable (HTTP ${response.status})`,
      duration_ms: Date.now() - start,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      service,
      status: 'fail',
      message,
      duration_ms: Date.now() - start,
    };
  }
}
