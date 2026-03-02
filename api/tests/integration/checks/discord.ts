import type { CheckResult } from '../types.js';

export async function checkDiscord(): Promise<CheckResult> {
  const start = Date.now();
  const token = process.env.DISCORD_BOT_TOKEN;

  if (!token) {
    return {
      name: 'discord',
      status: 'skip',
      message: 'DISCORD_BOT_TOKEN not set',
      durationMs: Date.now() - start,
    };
  }

  try {
    const response = await fetch('https://discord.com/api/v10/users/@me', {
      headers: {
        Authorization: `Bot ${token}`,
      },
    });

    if (!response.ok) {
      return {
        name: 'discord',
        status: 'fail',
        message: `HTTP ${response.status}: ${response.statusText}`,
        durationMs: Date.now() - start,
      };
    }

    return {
      name: 'discord',
      status: 'pass',
      message: 'Discord API reachable and token valid',
      durationMs: Date.now() - start,
    };
  } catch (err) {
    return {
      name: 'discord',
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
    };
  }
}
