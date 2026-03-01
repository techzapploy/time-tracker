import type { CheckResult } from './database.js';

export async function checkDiscord(): Promise<CheckResult> {
  const name = 'Discord';
  const start = Date.now();

  const token = process.env['DISCORD_BOT_TOKEN'];
  if (!token) {
    return {
      name,
      status: 'skipped',
      message: 'DISCORD_BOT_TOKEN env var is not set',
      durationMs: Date.now() - start,
    };
  }

  try {
    const response = await fetch('https://discord.com/api/v10/users/@me', {
      method: 'GET',
      headers: {
        Authorization: `Bot ${token}`,
      },
      signal: AbortSignal.timeout(10000),
    });

    if (response.status === 200) {
      return {
        name,
        status: 'pass',
        message: 'Discord API reachable and token valid',
        durationMs: Date.now() - start,
      };
    }

    return {
      name,
      status: 'fail',
      message: `Unexpected HTTP status: ${response.status}`,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    return {
      name,
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
    };
  }
}
