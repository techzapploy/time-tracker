import type { CheckResult } from '../types.js';

const name = 'Discord';

export default async function checkDiscord(): Promise<CheckResult> {
  const start = Date.now();
  const token = process.env.DISCORD_TOKEN;

  if (!token) {
    return { name, status: 'skip', reason: 'DISCORD_TOKEN not set', duration_ms: Date.now() - start };
  }

  try {
    const response = await fetch('https://discord.com/api/v10/users/@me', {
      headers: {
        Authorization: `Bot ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'TimeTracker Integration Test (https://github.com/techzapploy/time-tracker)',
      },
    });

    const duration_ms = Date.now() - start;

    if (response.ok) {
      const data = (await response.json()) as { username?: string };
      return {
        name,
        status: 'pass',
        reason: `Authenticated as ${data.username || 'unknown'}`,
        duration_ms,
      };
    } else {
      const body = await response.text();
      return {
        name,
        status: 'fail',
        reason: `HTTP ${response.status}: ${body}`,
        duration_ms,
      };
    }
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    return {
      name,
      status: 'fail',
      reason: `Request failed: ${reason}`,
      duration_ms: Date.now() - start,
    };
  }
}
