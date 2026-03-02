interface CheckResult {
  name: string;
  status: 'ok' | 'failed' | 'skipped';
  message: string;
  durationMs?: number;
}

export async function checkDiscord(): Promise<CheckResult> {
  const name = 'Discord';
  const token = process.env.DISCORD_TOKEN;

  if (!token) {
    return { name, status: 'skipped', message: 'DISCORD_TOKEN not set' };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch('https://discord.com/api/v10/users/@me', {
      headers: { Authorization: `Bot ${token}` },
      signal: controller.signal,
    });

    if (!res.ok) {
      return { name, status: 'failed', message: `HTTP ${res.status}` };
    }

    return { name, status: 'ok', message: 'Connected successfully' };
  } catch (err) {
    return { name, status: 'failed', message: String(err) };
  } finally {
    clearTimeout(timeout);
  }
}
