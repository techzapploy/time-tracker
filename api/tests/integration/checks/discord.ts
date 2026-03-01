export interface CheckResult {
  name: string;
  status: 'ok' | 'failed' | 'skipped';
  message: string;
  durationMs: number;
}

export async function check(): Promise<CheckResult> {
  const name = 'Discord';
  const token = process.env['DISCORD_TOKEN'];

  if (!token || token.trim() === '') {
    return { name, status: 'skipped', message: 'DISCORD_TOKEN not set', durationMs: 0 };
  }

  const start = Date.now();

  try {
    const response = await fetch('https://discord.com/api/v10/users/@me', {
      headers: {
        Authorization: `Bot ${token}`,
      },
    });

    if (response.ok) {
      return { name, status: 'ok', message: 'Authentication successful', durationMs: Date.now() - start };
    }

    return {
      name,
      status: 'failed',
      message: `HTTP ${response.status}: ${response.statusText}`,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { name, status: 'failed', message, durationMs: Date.now() - start };
  }
}
