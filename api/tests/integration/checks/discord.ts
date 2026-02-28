import type { CheckResult } from '../types.js';

export async function checkDiscord(): Promise<CheckResult> {
  const service = 'Discord';
  const webhookUrl = process.env['DISCORD_WEBHOOK_URL'];

  if (!webhookUrl) {
    return {
      service,
      passed: true,
      skipped: true,
      message: 'DISCORD_WEBHOOK_URL is not set — skipping Discord check',
    };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: 'Integration test ping from daily-integration-test runner',
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (response.ok || response.status === 204) {
      return {
        service,
        passed: true,
        message: `Discord webhook POST succeeded with status ${response.status}`,
      };
    } else {
      const body = await response.text();
      return {
        service,
        passed: false,
        message: `Discord webhook POST failed with status ${response.status}: ${body}`,
      };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      service,
      passed: false,
      message: `Discord webhook request failed: ${message}`,
    };
  }
}
