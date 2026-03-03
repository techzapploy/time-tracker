interface CheckResult {
  service: string;
  status: 'pass' | 'fail' | 'skip';
  message: string;
  durationMs?: number;
}

export default async function checkDiscord(): Promise<CheckResult> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  const token = process.env.DISCORD_TOKEN;

  if (!webhookUrl && !token) {
    return {
      service: 'discord',
      status: 'skip',
      message: 'DISCORD_WEBHOOK_URL and DISCORD_TOKEN are not set',
    };
  }

  const start = Date.now();
  try {
    // Use token-based auth if available, otherwise check webhook URL validity
    const url = token
      ? 'https://discord.com/api/v10/users/@me'
      : (webhookUrl as string);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bot ${token}`;
    }

    const response = await fetch(url, { method: 'GET', headers });

    if (response.ok || response.status === 405) {
      // 405 Method Not Allowed is acceptable for webhooks (they only accept POST)
      return {
        service: 'discord',
        status: 'pass',
        message: `Discord API reachable (HTTP ${response.status})`,
        durationMs: Date.now() - start,
      };
    }

    return {
      service: 'discord',
      status: 'fail',
      message: `Discord API returned HTTP ${response.status}`,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    return {
      service: 'discord',
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
    };
  }
}
