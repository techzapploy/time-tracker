export interface CheckResult {
  name: string;
  status: 'ok' | 'failed' | 'skipped';
  message: string;
  durationMs?: number;
}

export async function checkDiscord(): Promise<CheckResult> {
  const token = process.env.DISCORD_TOKEN;

  if (!token) {
    return {
      name: 'Discord',
      status: 'skipped',
      message: 'DISCORD_TOKEN not set, skipping',
    };
  }

  const start = Date.now();

  try {
    const response = await fetch('https://discord.com/api/v10/users/@me', {
      headers: {
        Authorization: `Bot ${token}`,
      },
      signal: AbortSignal.timeout(10000),
    });

    const durationMs = Date.now() - start;

    if (response.ok) {
      return {
        name: 'Discord',
        status: 'ok',
        message: `Discord API reachable (HTTP ${response.status})`,
        durationMs,
      };
    } else {
      return {
        name: 'Discord',
        status: 'failed',
        message: `Discord API returned HTTP ${response.status}`,
        durationMs,
      };
    }
  } catch (err) {
    const durationMs = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    return {
      name: 'Discord',
      status: 'failed',
      message: `Request failed: ${message}`,
      durationMs,
    };
  }
}
