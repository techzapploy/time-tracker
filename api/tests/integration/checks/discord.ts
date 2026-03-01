import type { CheckResult } from '../types.js';

export async function checkDiscord(): Promise<CheckResult> {
  const timestamp = new Date().toISOString();
  const token = process.env.DISCORD_TOKEN;
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!token && !webhookUrl) {
    return { service: 'Discord', status: 'skip', message: 'DISCORD_TOKEN and DISCORD_WEBHOOK_URL not set', timestamp };
  }

  try {
    if (token) {
      const res = await fetch('https://discord.com/api/v10/users/@me', {
        headers: { Authorization: `Bot ${token}` },
      });
      if (res.ok) {
        return { service: 'Discord', status: 'pass', message: 'Bot token valid', timestamp };
      }
      return { service: 'Discord', status: 'fail', message: `HTTP ${res.status} from Discord API`, timestamp };
    }

    const res = await fetch(webhookUrl!);
    if (res.ok) {
      return { service: 'Discord', status: 'pass', message: 'Webhook URL reachable', timestamp };
    }
    return { service: 'Discord', status: 'fail', message: `HTTP ${res.status} from webhook URL`, timestamp };
  } catch (err) {
    return { service: 'Discord', status: 'fail', message: err instanceof Error ? err.message : String(err), timestamp };
  }
}
