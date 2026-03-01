import type { ServiceCheckResult } from './types.js';
import { fetchWithTimeout, sanitizeError } from './types.js';

export async function checkDiscord(): Promise<ServiceCheckResult> {
  const timestamp = new Date().toISOString();
  const token = process.env.DISCORD_TOKEN;
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!token && !webhookUrl) {
    return { service: 'Discord', status: 'skip', message: 'No Discord credentials configured', timestamp };
  }

  try {
    if (webhookUrl) {
      const response = await fetchWithTimeout(webhookUrl, { method: 'HEAD' });
      if (response.ok || response.status === 405) {
        return { service: 'Discord', status: 'pass', message: 'Webhook accessible', timestamp };
      }
    }
    if (token) {
      const response = await fetchWithTimeout('https://discord.com/api/v10/users/@me', {
        headers: { Authorization: `Bot ${token}` },
      });
      if (response.ok) {
        return { service: 'Discord', status: 'pass', message: 'Bot token valid', timestamp };
      }
      return { service: 'Discord', status: 'fail', message: `API returned ${response.status}`, timestamp };
    }
    return { service: 'Discord', status: 'fail', message: 'Webhook not accessible', timestamp };
  } catch (error) {
    return { service: 'Discord', status: 'fail', message: sanitizeError(error), timestamp };
  }
}
