import type { CheckResult } from '../types';

export async function checkDiscord(): Promise<CheckResult> {
  const start = Date.now();

  if (!process.env.DISCORD_WEBHOOK_URL) {
    return {
      name: 'discord',
      status: 'skip',
      message: 'DISCORD_WEBHOOK_URL is not set',
      durationMs: Date.now() - start,
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(process.env.DISCORD_WEBHOOK_URL, {
      method: 'GET',
      signal: controller.signal,
    });

    if (response.status === 200) {
      return {
        name: 'discord',
        status: 'pass',
        message: 'Webhook URL reachable (HTTP 200)',
        durationMs: Date.now() - start,
      };
    }

    return {
      name: 'discord',
      status: 'fail',
      message: `Unexpected status code: ${response.status}`,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    return {
      name: 'discord',
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
    };
  } finally {
    clearTimeout(timeout);
  }
}
