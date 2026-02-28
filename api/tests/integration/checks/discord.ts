export interface CheckResult {
  service: string;
  passed: boolean;
  error?: string;
}

export async function checkDiscord(): Promise<CheckResult> {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    return { service: 'discord', passed: false, error: 'DISCORD_BOT_TOKEN env var not set' };
  }

  try {
    const response = await fetch('https://discord.com/api/v10/users/@me', {
      headers: {
        Authorization: `Bot ${token}`,
      },
      signal: AbortSignal.timeout(10000),
    });

    if (response.status === 200) {
      return { service: 'discord', passed: true };
    }
    return { service: 'discord', passed: false, error: `HTTP ${response.status}` };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { service: 'discord', passed: false, error: message };
  }
}
