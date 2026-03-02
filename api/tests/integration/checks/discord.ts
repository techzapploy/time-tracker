import type { CheckResult } from '../types.js';

export async function checkDiscord(): Promise<CheckResult> {
  const start = Date.now();
  const name = 'discord';

  const token = process.env.DISCORD_BOT_TOKEN;

  if (!token) {
    return {
      name,
      status: 'skip',
      message: 'DISCORD_BOT_TOKEN is not set',
      durationMs: Date.now() - start,
    };
  }

  try {
    const response = await fetch('https://discord.com/api/v10/users/@me', {
      headers: {
        Authorization: `Bot ${token}`,
      },
      signal: AbortSignal.timeout(4000),
    });

    if (response.ok) {
      return {
        name,
        status: 'ok',
        message: `Discord API reachable (HTTP ${response.status})`,
        durationMs: Date.now() - start,
      };
    }

    return {
      name,
      status: 'fail',
      message: `Discord API returned HTTP ${response.status}`,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      name,
      status: 'fail',
      message: `Discord API check failed: ${message}`,
      durationMs: Date.now() - start,
    };
  }
}
