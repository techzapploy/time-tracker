import { type ServiceCheckResult, sanitizeError, fetchWithTimeout } from './types.js';

export async function checkDiscord(): Promise<ServiceCheckResult> {
  const timestamp = new Date().toISOString();
  const service = 'discord';

  const webhookUrl = process.env['DISCORD_WEBHOOK_URL'];
  const discordToken = process.env['DISCORD_TOKEN'];

  if (!webhookUrl && !discordToken) {
    return {
      service,
      status: 'skip',
      message: 'Skipped: DISCORD_WEBHOOK_URL and DISCORD_TOKEN are both unset',
      timestamp,
    };
  }

  // Try webhook HEAD first
  if (webhookUrl) {
    try {
      const response = await fetchWithTimeout(webhookUrl, { method: 'HEAD' });

      if (response.ok || response.status === 405) {
        // 405 Method Not Allowed is still a valid response proving connectivity
        return {
          service,
          status: 'pass',
          message: `Discord webhook reachable (HTTP ${response.status})`,
          timestamp,
        };
      }

      if (response.status >= 400 && response.status !== 405) {
        return {
          service,
          status: 'fail',
          message: `Discord webhook returned HTTP ${response.status}`,
          timestamp,
        };
      }

      return {
        service,
        status: 'pass',
        message: `Discord webhook reachable (HTTP ${response.status})`,
        timestamp,
      };
    } catch (error) {
      // If webhook failed and we have a token, fall through to try that
      if (!discordToken) {
        return {
          service,
          status: 'fail',
          message: `Discord webhook check failed: ${sanitizeError(error)}`,
          timestamp,
        };
      }
    }
  }

  // Try bot token GET
  if (discordToken) {
    try {
      const response = await fetchWithTimeout('https://discord.com/api/v10/users/@me', {
        method: 'GET',
        headers: {
          Authorization: `Bot ${discordToken}`,
        },
      });

      if (response.ok) {
        return {
          service,
          status: 'pass',
          message: `Discord bot token valid (HTTP ${response.status})`,
          timestamp,
        };
      }

      return {
        service,
        status: 'fail',
        message: `Discord bot token check returned HTTP ${response.status}`,
        timestamp,
      };
    } catch (error) {
      return {
        service,
        status: 'fail',
        message: `Discord bot token check failed: ${sanitizeError(error)}`,
        timestamp,
      };
    }
  }

  return {
    service,
    status: 'fail',
    message: 'Discord check failed: no valid credentials found',
    timestamp,
  };
}
