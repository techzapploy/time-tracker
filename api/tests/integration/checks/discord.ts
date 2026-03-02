/**
 * Discord Integration Check
 *
 * Verifies the Discord bot token is valid by calling the Discord API.
 * Skips gracefully if DISCORD_BOT_TOKEN is not set.
 */

import type { CheckResult } from '../runner.js';

export async function checkDiscord(): Promise<CheckResult> {
  const name = 'Discord';

  const token = process.env.DISCORD_BOT_TOKEN || process.env.DISCORD_TOKEN;

  if (!token) {
    return {
      name,
      status: 'skipped',
      message: 'DISCORD_BOT_TOKEN not set - skipping Discord check',
      durationMs: 0,
    };
  }

  try {
    const response = await fetch('https://discord.com/api/v10/users/@me', {
      headers: {
        Authorization: `Bot ${token}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(4000),
    });

    if (response.ok) {
      const data = (await response.json()) as { username: string; id: string };
      return {
        name,
        status: 'passed',
        message: `Connected as bot "${data.username}" (ID: ${data.id})`,
        durationMs: 0,
      };
    } else {
      const errorText = await response.text();
      return {
        name,
        status: 'failed',
        message: `Discord API returned ${response.status}`,
        durationMs: 0,
        error: errorText,
      };
    }
  } catch (err) {
    return {
      name,
      status: 'failed',
      message: 'Failed to reach Discord API',
      durationMs: 0,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
