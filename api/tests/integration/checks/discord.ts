import type { CheckResult } from '../runner.js';

export default async function check(): Promise<CheckResult> {
  const token = process.env.DISCORD_TOKEN;
  if (!token) return { service: 'Discord', status: 'skipped', message: 'DISCORD_TOKEN not set' };
  try {
    const res = await fetch('https://discord.com/api/v10/users/@me', {
      headers: { Authorization: `Bot ${token}` },
    });
    if (res.status === 200) {
      const body = await res.json() as { username: string };
      return { service: 'Discord', status: 'passed', message: `Authenticated as ${body.username}` };
    }
    return { service: 'Discord', status: 'failed', message: `HTTP ${res.status}` };
  } catch (err) {
    return { service: 'Discord', status: 'failed', message: (err as Error).message };
  }
}
