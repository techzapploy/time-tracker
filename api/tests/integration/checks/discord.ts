import type { CheckResult } from '../types.js';

export async function checkDiscord(): Promise<CheckResult> {
  const start = Date.now();
  const token = process.env['DISCORD_TOKEN'];
  if (!token) {
    return {
      name: 'discord',
      status: 'skip',
      reason: 'DISCORD_TOKEN not set',
      duration_ms: Date.now() - start,
    };
  }
  try {
    const response = await fetch('https://discord.com/api/v10/users/@me', {
      headers: { Authorization: `Bot ${token}` },
    });
    if (response.status === 200) {
      const data = (await response.json()) as { username?: string };
      return {
        name: 'discord',
        status: 'pass',
        reason: data.username,
        duration_ms: Date.now() - start,
      };
    }
    return {
      name: 'discord',
      status: 'fail',
      reason: `HTTP ${response.status}`,
      duration_ms: Date.now() - start,
    };
  } catch (err) {
    return {
      name: 'discord',
      status: 'fail',
      reason: err instanceof Error ? err.message : String(err),
      duration_ms: Date.now() - start,
    };
  }
}
