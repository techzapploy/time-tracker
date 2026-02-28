import type { CheckResult } from '../types.js';

export async function checkDiscord(): Promise<CheckResult> {
  const service = 'Discord';
  const start = Date.now();
  const webhookUrl = process.env['DISCORD_WEBHOOK_URL'];
  if (!webhookUrl) {
    return { service, status: 'fail', message: 'Environment variable DISCORD_WEBHOOK_URL is not set', durationMs: Date.now() - start };
  }
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'Integration test ping' }),
      signal: AbortSignal.timeout(10000),
    });
    if (response.status === 204) {
      return { service, status: 'pass', message: 'Webhook POST returned 204', durationMs: Date.now() - start };
    }
    return { service, status: 'fail', message: `Unexpected status: ${response.status}`, durationMs: Date.now() - start };
  } catch (err) {
    return { service, status: 'fail', message: err instanceof Error ? err.message : String(err), durationMs: Date.now() - start };
  }
}
