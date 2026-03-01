import { ServiceCheckResult, sanitizeError, fetchWithTimeout } from './types.js';

export async function checkDiscord(): Promise<ServiceCheckResult> {
  const timestamp = new Date().toISOString();
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  const botToken = process.env.DISCORD_BOT_TOKEN;

  if (!webhookUrl && !botToken) {
    return { service: 'Discord', status: 'skip', message: 'DISCORD_WEBHOOK_URL and DISCORD_BOT_TOKEN not set', timestamp };
  }

  try {
    if (webhookUrl) {
      const res = await fetchWithTimeout(webhookUrl, { method: 'GET' });
      if (res.ok || res.status === 200) {
        return { service: 'Discord', status: 'pass', message: 'Webhook URL reachable', timestamp };
      }
      return { service: 'Discord', status: 'fail', message: `Webhook URL returned HTTP ${res.status}`, timestamp };
    }

    const res = await fetchWithTimeout('https://discord.com/api/v10/users/@me', {
      method: 'GET',
      headers: { Authorization: `Bot ${botToken}` },
    });
    if (res.ok) {
      return { service: 'Discord', status: 'pass', message: 'Bot token valid', timestamp };
    }
    return { service: 'Discord', status: 'fail', message: `Bot token returned HTTP ${res.status}`, timestamp };
  } catch (error) {
    return { service: 'Discord', status: 'fail', message: sanitizeError(error), timestamp };
  }
}
