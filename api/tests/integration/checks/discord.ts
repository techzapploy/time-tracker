import type { CheckResult } from './database.js';

export async function checkDiscord(): Promise<CheckResult> {
  const start = Date.now();
  const token = process.env.DISCORD_BOT_TOKEN;

  if (!token) {
    return { name: 'Discord', status: 'skipped', message: 'DISCORD_BOT_TOKEN not set', durationMs: Date.now() - start };
  }

  try {
    const res = await fetch('https://discord.com/api/v10/users/@me', {
      headers: { Authorization: `Bot ${token}` },
      signal: AbortSignal.timeout(10000),
    });
    if (res.status === 200) {
      return { name: 'Discord', status: 'pass', message: `HTTP ${res.status}`, durationMs: Date.now() - start };
    }
    return { name: 'Discord', status: 'fail', message: `HTTP ${res.status}`, durationMs: Date.now() - start };
  } catch (err) {
    return { name: 'Discord', status: 'fail', message: err instanceof Error ? err.message : String(err), durationMs: Date.now() - start };
  }
}
